-- ============================================================
-- OBRIGATÓRIO para outras pessoas verem o teu nome no feed
-- Corre isto no Supabase → SQL Editor
-- ============================================================

-- 1) Garantir que qualquer utilizador autenticado (ou anónimo) pode LER
--    username, display_name e avatar dos perfis públicos
--    (sem isto o feed mostra "user_xxx" / "Utilizador")

alter table public.profiles enable row level security;

-- Remove policies antigas demasiado restritivas (se existirem)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Anyone can read profiles" on public.profiles;
drop policy if exists "Users can view all profiles" on public.profiles;

-- Leitura pública dos perfis (só SELECT — não permite editar o de outros)
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

-- O utilizador só pode alterar o SEU próprio perfil
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- 2) (Opcional mas recomendado) guardar username no post ao publicar
--    Assim mesmo sem join o nome aparece no feed
--    Só corre se a coluna ainda não existir:
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'username'
  ) then
    alter table public.posts add column username text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'display_name'
  ) then
    alter table public.posts add column display_name text;
  end if;
end $$;

-- 3) Preencher username/display_name nos posts antigos a partir de profiles
update public.posts p
set
  username = pr.username,
  display_name = coalesce(pr.display_name, pr.username)
from public.profiles pr
where p.user_id = pr.id
  and (p.username is null or p.username like 'user_%' or p.username = '');

-- Verificação rápida:
-- select id, username, display_name from public.profiles limit 20;
-- select id, user_id, username, display_name from public.posts order by created_at desc limit 20;
