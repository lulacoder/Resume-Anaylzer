-- Persistent analysis chat and rewrite version history

CREATE TABLE IF NOT EXISTS public.analysis_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analysis_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.analysis_chat_sessions(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analysis_rewrite_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  sections jsonb NOT NULL,
  generation_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (analysis_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_analysis_created
  ON public.analysis_chat_sessions(analysis_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON public.analysis_chat_messages(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_analysis_created
  ON public.analysis_chat_messages(analysis_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_rewrite_versions_analysis_created
  ON public.analysis_rewrite_versions(analysis_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rewrite_versions_analysis_version
  ON public.analysis_rewrite_versions(analysis_id, version_number DESC);

ALTER TABLE public.analysis_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_rewrite_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own chat sessions"
  ON public.analysis_chat_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can fully manage their own chat messages"
  ON public.analysis_chat_messages
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can fully manage their own rewrite versions"
  ON public.analysis_rewrite_versions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.analysis_chat_sessions TO anon;
GRANT ALL ON TABLE public.analysis_chat_sessions TO authenticated;
GRANT ALL ON TABLE public.analysis_chat_sessions TO service_role;

GRANT ALL ON TABLE public.analysis_chat_messages TO anon;
GRANT ALL ON TABLE public.analysis_chat_messages TO authenticated;
GRANT ALL ON TABLE public.analysis_chat_messages TO service_role;

GRANT ALL ON TABLE public.analysis_rewrite_versions TO anon;
GRANT ALL ON TABLE public.analysis_rewrite_versions TO authenticated;
GRANT ALL ON TABLE public.analysis_rewrite_versions TO service_role;