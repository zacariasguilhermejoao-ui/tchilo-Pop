-- =============================================================================
-- Tchilo — Segurança / RLS (Supabase)
-- Corre no SQL Editor. Seguro re-correr (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- NUNCA uses a service_role key no frontend.
-- =============================================================================

-- ---------- Extensões úteis ----------
create extension if not exists pgcrypto;

-- ---------- Helpers ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- ---------- PROFILES ----------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public_or_own" on public.profiles;
create policy "profiles_select_public_or_own"
  on public.profiles for select
  using (
    coalesce(is_private, false) = false
    or id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (id = auth.uid() or public.is_admin());

-- Impedir que um user altere o próprio id / username de forma perigosa via trigger
create or replace function public.protect_profile_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Não é permitido alterar o id do perfil';
  end if;
  -- username só pode mudar se ainda não estiver definido (opcional: comenta se quiseres permitir rename)
  -- if old.username is not null and new.username is distinct from old.username then
  --   raise exception 'Username não pode ser alterado';
  -- end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile_immutable();

-- ---------- POSTS ----------
alter table public.posts enable row level security;

drop policy if exists "posts_select_visible" on public.posts;
create policy "posts_select_visible"
  on public.posts for select
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = posts.user_id
        and coalesce(p.is_private, false) = false
    )
    -- contas privadas: só o dono (e futuro follows — adiciona tabela follows se precisares)
  );

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
  on public.posts for insert
  with check (user_id = auth.uid());

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
  on public.posts for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own"
  on public.posts for delete
  using (user_id = auth.uid() or public.is_admin());

-- ---------- COMMENTS (se existir) ----------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='comments') then
    execute 'alter table public.comments enable row level security';
    execute 'drop policy if exists "comments_select" on public.comments';
    execute 'create policy "comments_select" on public.comments for select using (true)'; -- ou restringe como posts
    execute 'drop policy if exists "comments_insert_auth" on public.comments';
    execute 'create policy "comments_insert_auth" on public.comments for insert with check (user_id = auth.uid())';
    execute 'drop policy if exists "comments_update_own" on public.comments';
    execute 'create policy "comments_update_own" on public.comments for update using (user_id = auth.uid())';
    execute 'drop policy if exists "comments_delete_own" on public.comments';
    execute 'create policy "comments_delete_own" on public.comments for delete using (user_id = auth.uid() or public.is_admin())';
  end if;
end $$;

-- ---------- LIKES / FOLLOWS (se existirem) ----------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='likes') then
    execute 'alter table public.likes enable row level security';
    execute 'drop policy if exists "likes_select" on public.likes';
    execute 'create policy "likes_select" on public.likes for select using (true)';
    execute 'drop policy if exists "likes_insert_own" on public.likes';
    execute 'create policy "likes_insert_own" on public.likes for insert with check (user_id = auth.uid())';
    execute 'drop policy if exists "likes_delete_own" on public.likes';
    execute 'create policy "likes_delete_own" on public.likes for delete using (user_id = auth.uid())';
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='follows') then
    execute 'alter table public.follows enable row level security';
    execute 'drop policy if exists "follows_select" on public.follows';
    execute 'create policy "follows_select" on public.follows for select using (true)';
    execute 'drop policy if exists "follows_insert_own" on public.follows';
    execute 'create policy "follows_insert_own" on public.follows for insert with check (follower_id = auth.uid())';
    execute 'drop policy if exists "follows_delete_own" on public.follows';
    execute 'create policy "follows_delete_own" on public.follows for delete using (follower_id = auth.uid())';
  end if;
end $$;

-- ---------- MESSAGES (se existir) — só participantes ----------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='messages') then
    execute 'alter table public.messages enable row level security';
    execute 'drop policy if exists "messages_select_participants" on public.messages';
    execute $p$
      create policy "messages_select_participants" on public.messages for select
      using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin())
    $p$;
    execute $p$
      drop policy if exists "messages_insert_own" on public.messages;
      create policy "messages_insert_own" on public.messages for insert
      with check (sender_id = auth.uid())
    $p$;
    execute $p$
      drop policy if exists "messages_delete_own" on public.messages;
      create policy "messages_delete_own" on public.messages for delete
      using (sender_id = auth.uid() or public.is_admin())
    $p$;
  end if;
