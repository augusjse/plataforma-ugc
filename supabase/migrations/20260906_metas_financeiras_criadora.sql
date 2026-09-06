alter table public.users
  add column if not exists pix_key text,
  add column if not exists meta_diaria numeric(10,2) not null default 0 check (meta_diaria >= 0),
  add column if not exists meta_semanal numeric(10,2) not null default 0 check (meta_semanal >= 0),
  add column if not exists meta_mensal numeric(10,2) not null default 0 check (meta_mensal >= 0),
  add column if not exists bonus_diario numeric(10,2) not null default 0 check (bonus_diario >= 0),
  add column if not exists bonus_semanal numeric(10,2) not null default 0 check (bonus_semanal >= 0),
  add column if not exists bonus_mensal numeric(10,2) not null default 0 check (bonus_mensal >= 0);
