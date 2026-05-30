-- Flutterwave payment records and idempotent entitlement activation.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tx_ref text not null unique,
  provider text not null default 'flutterwave',
  plan_key text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'NGN',
  status text not null default 'pending'
    check (status in ('pending', 'successful', 'failed', 'cancelled')),
  flutterwave_transaction_id bigint unique,
  flutterwave_flw_ref text,
  checkout_url text,
  customer_email text,
  metadata jsonb not null default '{}'::jsonb,
  provider_response jsonb,
  verification_attempts integer not null default 0,
  verified_at timestamptz,
  processed_at timestamptz,
  failure_reason text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'flutterwave',
  event_key text not null,
  tx_ref text,
  flutterwave_transaction_id bigint,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, event_key)
);

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

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments
  for select
  using (auth.uid() = user_id);

create index if not exists payments_user_created_idx
  on public.payments(user_id, created_at desc);

create index if not exists payments_status_created_idx
  on public.payments(status, created_at desc);

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
before update on public.payments
for each row
execute function public.touch_updated_at();

create or replace function public.process_successful_payment(
  p_tx_ref text,
  p_flutterwave_transaction_id bigint,
  p_provider_response jsonb,
  p_verified_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_started_at timestamptz;
  v_expires_at timestamptz;
begin
  select *
    into v_payment
  from public.payments
  where tx_ref = p_tx_ref
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'payment_not_found');
  end if;

  if v_payment.status = 'successful' and v_payment.processed_at is not null then
    return jsonb_build_object(
      'success', true,
      'already_processed', true,
      'user_id', v_payment.user_id,
      'payment_id', v_payment.id
    );
  end if;

  v_started_at := p_verified_at;
  v_expires_at := p_verified_at + interval '365 days';

  update public.payments
  set status = 'successful',
      flutterwave_transaction_id = coalesce(
        public.payments.flutterwave_transaction_id,
        p_flutterwave_transaction_id
      ),
      flutterwave_flw_ref = coalesce(
        p_provider_response #>> '{data,flw_ref}',
        public.payments.flutterwave_flw_ref
      ),
      provider_response = p_provider_response,
      verification_attempts = public.payments.verification_attempts + 1,
      verified_at = p_verified_at,
      processed_at = coalesce(public.payments.processed_at, now()),
      failure_reason = null
  where id = v_payment.id;

  insert into public.subscriptions (
    user_id,
    plan,
    status,
    current_period_end,
    subscription_started_at,
    subscription_expires_at,
    provider,
    provider_subscription_id
  )
  values (
    v_payment.user_id,
    'pro',
    'active',
    v_expires_at,
    v_started_at,
    v_expires_at,
    'flutterwave',
    p_flutterwave_transaction_id::text
  )
  on conflict (user_id)
  do update set
    plan = excluded.plan,
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    subscription_started_at = excluded.subscription_started_at,
    subscription_expires_at = excluded.subscription_expires_at,
    provider = excluded.provider,
    provider_subscription_id = excluded.provider_subscription_id,
    updated_at = now();

  update public.users
  set plan = 'pro',
      is_pro = true,
      subscription_started_at = v_started_at,
      subscription_expires_at = v_expires_at
  where id = v_payment.user_id;

  return jsonb_build_object(
    'success', true,
    'already_processed', false,
    'user_id', v_payment.user_id,
    'payment_id', v_payment.id,
    'subscription_expires_at', v_expires_at
  );
end;
$$;
