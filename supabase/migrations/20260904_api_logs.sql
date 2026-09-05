create table if not exists public.api_logs (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null,
  method text not null,
  status text not null check (status in ('error', 'success')),
  error_message text,
  request_body jsonb,
  response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_logs_created_at
  on public.api_logs(created_at desc);

alter table public.api_logs enable row level security;