end $$;

-- ---------- STORAGE (buckets posts-media, avatars) ----------
-- Ajusta os nomes dos buckets aos teus

do $$
begin
  -- Leitura pública de media (posts/avatars)
  if exists (select 1 from storage.buckets where id = 'posts-media') then
    execute 'drop policy if exists "posts_media_public_read" on storage.objects';
    execute $p$
      create policy "posts_media_public_read" on storage.objects for select
      using (bucket_id = 'posts-media')
    $p$;
    execute 'drop policy if exists "posts_media_owner_write" on storage.objects';
    execute $p$
      create policy "posts_media_owner_write" on storage.objects for insert
      with check (
        bucket_id = 'posts-media'
        and auth.uid() is not null
        and (storage.foldername(name))[1] = auth.uid()::text
      )
    $p$;
    execute 'drop policy if exists "posts_media_owner_update" on storage.objects';
    execute $p$
      create policy "posts_media_owner_update" on storage.objects for update
      using (
        bucket_id = 'posts-media'
        and auth.uid() is not null
        and (storage.foldername(name))[1] = auth.uid()::text
      )
    $p$;
    execute 'drop policy if exists "posts_media_owner_delete" on storage.objects';
    execute $p$
      create policy "posts_media_owner_delete" on storage.objects for delete
      using (
        bucket_id = 'posts-media'
        and auth.uid() is not null
        and (storage.foldername(name))[1] = auth.uid()::text
      )
    $p$;
  end if;
end $$;

-- ---------- Rate limit básico via função (opcional) ----------
-- Usa isto em Edge Functions se precisares de limites mais fortes.

-- ---------- Auth recommendations (manual no Dashboard) ----------
-- 1. Authentication → Providers: só Email (e OAuth se precisares)
-- 2. Minimum password length: 8+ (melhor 10+)
-- 3. Enable email confirmations
-- 4. Enable leaked password protection (Have I Been Pwned) se disponível
-- 5. JWT expiry: 3600s; refresh token rotation ON
-- 6. NUNCA exponhas service_role no cliente
-- 7. API Settings → restringe se possível por referrer (limitado no Supabase)

-- ---------- Ocultar email sensível em selects públicos ----------
-- Na app, NÃO faças select('*' ) em profiles para outros users.
-- Usa: select('id,username,display_name,avatar_url,country,city,is_private')
-- email e phone_hash só para o próprio user ou via RPC segura.

create or replace function public.get_my_contact_fields()
returns table (email text, phone_hash text, country text, city text)
language sql
security definer
set search_path = public
as $$
  select p.email, p.phone_hash, p.country, p.city
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.get_my_contact_fields() from public;
grant execute on function public.get_my_contact_fields() to authenticated;

-- Match de contactos: RPC que NÃO devolve emails de terceiros em massa
create or replace function public.find_profiles_by_emails(emails text[])
returns table (id uuid, username text, display_name text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.username, p.display_name, p.avatar_url
  from public.profiles p
  where p.email = any (
    select lower(trim(e)) from unnest(emails) as e
  )
  and coalesce(p.is_private, false) = false
  and auth.uid() is not null
  limit 50;
$$;

revoke all on function public.find_profiles_by_emails(text[]) from public;
grant execute on function public.find_profiles_by_emails(text[]) to authenticated;

create or replace function public.find_profiles_by_phone_hashes(hashes text[])
returns table (id uuid, username text, display_name text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.username, p.display_name, p.avatar_url
  from public.profiles p
  where p.phone_hash = any (hashes)
  and coalesce(p.is_private, false) = false
  and auth.uid() is not null
  limit 50;
$$;

revoke all on function public.find_profiles_by_phone_hashes(text[]) from public;
grant execute on function public.find_profiles_by_phone_hashes(text[]) to authenticated;
