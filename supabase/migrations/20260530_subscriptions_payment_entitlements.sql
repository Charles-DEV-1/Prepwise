-- Payment-driven Pro entitlements for individual subscriptions.

alter table public.users
  add column if not exists plan subscription_plan not null default 'free',
  add column if not exists is_pro boolean not null default false,
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_expires_at timestamptz;

alter table public.subscriptions
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists provider text,
  add column if not exists provider_subscription_id text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists subscriptions_one_per_user_idx
  on public.subscriptions(user_id);

create index if not exists users_is_pro_idx
  on public.users(is_pro)
  where is_pro = true;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
before update on public.subscriptions
for each row
execute function public.touch_updated_at();
