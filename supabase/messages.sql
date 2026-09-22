-- Tchilo — tabela de mensagens (corre no SQL Editor do Supabase)

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete set null,
  sender_username text,
  receiver_username text,
  recipient_username text,
  content text default '',
  text text,
  body text,
  message_type text default 'text',
  media_url text,
  media_type text,
  created_at timestamptz not null default now()
);

create index if not exists messages_receiver_idx on public.messages (receiver_username, created_at desc);
create index if not exists messages_recipient_idx on public.messages (recipient_username, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own" on public.messages
  for select using (
    auth.uid() = sender_id
    or receiver_username = (select username from public.profiles where id = auth.uid() limit 1)
    or recipient_username = (select username from public.profiles where id = auth.uid() limit 1)
  );

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "messages_select_auth" on public.messages;
create policy "messages_select_auth" on public.messages
  for select to authenticated using (true);

drop policy if exists "messages_insert_auth" on public.messages;
create policy "messages_insert_auth" on public.messages
  for insert to authenticated with check (auth.uid() = sender_id);
