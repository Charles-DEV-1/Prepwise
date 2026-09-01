-- Supports the high-volume lookup patterns used by question sessions,
-- onboarding, and partner dashboards. Each statement is idempotent and safe
-- to run after the existing production migrations.

create index if not exists questions_subject_exam_idx
  on public.questions (subject_id, exam_type);

create index if not exists users_email_idx
  on public.users (email)
  where email is not null;

create index if not exists user_referrals_partner_applied_idx
  on public.user_referrals (partner_id, applied_at desc);

create index if not exists partner_referral_conversions_partner_signed_up_idx
  on public.partner_referral_conversions (partner_id, signed_up_at desc);

create index if not exists partner_withdrawals_partner_requested_idx
  on public.partner_withdrawals (partner_id, requested_at desc);

create index if not exists partner_sessions_token_idx
  on public.partner_sessions (token);
