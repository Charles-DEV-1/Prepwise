-- Partner bulk Pro: when a lesson center pays, all referred students get Pro

alter table public.partners
  add column if not exists bulk_pro_active boolean not null default false,
  add column if not exists bulk_pro_expires_at timestamptz,
  add column if not exists wholesale_price_naira integer,
  add column if not exists student_price_naira integer;

comment on column public.partners.bulk_pro_active is 'When true, all students with user_referrals for this partner get Pro';
comment on column public.partners.wholesale_price_naira is 'What the center pays Prepwise (bulk deal)';
comment on column public.partners.student_price_naira is 'What the center charges each student (for margin tracking)';
