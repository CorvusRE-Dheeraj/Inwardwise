CREATE TABLE public.avatar_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  pin_hash TEXT,
  pin_salt TEXT,
  voice_enabled BOOLEAN NOT NULL DEFAULT false,
  phone_number TEXT,
  scheduled_call_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avatar_profiles TO authenticated;
GRANT ALL ON public.avatar_profiles TO service_role;
ALTER TABLE public.avatar_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own avatar profile" ON public.avatar_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.avatar_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  dimension_number SMALLINT NOT NULL CHECK (dimension_number BETWEEN 1 AND 5),
  progress_pct SMALLINT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, dimension_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avatar_dimensions TO authenticated;
GRANT ALL ON public.avatar_dimensions TO service_role;
ALTER TABLE public.avatar_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own avatar dimensions" ON public.avatar_dimensions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.avatar_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  dimension_number SMALLINT NOT NULL CHECK (dimension_number BETWEEN 1 AND 5),
  question_key TEXT NOT NULL,
  answer_text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avatar_answers TO authenticated;
GRANT ALL ON public.avatar_answers TO service_role;
ALTER TABLE public.avatar_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own avatar answers" ON public.avatar_answers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);