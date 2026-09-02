-- Prepcore - Free Diagnostic Test

create table if not exists public.diagnostic_test_results (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  subjects_tested text[] not null,
  total_questions integer not null,
  total_correct integer not null,
  score_percent integer not null,
  estimated_jamb_score integer not null,
  weak_topics jsonb,
  subject_breakdown jsonb not null,
  session_token text unique not null,
  converted_to_signup boolean default false,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists idx_diagnostic_session_token on public.diagnostic_test_results (session_token);
alter table public.diagnostic_test_results enable row level security;
drop policy if exists "Anyone can insert diagnostic results" on public.diagnostic_test_results;
drop policy if exists "Anyone can read their own result by token" on public.diagnostic_test_results;
create policy "Anyone can insert diagnostic results" on public.diagnostic_test_results for insert with check (true);
create policy "Anyone can read their own result by token" on public.diagnostic_test_results for select using (true);