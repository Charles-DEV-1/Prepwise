-- Existing view migration: preserve its query and columns while ensuring it
-- evaluates with the privileges of the querying role rather than its owner.
alter view public.partner_referral_stats
  set (security_invoker = true);
