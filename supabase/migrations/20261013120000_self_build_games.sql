-- Self Build games (ported from the tech156 Lovable project, where these
-- tables were created outside migrations). Columns match its generated
-- types.ts; policies are written here: each member reads and writes only
-- their own rows, and nothing is visible to anyone else.

CREATE TABLE public.self_build_game_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_key text not null,
  prompt_key text not null,
  content jsonb not null default '{}'::jsonb,
  save_to_avatar boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX self_build_game_reflections_user_idx
  ON public.self_build_game_reflections (user_id, created_at desc);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.self_build_game_reflections TO authenticated;
GRANT ALL ON public.self_build_game_reflections TO service_role;

ALTER TABLE public.self_build_game_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own game reflections"
ON public.self_build_game_reflections FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER self_build_game_reflections_updated_at
BEFORE UPDATE ON public.self_build_game_reflections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Words a member chose to keep from Word Lens / Word Pair, reviewed in the
-- Word Garden.
CREATE TABLE public.self_build_saved_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reflection_id uuid references public.self_build_game_reflections (id) on delete set null,
  word text not null check (char_length(word) between 1 and 60),
  user_definition text check (char_length(user_definition) <= 500),
  example text check (char_length(example) <= 500),
  garden_status text not null default 'growing'
    check (garden_status in ('growing', 'useful', 'not_quite', 'retired')),
  review_count integer not null default 0,
  next_review_at timestamptz,
  created_at timestamptz not null default now()
);

CREATE INDEX self_build_saved_words_user_idx
  ON public.self_build_saved_words (user_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.self_build_saved_words TO authenticated;
GRANT ALL ON public.self_build_saved_words TO service_role;

ALTER TABLE public.self_build_saved_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saved words"
ON public.self_build_saved_words FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
