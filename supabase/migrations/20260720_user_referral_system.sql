-- Prepcore — User Referral System
create table public.user_referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table public.user_referral_signups (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users(id) on delete cascade,
  referee_id uuid not null references public.users(id) on delete cascade,
  code text not null,
  signed_up_at timestamptz not null default now(),
  converted_to_pro boolean not null default false,
  converted_at timestamptz,
  unique (referee_id),
  check (referrer_id <> referee_id)
);

create table public.user_referral_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reward_batch integer not null default 1,
  pro_granted boolean not null default false,
  pro_granted_at timestamptz,
  cash_claimed boolean not null default false,
  cash_claim_requested_at timestamptz,
  bank_name text,
  account_number text,
  account_name text,
  admin_paid boolean not null default false,
  admin_paid_at timestamptz,
  notification_sent boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, reward_batch)
);

alter table public.user_referral_codes enable row level security;
alter table public.user_referral_signups enable row level security;
alter table public.user_referral_rewards enable row level security;

create policy "Users read own user referral code" on public.user_referral_codes
  for select using (auth.uid() = user_id);
create policy "Users create own user referral code" on public.user_referral_codes
  for insert with check (auth.uid() = user_id);
create policy "Referrers read their user referral signups" on public.user_referral_signups
  for select using (auth.uid() = referrer_id);
create policy "Users read own user referral rewards" on public.user_referral_rewards
  for select using (auth.uid() = user_id);
create policy "Users claim own user referral reward" on public.user_referral_rewards
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RLS determines whose reward can be changed; column privileges ensure clients
-- cannot set Pro or payment-administration fields.
revoke update on public.user_referral_rewards from authenticated;
grant update (bank_name, account_number, account_name, cash_claim_requested_at, cash_claimed)
  on public.user_referral_rewards to authenticated;

create or replace function public.ensure_user_referral_code()
returns text language plpgsql security definer set search_path = public as $$
declare existing_code text; generated_code text; base text;
begin
  select code into existing_code from user_referral_codes where user_id = auth.uid();
  if existing_code is not null then return existing_code; end if;
  select upper(left(regexp_replace(coalesce(full_name, 'PREPCORE'), '[^A-Za-z]', '', 'g'), 5))
    into base from users where id = auth.uid();
  base := rpad(coalesce(nullif(base, ''), 'PREP'), 5, 'X');
  loop
    generated_code := base || lpad((floor(random() * 100)::int)::text, 2, '0');
    begin
      insert into user_referral_codes(user_id, code) values (auth.uid(), generated_code);
      return generated_code;
    exception when unique_violation then
      -- Retry only if another user owns the generated code.
    end;
  end loop;
end; $$;

create or replace function public.on_user_pro_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.plan = 'pro' and new.status = 'active' then
    perform grant_user_referral_rewards(new.user_id);
  end if;
  return new;
end; $$;

drop trigger if exists user_referral_conversion_on_subscription on public.subscriptions;
create trigger user_referral_conversion_on_subscription
after insert or update of plan, status on public.subscriptions
for each row execute function public.on_user_pro_subscription();

create or replace function public.record_user_referral_signup(p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare referrer uuid;
begin
  select user_id into referrer from user_referral_codes where code = upper(trim(p_code));
  if referrer is null or referrer = auth.uid() then return; end if;
  insert into user_referral_signups(referrer_id, referee_id, code)
    values (referrer, auth.uid(), upper(trim(p_code)))
    on conflict (referee_id) do nothing;
end; $$;

create or replace function public.grant_user_referral_rewards(p_referee_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare referrer uuid; converted_count int; batch_number int; expiry timestamptz;
begin
  update user_referral_signups set converted_to_pro = true, converted_at = now()
    where referee_id = p_referee_id and converted_to_pro = false
    returning referrer_id into referrer;
  if referrer is null then return; end if;
  select count(*) into converted_count from user_referral_signups urs
    where urs.referrer_id = referrer and urs.converted_to_pro = true;
  for batch_number in 1..floor(converted_count / 5.0)::int loop
    insert into user_referral_rewards(user_id, reward_batch)
      values (referrer, batch_number) on conflict (user_id, reward_batch) do nothing;
    if found then
      select greatest(coalesce(subscription_expires_at, now()), now()) + interval '30 days'
        into expiry from users where id = referrer;
      update users set is_pro = true, subscription_expires_at = expiry where id = referrer;
      update user_referral_rewards set pro_granted = true, pro_granted_at = now()
        where user_id = referrer and reward_batch = batch_number;
    end if;
  end loop;
end; $$;
