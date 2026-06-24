-- PT Consumidores — schema mínimo (Supabase SQL Editor)
-- Executar uma vez no projecto Supabase EU.

create table if not exists operador_config (
  id int primary key default 1,
  agenda_disponivel boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into operador_config (id, agenda_disponivel)
values (1, true)
on conflict (id) do nothing;

alter table operador_config enable row level security;

create policy "Leitura pública agenda"
  on operador_config for select
  using (true);

create policy "Escrita service role agenda"
  on operador_config for all
  using (auth.role() = 'service_role');
