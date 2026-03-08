create table if not exists error_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  message     text not null,
  stack       text,
  source      text not null,   -- 'boundary' | 'global' | 'promise' | 'manual'
  url         text,
  metadata    jsonb
);

-- Allow anonymous inserts only. No reads from the client.
alter table error_logs enable row level security;

create policy "anon insert only"
  on error_logs
  for insert
  to anon
  with check (true);
