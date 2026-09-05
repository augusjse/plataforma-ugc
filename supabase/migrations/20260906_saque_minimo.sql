alter table public.admin_config
  add column if not exists saque_minimo numeric(12,2) not null default 50
  check (saque_minimo >= 0);

comment on column public.admin_config.saque_minimo is
  'Minimum creator payout amount in BRL; default 50 is configurable by admins.';
