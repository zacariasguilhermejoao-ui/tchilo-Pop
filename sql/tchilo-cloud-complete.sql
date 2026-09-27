-- ==========================================================
-- Tchilo — schema cloud completo (correr no SQL Editor Supabase)
-- ==========================================================

-- Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  is_private boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  premium_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  username text,
  display_name text,
  caption text,
  media_url text,
  media_type text,
  thumbnail_url text,
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  views_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comments_count int DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views_count int DEFAULT 0;

-- Stories
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

-- Likes
CREATE TABLE IF NOT EXISTS public.likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes(post_id);

-- Guardados
CREATE TABLE IF NOT EXISTS public.saved_posts (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Visualizações
CREATE TABLE IF NOT EXISTS public.post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  post_id uuid NOT NULL,
  viewed_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON public.post_views(post_id);

-- Comentários
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);

-- Seguidores
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Mensagens
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_username text,
  content text DEFAULT '',
  media_url text,
  media_type text,
  file_name text,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS recipient_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS recipient_username text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type text;
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_recipient_username_idx ON public.messages(recipient_username, created_at DESC);

-- Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_username text,
  type text NOT NULL,
  post_id uuid,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);

-- Definições
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  private_account boolean DEFAULT false,
  anonymous_mode boolean DEFAULT false,
  show_activity boolean DEFAULT true,
  notif_likes boolean DEFAULT true,
  notif_comments boolean DEFAULT true,
  notif_follows boolean DEFAULT true,
  notif_stories boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Premium / planos
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan text DEFAULT 'premium',
  status text DEFAULT 'active',
  paddle_transaction_id text,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Anúncios (se já existir, ok)
CREATE TABLE IF NOT EXISTS public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content jsonb,
  status text DEFAULT 'active',
  days int DEFAULT 1,
  impressions int DEFAULT 0,
  clicks int DEFAULT 0,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies (drop + recreate leves)
DO $$ BEGIN
  -- profiles: leitura pública, escrita própria
  DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
  CREATE POLICY profiles_public_read ON public.profiles FOR SELECT USING (true);
  DROP POLICY IF EXISTS profiles_own_write ON public.profiles;
  CREATE POLICY profiles_own_write ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

  DROP POLICY IF EXISTS posts_public_read ON public.posts;
  CREATE POLICY posts_public_read ON public.posts FOR SELECT USING (true);
  DROP POLICY IF EXISTS posts_own_write ON public.posts;
  CREATE POLICY posts_own_write ON public.posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS stories_public_read ON public.stories;
  CREATE POLICY stories_public_read ON public.stories FOR SELECT USING (true);
  DROP POLICY IF EXISTS stories_own_write ON public.stories;
  CREATE POLICY stories_own_write ON public.stories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS likes_public_read ON public.likes;
  CREATE POLICY likes_public_read ON public.likes FOR SELECT USING (true);
  DROP POLICY IF EXISTS likes_own_write ON public.likes;
  CREATE POLICY likes_own_write ON public.likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS saves_own ON public.saved_posts;
  CREATE POLICY saves_own ON public.saved_posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS views_insert ON public.post_views;
  CREATE POLICY views_insert ON public.post_views FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS views_read ON public.post_views;
  CREATE POLICY views_read ON public.post_views FOR SELECT USING (true);

  DROP POLICY IF EXISTS comments_public_read ON public.comments;
  CREATE POLICY comments_public_read ON public.comments FOR SELECT USING (true);
  DROP POLICY IF EXISTS comments_own_write ON public.comments;
  CREATE POLICY comments_own_write ON public.comments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS follows_public_read ON public.follows;
  CREATE POLICY follows_public_read ON public.follows FOR SELECT USING (true);
  DROP POLICY IF EXISTS follows_own_write ON public.follows;
  CREATE POLICY follows_own_write ON public.follows FOR ALL USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);

  DROP POLICY IF EXISTS messages_participants ON public.messages;
  CREATE POLICY messages_participants ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  DROP POLICY IF EXISTS messages_send ON public.messages;
  CREATE POLICY messages_send ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  DROP POLICY IF EXISTS messages_update_own ON public.messages;
  CREATE POLICY messages_update_own ON public.messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

  DROP POLICY IF EXISTS notif_own ON public.notifications;
  CREATE POLICY notif_own ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS notif_insert ON public.notifications;
  CREATE POLICY notif_insert ON public.notifications FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS notif_update_own ON public.notifications;
  CREATE POLICY notif_update_own ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS settings_own ON public.user_settings;
  CREATE POLICY settings_own ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS subs_own ON public.subscriptions;
  CREATE POLICY subs_own ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
END $$;

-- Storage bucket posts-media (público para leitura)
-- No dashboard: Storage → posts-media → Public bucket = ON
-- Policy de upload: authenticated users can upload to folder = their user id

SELECT 'Tchilo cloud schema OK' AS status;
