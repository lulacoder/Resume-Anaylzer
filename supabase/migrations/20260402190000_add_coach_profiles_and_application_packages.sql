-- Intake-driven AI coach profiles and generated application packages

CREATE TABLE IF NOT EXISTS public.analysis_coach_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role text,
  target_seniority text,
  tone text,
  focus_area text,
  target_companies jsonb NOT NULL DEFAULT '[]'::jsonb,
  must_keep jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  career_story text,
  constraints text,
  job_search_priorities jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  intake_status text NOT NULL DEFAULT 'draft' CHECK (intake_status IN ('draft', 'ready')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (analysis_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.analysis_application_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_profile_id uuid REFERENCES public.analysis_coach_profiles(id) ON DELETE SET NULL,
  version_number integer NOT NULL,
  package_name text NOT NULL DEFAULT 'Application kit',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  generation_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (analysis_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_coach_profiles_analysis_updated
  ON public.analysis_coach_profiles(analysis_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_profiles_user_updated
  ON public.analysis_coach_profiles(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_application_packages_analysis_version
  ON public.analysis_application_packages(analysis_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_application_packages_analysis_created
  ON public.analysis_application_packages(analysis_id, created_at DESC);

ALTER TABLE public.analysis_coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_application_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own coach profiles"
  ON public.analysis_coach_profiles
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can fully manage their own application packages"
  ON public.analysis_application_packages
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.analysis_coach_profiles TO anon;
GRANT ALL ON TABLE public.analysis_coach_profiles TO authenticated;
GRANT ALL ON TABLE public.analysis_coach_profiles TO service_role;

GRANT ALL ON TABLE public.analysis_application_packages TO anon;
GRANT ALL ON TABLE public.analysis_application_packages TO authenticated;
GRANT ALL ON TABLE public.analysis_application_packages TO service_role;
