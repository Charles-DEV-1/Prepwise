-- Partner portal authentication, safe referral attribution, and payout locking.
alter table public.partner_accounts
  add column if not exists password_hash text,
  add column if not exists reserved_balance integer not null default 0;

alter table public.partner_accounts
  alter column referral_code drop not null;

create unique index if not exists partner_accounts_referral_code_unique
  on public.partner_accounts (referral_code) where referral_code is not null;

-- A withdrawal reserves funds before an external transfer is started.  This
-- prevents two browser requests from spending the same earnings.
create or replace function public.reserve_partner_withdrawal(
  p_partner_id uuid,
  p_amount integer,
  p_bank_name text,
  p_account_number text,
  p_account_name text,
  p_bank_code text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_amount < 1 then raise exception 'Invalid withdrawal amount'; end if;
  perform 1 from partner_accounts
   where id = p_partner_id and status = 'active'
   for update;
  if not found then raise exception 'Partner account is not active'; end if;
  if not exists (
    select 1 from partner_accounts
     where id = p_partner_id
       and pending_balance - reserved_balance >= p_amount
       and p_amount >= minimum_withdrawal
  ) then raise exception 'Insufficient available balance'; end if;
  update partner_accounts set reserved_balance = reserved_balance + p_amount,
    updated_at = now() where id = p_partner_id;
  insert into partner_withdrawals(partner_id, amount, bank_name, account_number,
    account_name, bank_code, status)
  values (p_partner_id, p_amount, p_bank_name, p_account_number, p_account_name,
    p_bank_code, 'processing') returning id into v_id;
  return v_id;
end $$;

create or replace function public.complete_partner_withdrawal(
  p_withdrawal_id uuid, p_transfer_id text, p_response jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare v_partner uuid; v_amount integer;
begin
  select partner_id, amount into v_partner, v_amount from partner_withdrawals
   where id = p_withdrawal_id and status in ('pending','processing') for update;
  if not found then return; end if;
  update partner_withdrawals set status='completed', flutterwave_transfer_id=p_transfer_id,
    flutterwave_response=p_response, completed_at=now(), processed_at=now()
    where id=p_withdrawal_id;
  update partner_accounts set reserved_balance=greatest(reserved_balance-v_amount,0),
    pending_balance=pending_balance-v_amount, total_withdrawn=total_withdrawn+v_amount,
    updated_at=now() where id=v_partner;
end $$;

create or replace function public.fail_partner_withdrawal(
  p_withdrawal_id uuid, p_reason text, p_response jsonb default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_partner uuid; v_amount integer;
begin
  select partner_id, amount into v_partner, v_amount from partner_withdrawals
   where id = p_withdrawal_id and status in ('pending','processing') for update;
  if not found then return; end if;
  update partner_withdrawals set status='failed', failure_reason=p_reason,
    flutterwave_response=coalesce(p_response, flutterwave_response), failed_at=now()
    where id=p_withdrawal_id;
  update partner_accounts set reserved_balance=greatest(reserved_balance-v_amount,0),
    updated_at=now() where id=v_partner;
end $$;

create or replace function public.award_partner_commission_for_payment(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_partner_id uuid; v_commission integer;
begin
  select partner_id, commission_amount into v_partner_id, v_commission
    from partner_referral_conversions
   where user_id=p_user_id and converted_to_pro=false
   for update;
  if not found then return false; end if;
  update partner_referral_conversions set converted_to_pro=true, converted_at=now(),
    commission_status='earned' where user_id=p_user_id;
  update partner_accounts set total_earned=total_earned+v_commission,
    pending_balance=pending_balance+v_commission, updated_at=now() where id=v_partner_id;
  return true;
end $$;

-- Add the affiliate program to the existing referral capture mechanism.
create or replace function public.apply_any_referral_code(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare normalized_code text := upper(trim(p_code)); referrer_id uuid; v_partner partner_accounts%rowtype;
begin
  if normalized_code = '' then return jsonb_build_object('success',false,'error','invalid_code'); end if;
  select user_id into referrer_id from user_referral_codes where code=normalized_code;
  if referrer_id is not null then
    if referrer_id = auth.uid() then return jsonb_build_object('success',false,'error','invalid_code'); end if;
    insert into user_referral_signups(referrer_id,referee_id,code) values(referrer_id,auth.uid(),normalized_code)
      on conflict(referee_id) do nothing;
    return jsonb_build_object('success',true,'code',normalized_code,'referral_type','user');
  end if;
  select * into v_partner from partner_accounts where referral_code=normalized_code and status='active';
  if found then
    insert into partner_referral_conversions(partner_id,user_id,user_email,user_name,referral_code,commission_amount)
    select v_partner.id, u.id, coalesce(u.email,''), coalesce(u.full_name,''), normalized_code, v_partner.commission_per_sale
      from users u where u.id=auth.uid()
    on conflict(user_id) do nothing;
    return jsonb_build_object('success',true,'code',normalized_code,'referral_type','affiliate');
  end if;
  return apply_referral_code(normalized_code);
end $$;
