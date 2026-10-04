-- ============================================================
-- Tchilo Live (Cloudflare Realtime SFU) — 1→muitos
-- Corre no Supabase → SQL Editor
-- ============================================================

create table if not exists public.lives (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  username             text not null,
  display_name         text,
  title                text not null default '',
  status               text not null default 'live'
                         check (status in ('live', 'ended')),
  publisher_session_id text,
  video_track_name     text default 'camera',
  audio_track_name     text default 'mic',
  viewer_count         int not null default 0,
  started_at           timestamptz not null default now(),
  ended_at             timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists lives_status_live_idx
  on public.lives (status, started_at desc)
  where status = 'live';

create index if not exists lives_user_id_idx
  on public.lives (user_id);

create unique index if not exists lives_one_active_per_user
  on public.lives (user_id)
  where status = 'live';

alter table public.lives enable row level security;

drop policy if exists "lives_select" on public.lives;
create policy "lives_select" on public.lives
  for select
  using (status = 'live' or auth.uid() = user_id);

drop policy if exists "lives_insert" on public.lives;
create policy "lives_insert" on public.lives
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "lives_update_owner" on public.lives;
create policy "lives_update_owner" on public.lives
  for update
  using (auth.uid() = user_id);

create or replace function public.lives_inc_viewers(p_live_id uuid, p_delta int default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.lives
  set viewer_count = greatest(0, viewer_count + p_delta),
      updated_at = now()
  where id = p_live_id
    and status = 'live';
end;
$$;

revoke all on function public.lives_inc_viewers(uuid, int) from public;
grant execute on function public.lives_inc_viewers(uuid, int) to authenticated;
grant execute on function public.lives_inc_viewers(uuid, int) to anon;

create or replace function public.lives_end(p_live_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.lives
  set status = 'ended',
      ended_at = now(),
      updated_at = now()
  where id = p_live_id
    and user_id = auth.uid()
    and status = 'live';
end;
$$;

revoke all on function public.lives_end(uuid) from public;
grant execute on function public.lives_end(uuid) to authenticated;

-- No Dashboard → Database → Replication: activa a tabela "lives" para Realtime
