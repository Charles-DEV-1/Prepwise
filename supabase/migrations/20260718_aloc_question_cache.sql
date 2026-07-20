-- Imported ALOC questions live in the existing question bank so sessions and
-- answers retain valid question foreign keys. Run this migration in Supabase
-- before deploying the ALOC integration.
alter table public.questions
  add column if not exists source text not null default 'supabase',
  add column if not exists source_question_id text;

create unique index if not exists questions_source_question_id_key
  on public.questions(source, source_question_id)
  where source_question_id is not null;

create index if not exists questions_source_subject_exam_idx
  on public.questions(source, subject_id, exam_type);

-- Free users keep access to the existing Supabase bank. ALOC-imported rows
-- require either an active direct Pro subscription or an active partner-bulk
-- entitlement, even if a user tries to query Supabase outside the UI.
drop policy if exists "Questions are readable" on public.questions;
create policy "Question access follows entitlement" on public.questions
  for select using (
    source = 'supabase'
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = auth.uid()
        and s.plan = 'pro'
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
    )
    or exists (
      select 1
      from public.user_referrals ur
      join public.partners p on p.id = ur.partner_id
      where ur.user_id = auth.uid()
        and p.is_active = true
        and p.bulk_pro_active = true
        and (p.bulk_pro_expires_at is null or p.bulk_pro_expires_at > now())
    )
  );
