-- Anúncios com várias zonas no mapa (Turbinar post)
-- Corre uma vez no Supabase → SQL Editor.

alter table public.ads add column if not exists target_lat double precision;
alter table public.ads add column if not exists target_lng double precision;
alter table public.ads add column if not exists target_radius_km double precision;
alter table public.ads add column if not exists target_label text;
alter table public.ads add column if not exists target_country text;
alter table public.ads add column if not exists target_locations jsonb;
