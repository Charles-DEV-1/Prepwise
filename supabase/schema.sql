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
  created_at timestamptz not null default now()
);

create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  current_count integer not null default 0,
  longest_count integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.questions enable row level security;
alter table public.sessions enable row level security;
alter table public.answers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.streaks enable row level security;

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
