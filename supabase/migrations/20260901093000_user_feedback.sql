-- User feedback is stored separately from study data, but tied to the
-- existing user record. All writes and reads flow through authenticated server
-- routes, so feedback and student email addresses are never publicly exposed.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  feedback_type text not null default 'general'
    check (feedback_type in ('general', 'practice', 'exam', 'flashcards', 'weekly_quiz', 'leaderboard', 'website', 'other')),
  feature_context text,
  source_page text not null default '/dashboard',
  prompt_trigger text not null default 'completed_sessions',
  practice_count_at_submission integer not null default 0,
  exam_count_at_submission integer not null default 0,
  user_plan text not null default 'free' check (user_plan in ('free', 'pro')),
  app_version text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (comment is null or char_length(comment) <= 4000)
);

create table if not exists public.feedback_prompt_state (
  user_id uuid primary key references public.users(id) on delete cascade,
  last_prompted_at timestamptz,
  postponed_until timestamptz,
  last_submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_rating_created_at_idx on public.feedback (rating, created_at desc);
create index if not exists feedback_type_created_at_idx on public.feedback (feedback_type, created_at desc);
create index if not exists sessions_feedback_eligibility_idx
  on public.sessions (user_id, mode, completed_at)
  where completed_at is not null;

alter table public.feedback enable row level security;
alter table public.feedback_prompt_state enable row level security;

-- The service-role API owns submission and prompt-state writes. No browser role
-- receives broad access to feedback or another student's data.

drop trigger if exists feedback_touch_updated_at on public.feedback;
create trigger feedback_touch_updated_at
before update on public.feedback
for each row execute function public.touch_updated_at();

drop trigger if exists feedback_prompt_state_touch_updated_at on public.feedback_prompt_state;
create trigger feedback_prompt_state_touch_updated_at
before update on public.feedback_prompt_state
for each row execute function public.touch_updated_at();
