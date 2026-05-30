-- Repair migration for projects that already had a partial payments table.
-- `create table if not exists` does not add missing columns to an existing table,
-- so this makes the Flutterwave schema explicitly idempotent.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid()
);

alter table public.payments
  add column if not exists user_id uuid references public.users(id) on delete cascade,
  add column if not exists tx_ref text,
  add column if not exists provider text not null default 'flutterwave',
  add column if not exists plan_key text,
  add column if not exists amount numeric(12, 2),
  add column if not exists currency text not null default 'NGN',
  add column if not exists status text not null default 'pending',
  add column if not exists flutterwave_transaction_id bigint,
  add column if not exists flutterwave_flw_ref text,
  add column if not exists checkout_url text,
  add column if not exists customer_email text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists provider_response jsonb,
  add column if not exists verification_attempts integer not null default 0,
  add column if not exists verified_at timestamptz,
  add column if not exists processed_at timestamptz,
  add column if not exists failure_reason text,
  add column if not exists idempotency_key text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.payments
set
  provider = coalesce(provider, 'flutterwave'),
  currency = coalesce(currency, 'NGN'),
  status = coalesce(status, 'pending'),
  metadata = coalesce(metadata, '{}'::jsonb),
  verification_attempts = coalesce(verification_attempts, 0),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.payments
  alter column user_id set not null,
  alter column tx_ref set not null,
  alter column plan_key set not null,
  alter column amount set not null,
  alter column idempotency_key set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_status_check'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint payments_status_check
      check (status in ('pending', 'successful', 'failed', 'cancelled'));
  end if;
end;
$$;

create unique index if not exists payments_tx_ref_key
  on public.payments(tx_ref);

create unique index if not exists payments_flutterwave_transaction_id_key
  on public.payments(flutterwave_transaction_id)
  where flutterwave_transaction_id is not null;

create unique index if not exists payments_idempotency_key_key
  on public.payments(idempotency_key);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid()
);

alter table public.payment_webhook_events
  add column if not exists provider text not null default 'flutterwave',
  add column if not exists event_key text,
  add column if not exists tx_ref text,
  add column if not exists flutterwave_transaction_id bigint,
  add column if not exists payload jsonb,
  add column if not exists processed_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

update public.payment_webhook_events
set
  provider = coalesce(provider, 'flutterwave'),
  created_at = coalesce(created_at, now());

alter table public.payment_webhook_events
  alter column event_key set not null,
  alter column payload set not null;

create unique index if not exists payment_webhook_events_provider_event_key_key
  on public.payment_webhook_events(provider, event_key);

alter table public.payments enable row level security;
alter table public.payment_webhook_events enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
before update on public.payments
for each row
execute function public.touch_updated_at();

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments
  for select
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
