-- Referral system migration (run on existing Supabase projects)
-- Safe to re-run: uses IF NOT EXISTS where applicable

create table if not exists public.partners (
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

create table if not exists public.referral_codes (
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

create table if not exists public.user_referrals (
  user_id uuid primary key references public.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete restrict,
  code text not null,
  applied_at timestamptz not null default now()
);

alter table public.subscriptions
  add column if not exists referral_partner_id uuid references public.partners(id) on delete set null;

alter table public.partners enable row level security;
alter table public.referral_codes enable row level security;
alter table public.user_referrals enable row level security;

drop policy if exists "Users can read own referral" on public.user_referrals;
create policy "Users can read own referral" on public.user_referrals
  for select using (auth.uid() = user_id);

drop policy if exists "Users can read partner for own referral" on public.partners;
create policy "Users can read partner for own referral" on public.partners
  for select using (
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
  v_partner_name text;
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

-- Pilot seed (optional — remove or edit for production)
insert into public.partners (name, slug, city, is_active)
values ('Prepcore Pilot Center', 'pilot-center', 'Lagos', true)
on conflict (slug) do nothing;

insert into public.referral_codes (partner_id, code, label, is_active)
select p.id, 'PILOT-TEST', 'Pilot test code', true
from public.partners p
where p.slug = 'pilot-center'
on conflict (code) do nothing;
