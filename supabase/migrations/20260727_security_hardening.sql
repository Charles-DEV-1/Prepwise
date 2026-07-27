-- Elevated financial functions must never be callable from the browser roles.
revoke all on function public.reserve_partner_withdrawal(uuid, integer, text, text, text, text) from public, anon, authenticated;
revoke all on function public.complete_partner_withdrawal(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.fail_partner_withdrawal(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.award_partner_commission_for_payment(uuid) from public, anon, authenticated;
revoke all on function public.update_partner_balance(uuid, integer) from public, anon, authenticated;
revoke all on function public.process_partner_withdrawal(uuid, integer) from public, anon, authenticated;
revoke all on function public.process_successful_payment(text, bigint, jsonb, timestamptz) from public, anon, authenticated;

grant execute on function public.reserve_partner_withdrawal(uuid, integer, text, text, text, text) to service_role;
grant execute on function public.complete_partner_withdrawal(uuid, text, jsonb) to service_role;
grant execute on function public.fail_partner_withdrawal(uuid, text, jsonb) to service_role;
grant execute on function public.award_partner_commission_for_payment(uuid) to service_role;
grant execute on function public.update_partner_balance(uuid, integer) to service_role;
grant execute on function public.process_partner_withdrawal(uuid, integer) to service_role;
grant execute on function public.process_successful_payment(text, bigint, jsonb, timestamptz) to service_role;
