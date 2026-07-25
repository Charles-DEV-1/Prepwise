-- Resolve shared `?ref=` links across both referral programs during onboarding.
-- User referral codes take precedence so personal invite links are never sent
-- through the lesson-centre-only validator.
create or replace function public.apply_any_referral_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text := upper(trim(p_code));
  referrer_id uuid;
begin
  if normalized_code = '' then
    return jsonb_build_object('success', false, 'error', 'invalid_code');
  end if;

  select user_id
    into referrer_id
    from user_referral_codes
   where code = normalized_code;

  if referrer_id is not null then
    if referrer_id = auth.uid() then
      return jsonb_build_object('success', false, 'error', 'invalid_code');
    end if;

    insert into user_referral_signups (referrer_id, referee_id, code)
      values (referrer_id, auth.uid(), normalized_code)
      on conflict (referee_id) do nothing;

    return jsonb_build_object(
      'success', true,
      'code', normalized_code,
      'referral_type', 'user'
    );
  end if;

  return apply_referral_code(normalized_code);
end;
$$;

grant execute on function public.apply_any_referral_code(text) to authenticated;
