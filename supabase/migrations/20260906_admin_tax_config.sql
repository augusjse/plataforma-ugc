alter table public.admin_config
  add column if not exists imposto_meta_ads_percent numeric(5,2) not null default 13 check (imposto_meta_ads_percent between 0 and 100),
  add column if not exists imposto_nota_fiscal_percent numeric(5,2) not null default 0 check (imposto_nota_fiscal_percent between 0 and 100);

update public.admin_config
set
  imposto_meta_ads_percent = coalesce(imposto_meta_ads_percent, 13),
  imposto_nota_fiscal_percent = coalesce(imposto_nota_fiscal_percent, 0)
where id = true;
