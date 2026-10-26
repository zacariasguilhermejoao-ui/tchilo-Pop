-- Eliminação de conta com apagamento automático ao fim de 30 dias.
-- Corre uma vez no Supabase → SQL Editor. NÃO foi testado na tua base de dados: lê antes de correr.

create table if not exists public.account_deletions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  reason text
);
alter table public.account_deletions enable row level security;

drop policy if exists "account_deletions_select_own" on public.account_deletions;
create policy "account_deletions_select_own" on public.account_deletions
  for select to authenticated using (auth.uid() = user_id);

-- A pessoa pede a eliminação (regista a data)
create or replace function public.request_account_deletion(p_reason text default null)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare ts timestamptz;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.account_deletions(user_id, reason)
  values (auth.uid(), left(coalesce(p_reason, ''), 200))
  on conflict (user_id) do update set requested_at = now(), reason = excluded.reason
  returning requested_at into ts;
  return ts;
end $$;

-- A pessoa cancela durante os 30 dias
create or replace function public.cancel_account_deletion()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from public.account_deletions where user_id = auth.uid();
end $$;

-- Data do pedido (ou null)
create or replace function public.get_account_deletion()
returns timestamptz language sql security definer set search_path = public as $$
  select requested_at from public.account_deletions where user_id = auth.uid();
$$;

revoke all on function public.request_account_deletion(text) from public, anon;
revoke all on function public.cancel_account_deletion() from public, anon;
revoke all on function public.get_account_deletion() from public, anon;
grant execute on function public.request_account_deletion(text) to authenticated;
grant execute on function public.cancel_account_deletion() to authenticated;
grant execute on function public.get_account_deletion() to authenticated;

-- Contas cujo prazo de 30 dias já passou (usado pela função agendada)
create or replace function public.due_account_deletions()
returns table(user_id uuid) language sql security definer set search_path = public as $$
  select user_id from public.account_deletions where requested_at < now() - interval '30 days';
$$;

-- Ficheiros da pessoa no Storage (a função agendada apaga-os pela API do Storage)
create or replace function public.user_storage_objects(p_user uuid)
returns table(bucket_id text, name text) language sql security definer set search_path = public, storage as $$
  select bucket_id, name from storage.objects where owner = p_user;
$$;

-- Apaga os dados da pessoa nas tabelas públicas que tenham uma coluna de dono (uuid)
create or replace function public.purge_user_rows(p_user uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare t record; n integer := 0;
begin
  for t in
    select c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables tb
      on tb.table_schema = c.table_schema and tb.table_name = c.table_name and tb.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.data_type = 'uuid'
      and c.column_name in ('user_id','owner_id','author_id','sender_id','recipient_id','receiver_id',
                            'follower_id','following_id','from_user_id','to_user_id','created_by')
      and c.table_name <> 'account_deletions'
  loop
    execute format('delete from public.%I where %I = $1', t.table_name, t.column_name) using p_user;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Só a função agendada (service_role) pode chamar estas três
revoke all on function public.due_account_deletions() from public, anon, authenticated;
revoke all on function public.user_storage_objects(uuid) from public, anon, authenticated;
revoke all on function public.purge_user_rows(uuid) from public, anon, authenticated;
grant execute on function public.due_account_deletions() to service_role;
grant execute on function public.user_storage_objects(uuid) to service_role;
grant execute on function public.purge_user_rows(uuid) to service_role;

-- Agendamento diário (precisa de pg_cron e pg_net ativos em Database → Extensions).
-- Troca <PROJECT_REF> e <CRON_SECRET> (o mesmo valor que puseres na função).
-- select cron.schedule('purge-deleted-accounts', '0 3 * * *', $$
--   select net.http_post(
--     url := 'https://<PROJECT_REF>.supabase.co/functions/v1/purge-deleted-accounts',
--     headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
--     body := '{}'::jsonb);
-- $$);
