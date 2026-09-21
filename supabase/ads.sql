-- Tchilo Ads
-- Corre no SQL Editor do Supabase

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','active','paused','expired')),
  ad_type text not null check (ad_type in ('click','message')),
  body text not null default '',
  media_url text,
  media_type text check (media_type is null or media_type in ('image','video')),
  link_url text,
  days int not null check (days >= 1 and days <= 30),
  reach_min int not null default 0,
  reach_max int not null default 0,
  impressions int not null default 0,
  clicks int not null default 0,
  conversations int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  paddle_txn text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ads_status_active_idx
  on public.ads (status, ends_at)
  where status = 'active';

create index if not exists ads_user_id_idx on public.ads (user_id);

alter table public.ads enable row level security;

-- Leitura: anúncios ativos para o feed; dono vê os seus
drop policy if exists "ads_select" on public.ads;
create policy "ads_select" on public.ads
  for select using (
    status = 'active'
    or auth.uid() = user_id
  );

-- Criar: só o próprio utilizador
drop policy if exists "ads_insert" on public.ads;
create policy "ads_insert" on public.ads
  for insert with check (auth.uid() = user_id);

-- Atualizar: dono (pausar/reativar); impressões via RPC abaixo
drop policy if exists "ads_update_owner" on public.ads;
create policy "ads_update_owner" on public.ads
  for update using (auth.uid() = user_id);

-- RPC: incrementar impressão (qualquer autenticado, só se ativo e dentro do limite)
create or replace function public.ads_record_impression(p_ad_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ads
  set impressions = impressions + 1,
      updated_at = now(),
      status = case
        when impressions + 1 >= reach_max then 'expired'
        when ends_at is not null and ends_at < now() then 'expired'
        else status
      end
  where id = p_ad_id
    and status = 'active'
    and (ends_at is null or ends_at > now())
    and impressions < reach_max;
end;
$$;

revoke all on function public.ads_record_impression(uuid) from public;
grant execute on function public.ads_record_impression(uuid) to authenticated;
grant execute on function public.ads_record_impression(uuid) to anon;

create or replace function public.ads_record_click(p_ad_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ads
  set clicks = clicks + 1, updated_at = now()
  where id = p_ad_id and status = 'active';
end;
$$;

create or replace function public.ads_record_conversation(p_ad_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ads
  set conversations = conversations + 1, updated_at = now()
  where id = p_ad_id and status = 'active';
end;
$$;

revoke all on function public.ads_record_click(uuid) from public;
revoke all on function public.ads_record_conversation(uuid) from public;
grant execute on function public.ads_record_click(uuid) to authenticated;
grant execute on function public.ads_record_conversation(uuid) to authenticated;
