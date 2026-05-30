-- Compatibility for early production payments tables that had legacy
-- Flutterwave columns before the canonical payment schema was added.

alter table public.payments
  add column if not exists flutterwave_tx_ref text,
  add column if not exists payment_link text,
  add column if not exists paid_at timestamptz;

update public.payments
set
  tx_ref = coalesce(tx_ref, flutterwave_tx_ref),
  flutterwave_tx_ref = coalesce(flutterwave_tx_ref, tx_ref),
  status = coalesce(status, 'pending'),
  provider = coalesce(provider, 'flutterwave'),
  currency = coalesce(currency, 'NGN'),
  metadata = coalesce(metadata, '{}'::jsonb),
  verification_attempts = coalesce(verification_attempts, 0),
  checkout_url = coalesce(checkout_url, payment_link),
  payment_link = coalesce(payment_link, checkout_url),
  updated_at = coalesce(updated_at, now()),
  created_at = coalesce(created_at, now());

alter table public.payments
  alter column flutterwave_tx_ref drop not null,
  alter column status set default 'pending',
  alter column status set not null,
  alter column provider set default 'flutterwave',
  alter column provider set not null,
  alter column currency set default 'NGN',
  alter column currency set not null;

create unique index if not exists payments_flutterwave_tx_ref_key
  on public.payments(flutterwave_tx_ref)
  where flutterwave_tx_ref is not null;

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
  where tx_ref = p_tx_ref or flutterwave_tx_ref = p_tx_ref
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
      tx_ref = coalesce(public.payments.tx_ref, p_tx_ref),
      flutterwave_tx_ref = coalesce(public.payments.flutterwave_tx_ref, p_tx_ref),
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
      paid_at = coalesce(public.payments.paid_at, p_verified_at),
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

notify pgrst, 'reload schema';
