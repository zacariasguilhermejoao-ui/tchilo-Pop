-- ==========================================================
-- Storage policies for posts-media (avatar + stories + posts)
-- Correr no SQL Editor do Supabase se o upload falhar
-- ==========================================================

-- Garantir bucket público de leitura
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts-media', 'posts-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Leitura pública
DROP POLICY IF EXISTS "posts_media_public_read" ON storage.objects;
CREATE POLICY "posts_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts-media');

-- Upload: utilizador autenticado só na pasta do seu user id
DROP POLICY IF EXISTS "posts_media_auth_upload" ON storage.objects;
CREATE POLICY "posts_media_auth_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update (upsert avatar)
DROP POLICY IF EXISTS "posts_media_auth_update" ON storage.objects;
CREATE POLICY "posts_media_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete próprio
DROP POLICY IF EXISTS "posts_media_auth_delete" ON storage.objects;
CREATE POLICY "posts_media_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

SELECT 'posts-media storage policies OK' AS status;
