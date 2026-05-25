create type exam_type as enum ('JAMB', 'WAEC', 'NECO');
create type session_mode as enum ('practice', 'mock');
create type subscription_plan as enum ('free', 'pro');
create type subscription_status as enum ('active', 'past_due', 'cancelled');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  exam_type exam_type,
  selected_subjects text[],
  target_score integer,
  exam_date date,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam_type exam_type not null,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  exam_type exam_type not null,
  year integer,
  topic text,
  prompt text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  mode session_mode not null,
  score integer,
  total_questions integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_answer text,
  is_correct boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'active',
  current_period_end timestamptz,
  referral_partner_id uuid,
  created_at timestamptz not null default now()
);

-- Lesson center partnerships
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text,
  contact_name text,
  contact_phone text,
  contact_email text,
  commission_percent numeric,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  code text not null unique,
  label text,
  is_active boolean not null default true,
  expires_at timestamptz,
  max_uses integer,
  use_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_referrals (
  user_id uuid primary key references public.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete restrict,
  code text not null,
  applied_at timestamptz not null default now()
);

alter table public.subscriptions
  add constraint subscriptions_referral_partner_id_fkey
  foreign key (referral_partner_id) references public.partners(id) on delete set null;

create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  current_count integer not null default 0,
  longest_count integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now()
);

create table public.weekly_quizzes (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  question_ids uuid[] not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.weekly_quiz_entries (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.weekly_quizzes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  answers jsonb not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(quiz_id, user_id)
);

alter table public.partners enable row level security;
alter table public.referral_codes enable row level security;
alter table public.user_referrals enable row level security;
alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.questions enable row level security;
alter table public.sessions enable row level security;
alter table public.answers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.streaks enable row level security;
alter table public.weekly_quizzes enable row level security;
alter table public.weekly_quiz_entries enable row level security;

create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can manage own sessions" on public.sessions for all using (auth.uid() = user_id);
create policy "Users can manage own answers" on public.answers
  for all using (
    exists (
      select 1 from public.sessions
      where sessions.id = answers.session_id
      and sessions.user_id = auth.uid()
    )
  );
create policy "Users can manage own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can manage own streaks" on public.streaks for all using (auth.uid() = user_id);
create policy "Subjects are readable" on public.subjects for select using (true);
create policy "Questions are readable" on public.questions for select using (true);
create policy "Weekly quizzes are readable" on public.weekly_quizzes for select using (true);
create policy "Users can manage own weekly quiz entries" on public.weekly_quiz_entries for all using (auth.uid() = user_id);
create policy "Weekly quiz entries are readable" on public.weekly_quiz_entries for select using (true);
create policy "Users can read own referral" on public.user_referrals for select using (auth.uid() = user_id);
create policy "Users can read partner for own referral" on public.partners for select using (
  exists (
    select 1 from public.user_referrals ur
    where ur.partner_id = partners.id and ur.user_id = auth.uid()
  )
);

create or replace function public.apply_referral_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_normalized text;
  v_ref record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'not_authenticated');
  end if;

  if exists (select 1 from public.user_referrals where user_id = v_user_id) then
    return jsonb_build_object('success', false, 'error', 'already_referred');
  end if;

  v_normalized := upper(trim(p_code));
  if v_normalized = '' or v_normalized is null then
    return jsonb_build_object('success', false, 'error', 'invalid_code');
  end if;

  select rc.id, rc.partner_id, rc.code, rc.max_uses, rc.use_count, rc.expires_at, rc.is_active, p.name
  into v_ref
  from public.referral_codes rc
  join public.partners p on p.id = rc.partner_id
  where rc.code = v_normalized
    and rc.is_active = true
    and p.is_active = true;

  if not found then
    return jsonb_build_object('success', false, 'error', 'invalid_code');
  end if;

  if v_ref.expires_at is not null and v_ref.expires_at < now() then
    return jsonb_build_object('success', false, 'error', 'expired');
  end if;

  if v_ref.max_uses is not null and v_ref.use_count >= v_ref.max_uses then
    return jsonb_build_object('success', false, 'error', 'max_uses_reached');
  end if;

  insert into public.user_referrals (user_id, partner_id, code)
  values (v_user_id, v_ref.partner_id, v_ref.code);

  update public.referral_codes
  set use_count = use_count + 1
  where id = v_ref.id;

  return jsonb_build_object(
    'success', true,
    'code', v_ref.code,
    'partner_name', v_ref.name,
    'partner_id', v_ref.partner_id
  );
end;
$$;

grant execute on function public.apply_referral_code(text) to authenticated;

create or replace view public.partner_referral_stats as
select
  p.id as partner_id,
  p.name as partner_name,
  p.slug,
  count(ur.user_id) as signups,
  count(ur.user_id) filter (
    where exists (
      select 1 from public.subscriptions s
      where s.user_id = ur.user_id
        and s.plan = 'pro'
        and s.status = 'active'
    )
  ) as pro_conversions
from public.partners p
left join public.user_referrals ur on ur.partner_id = p.id
group by p.id, p.name, p.slug;
