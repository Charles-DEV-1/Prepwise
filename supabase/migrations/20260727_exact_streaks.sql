-- A streak expires exactly 24 hours after a student's last qualifying study
-- activity, rather than only being checked by calendar date.
alter table public.streaks
  add column if not exists last_activity_at timestamptz;

update public.streaks
set last_activity_at = coalesce(
  last_activity_at,
  (last_activity_date::timestamp at time zone 'Africa/Lagos')
)
where last_activity_at is null and last_activity_date is not null;
