
CREATE TABLE public.characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_label text NOT NULL DEFAULT 'Fictional character',
  personality text,
  avatar_key text NOT NULL DEFAULT 'merry',
  accent text NOT NULL DEFAULT 'royal',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.character_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scenario_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.character_scenarios(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scenario_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.character_scenarios(id) ON DELETE CASCADE,
  scene_number integer NOT NULL,
  body text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, scene_number)
);

CREATE TABLE public.scenario_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid NOT NULL REFERENCES public.scenario_scenes(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  allow_free_text boolean NOT NULL DEFAULT true,
  free_text_label text NOT NULL DEFAULT 'Why?',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scenario_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.scenario_questions(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_scenario_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES public.character_scenarios(id) ON DELETE CASCADE,
  current_scene integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'in_progress',
  familiarity text,
  familiarity_note text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scenario_id)
);

CREATE TABLE public.user_scenario_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES public.character_scenarios(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.scenario_questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.scenario_options(id) ON DELETE SET NULL,
  free_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

GRANT SELECT ON public.characters TO authenticated;
GRANT SELECT ON public.character_scenarios TO authenticated;
GRANT SELECT ON public.scenario_themes TO authenticated;
GRANT SELECT ON public.scenario_scenes TO authenticated;
GRANT SELECT ON public.scenario_questions TO authenticated;
GRANT SELECT ON public.scenario_options TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.characters TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.character_scenarios TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scenario_themes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scenario_scenes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scenario_questions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scenario_options TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_scenario_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_scenario_responses TO authenticated;
GRANT ALL ON public.characters, public.character_scenarios, public.scenario_themes, public.scenario_scenes, public.scenario_questions, public.scenario_options, public.user_scenario_interactions, public.user_scenario_responses TO service_role;

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scenario_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scenario_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read characters" ON public.characters FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage characters" ON public.characters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "read scenarios" ON public.character_scenarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage scenarios" ON public.character_scenarios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "read themes" ON public.scenario_themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage themes" ON public.scenario_themes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "read scenes" ON public.scenario_scenes FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage scenes" ON public.scenario_scenes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "read questions" ON public.scenario_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage questions" ON public.scenario_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "read options" ON public.scenario_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage options" ON public.scenario_options FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own interactions" ON public.user_scenario_interactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own responses" ON public.user_scenario_responses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_scenario_scenes_scenario ON public.scenario_scenes(scenario_id, scene_number);
CREATE INDEX idx_scenario_questions_scene ON public.scenario_questions(scene_id);
CREATE INDEX idx_scenario_options_question ON public.scenario_options(question_id);
CREATE INDEX idx_user_scenario_responses_user ON public.user_scenario_responses(user_id, scenario_id);

CREATE TRIGGER trg_characters_updated BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_character_scenarios_updated BEFORE UPDATE ON public.character_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_scenario_scenes_updated BEFORE UPDATE ON public.scenario_scenes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_scenario_questions_updated BEFORE UPDATE ON public.scenario_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_scenario_interactions_updated BEFORE UPDATE ON public.user_scenario_interactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_scenario_responses_updated BEFORE UPDATE ON public.user_scenario_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.characters (slug, name, personality, avatar_key, accent, sort_order) VALUES
  ('merry', 'Merry', 'Warm and reflective, tends to carry things quietly before speaking about them.', 'merry', 'royal', 1),
  ('alex', 'Alex', 'Practical and driven, weighs options carefully and dislikes being rushed.', 'alex', 'ink', 2);

INSERT INTO public.character_scenarios (character_id, slug, title, summary, sort_order)
SELECT id, 'merry-difficult-period', 'Merry''s Story',
  'Feeling overwhelmed and disconnected during a difficult period of life.', 1
FROM public.characters WHERE slug = 'merry';

INSERT INTO public.character_scenarios (character_id, slug, title, summary, sort_order)
SELECT id, 'alex-competing-priorities', 'Alex''s Story',
  'Trying to make an important decision while dealing with competing priorities.', 1
FROM public.characters WHERE slug = 'alex';

INSERT INTO public.scenario_themes (scenario_id, label, sort_order)
SELECT id, t.label, t.ord FROM public.character_scenarios,
  (VALUES ('Feeling overwhelmed',1),('Uncertainty',2),('Disconnection',3),('Difficult decisions',4)) AS t(label, ord)
WHERE slug = 'merry-difficult-period';

INSERT INTO public.scenario_themes (scenario_id, label, sort_order)
SELECT id, t.label, t.ord FROM public.character_scenarios,
  (VALUES ('Decision making',1),('Uncertainty',2),('Pressure',3),('Priorities',4)) AS t(label, ord)
WHERE slug = 'alex-competing-priorities';

INSERT INTO public.scenario_scenes (scenario_id, scene_number, body)
SELECT id, s.n, s.body FROM public.character_scenarios,
  (VALUES
    (1, 'Merry has been going through a difficult period. She has been feeling overwhelmed and has started withdrawing from some of the activities she previously enjoyed.'),
    (2, 'Her mornings begin earlier than they used to, not because she wants them to, but because sleep has become unreliable. She notices she is tired before the day has started.'),
    (3, 'A friend messages to ask how she is. Merry reads the message, drafts a reply, and then puts the phone down without sending anything.'),
    (4, 'At work, the tasks are the same as always, yet each one feels heavier. She finds herself rereading the same sentence several times.'),
    (5, 'One evening she walks a longer way home. Nothing is resolved, but the noise in her head is a little quieter for a while.'),
    (6, 'Merry has not made a decision about anything yet. She has simply begun to notice what has been happening, and that noticing feels like a small beginning.')
  ) AS s(n, body)
WHERE slug = 'merry-difficult-period';

INSERT INTO public.scenario_scenes (scenario_id, scene_number, body)
SELECT id, s.n, s.body FROM public.character_scenarios,
  (VALUES
    (1, 'Alex is trying to make an important decision. Two things he cares about are pulling in different directions, and both feel reasonable.'),
    (2, 'People around him have opinions. Each opinion sounds sensible on its own, and together they leave him less certain than before.'),
    (3, 'He writes the choice down on paper. Seeing it written makes it smaller, though not simpler.'),
    (4, 'A deadline appears. Alex notices he is tempted to decide quickly just to end the discomfort of not deciding.'),
    (5, 'He tries separating what he actually wants from what he feels he is expected to want. The two lists are not the same.'),
    (6, 'Alex still has not decided. What has changed is that he now knows which question he is really answering.')
  ) AS s(n, body)
WHERE slug = 'alex-competing-priorities';

INSERT INTO public.scenario_questions (scene_id, prompt, sort_order)
SELECT sc.id, 'What would you do if you were in Merry''s situation?', 1
FROM public.scenario_scenes sc
JOIN public.character_scenarios cs ON cs.id = sc.scenario_id
WHERE cs.slug = 'merry-difficult-period' AND sc.scene_number = 3;

INSERT INTO public.scenario_questions (scene_id, prompt, sort_order)
SELECT sc.id, 'What would you do if you were in Alex''s situation?', 1
FROM public.scenario_scenes sc
JOIN public.character_scenarios cs ON cs.id = sc.scenario_id
WHERE cs.slug = 'alex-competing-priorities' AND sc.scene_number = 4;

INSERT INTO public.scenario_options (question_id, label, sort_order)
SELECT q.id, o.label, o.ord FROM public.scenario_questions q
JOIN public.scenario_scenes sc ON sc.id = q.scene_id
JOIN public.character_scenarios cs ON cs.id = sc.scenario_id,
  (VALUES ('Talk to someone she trusts',1),('Take some time to herself',2),('Try to understand what is causing the situation',3),('Make an immediate change',4),('I am not sure',5)) AS o(label, ord)
WHERE cs.slug = 'merry-difficult-period';

INSERT INTO public.scenario_options (question_id, label, sort_order)
SELECT q.id, o.label, o.ord FROM public.scenario_questions q
JOIN public.scenario_scenes sc ON sc.id = q.scene_id
JOIN public.character_scenarios cs ON cs.id = sc.scenario_id,
  (VALUES ('Talk it through with someone he trusts',1),('Give it more time before deciding',2),('Try to understand what is really at stake',3),('Decide now and move on',4),('I am not sure',5)) AS o(label, ord)
WHERE cs.slug = 'alex-competing-priorities';
