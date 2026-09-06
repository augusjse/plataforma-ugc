alter table public.users
  add column if not exists instagram text,
  add column if not exists youtube text,
  add column if not exists tiktok text;
