-- ============================================================
-- Tchilo Calls (1-1 via Realtime SFU)
-- Corre no Supabase → SQL Editor
-- ============================================================

create table if not exists public.calls (
  id                  uuid primary key default gen_random_uuid(),
  caller_id           uuid not null references auth.users(id) on delete cascade,
  callee_id           uuid not null references auth.users(id) on delete cascade,
  caller_username     text not null,
  callee_username     text not null,
  call_type           text not null default 'video'
                        check (call_type in ('video', 'audio')),
  status              text not null default 'ringing'
                        check (status in ('ringing', 'active', 'ended', 'declined', 'missed')),
  caller_session_id   text,
  callee_session_id   text,
  started_at          timestamptz not null default now(),
  answered_at         timestamptz,
  ended_at            timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists calls_callee_ringing_idx
  on public.calls (callee_id, status, started_at desc)
  where status = 'ringing';

create index if not exists calls_caller_idx on public.calls (caller_id, started_at desc);
create index if not exists calls_status_idx on public.calls (status, updated_at desc);

alter table public.calls enable row level security;

drop policy if exists "calls_select_participants" on public.calls;
create policy "calls_select_participants" on public.calls
  for select using (auth.uid() = caller_id or auth.uid() = callee_id);

drop policy if exists "calls_insert_caller" on public.calls;
create policy "calls_insert_caller" on public.calls
  for insert with check (auth.uid() = caller_id);

drop policy if exists "calls_update_participants" on public.calls;
create policy "calls_update_participants" on public.calls
  for update using (auth.uid() = caller_id or auth.uid() = callee_id);

-- Realtime: Database → Replication → activa a tabela "calls"
