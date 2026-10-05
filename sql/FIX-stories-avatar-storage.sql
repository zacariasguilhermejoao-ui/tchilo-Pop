-- ==========================================================
-- TCHILO — FIX DEFINITIVO: stories + avatar + storage
-- Cola TUDO isto no SQL Editor do Supabase e corre UMA vez
-- ==========================================================

-- 1) STORIES: garantir colunas do schema real
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  username text,
  media_url text,
  media_type text,
  text_content text,
  color text,
  music jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS text_content text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS music jsonb;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '24 hours');

-- Se a tabela antiga tinha text/content/caption, copiar para text_content
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='stories' AND column_name='text'
  ) THEN
    EXECUTE 'UPDATE public.stories SET text_content = COALESCE(text_content, text) WHERE text_content IS NULL';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='stories' AND column_name='content'
  ) THEN
    EXECUTE 'UPDATE public.stories SET text_content = COALESCE(text_content, content) WHERE text_content IS NULL';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='stories' AND column_name='caption'
  ) THEN
    EXECUTE 'UPDATE public.stories SET text_content = COALESCE(text_content, caption) WHERE text_content IS NULL';
  END IF;
END $$;

-- 2) PROFILES: avatar_url
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- 3) RLS STORIES
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stories_public_read ON public.stories;
CREATE POLICY stories_public_read ON public.stories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS stories_own_insert ON public.stories;
CREATE POLICY stories_own_insert ON public.stories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS stories_own_update ON public.stories;
CREATE POLICY stories_own_update ON public.stories
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS stories_own_delete ON public.stories;
CREATE POLICY stories_own_delete ON public.stories
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4) RLS PROFILES (ler todos, escrever o próprio)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_public_read ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_own_write ON public.profiles;
CREATE POLICY profiles_own_write ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5) STORAGE posts-media (avatar + stories + posts)
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts-media', 'posts-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "posts_media_public_read" ON storage.objects;
CREATE POLICY "posts_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts-media');

DROP POLICY IF EXISTS "posts_media_auth_upload" ON storage.objects;
CREATE POLICY "posts_media_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "posts_media_auth_update" ON storage.objects;
CREATE POLICY "posts_media_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'posts-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "posts_media_auth_delete" ON storage.objects;
CREATE POLICY "posts_media_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6) Índices úteis
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON public.stories (created_at DESC);
CREATE INDEX IF NOT EXISTS stories_user_id_idx ON public.stories (user_id);

SELECT 'OK — stories + avatar + storage prontos' AS status;
