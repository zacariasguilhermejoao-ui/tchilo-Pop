-- Tchilo: colunas para sugestões por localização e contactos
-- Executar no SQL Editor do Supabase

-- Localização (país do registo + cidade opcional)
alter table public.profiles
  add column if not exists country text,
  add column if not exists city text;

-- Email no perfil (para match com contactos) — opcional; só se quiseres expor
-- Nota: se já usas auth.users.email, podes criar uma view ou sync via trigger.
alter table public.profiles
  add column if not exists email text;

-- Hash do telefone (SHA-256 do número só com dígitos) — NUNCA guardar telefone em claro
alter table public.profiles
  add column if not exists phone_hash text;

create index if not exists profiles_country_idx on public.profiles (country);
create index if not exists profiles_city_idx on public.profiles (city);
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_phone_hash_idx on public.profiles (phone_hash);

-- RLS: leitura pública só de perfis não privados (ajusta às tuas policies)
-- Exemplo (se ainda não existir policy de select):
-- create policy "Public profiles readable"
--   on public.profiles for select
--   using (is_private is not true or auth.uid() = id);

comment on column public.profiles.country is 'País para sugestões por localização';
comment on column public.profiles.city is 'Cidade para sugestões por localização';
comment on column public.profiles.phone_hash is 'SHA-256 do telefone normalizado (só dígitos) para match de contactos';
comment on column public.profiles.email is 'Email opcional para match de contactos (preferir sync a partir de auth)';
