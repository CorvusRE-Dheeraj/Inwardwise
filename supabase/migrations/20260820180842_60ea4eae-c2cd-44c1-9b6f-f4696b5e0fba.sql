
-- connect_prompts
CREATE TABLE public.connect_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'analyzed',
  risk_flag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_prompts TO authenticated;
GRANT ALL ON public.connect_prompts TO service_role;
ALTER TABLE public.connect_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prompts" ON public.connect_prompts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- connect_insights
CREATE TABLE public.connect_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.connect_prompts ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reflection TEXT NOT NULL,
  aggregate_insight TEXT,
  reading_title TEXT,
  reading_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_insights TO authenticated;
GRANT ALL ON public.connect_insights TO service_role;
ALTER TABLE public.connect_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own insights" ON public.connect_insights FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- connect_stories
CREATE TABLE public.connect_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  pseudonym TEXT NOT NULL DEFAULT 'Anonymous Member',
  category TEXT NOT NULL,
  situation TEXT NOT NULL,
  fear TEXT,
  action_taken TEXT,
  outcome TEXT,
  lesson TEXT,
  advice TEXT,
  audio_url TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.connect_stories TO authenticated;
GRANT ALL ON public.connect_stories TO service_role;
ALTER TABLE public.connect_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published stories readable" ON public.connect_stories FOR SELECT TO authenticated
  USING (is_published = true AND moderation_status = 'approved');
CREATE POLICY "authors read own stories" ON public.connect_stories FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id);
CREATE POLICY "authors submit stories" ON public.connect_stories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_user_id AND is_published = false AND moderation_status = 'pending');

-- connect_groups
CREATE TABLE public.connect_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'forming',
  max_members INTEGER NOT NULL DEFAULT 8,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.connect_groups TO authenticated;
GRANT ALL ON public.connect_groups TO service_role;
ALTER TABLE public.connect_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups readable" ON public.connect_groups FOR SELECT TO authenticated
  USING (moderation_status = 'approved');

-- connect_group_members
CREATE TABLE public.connect_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.connect_groups ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  pseudonym TEXT NOT NULL DEFAULT 'Anonymous Member',
  status TEXT NOT NULL DEFAULT 'waitlist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_group_members TO authenticated;
GRANT ALL ON public.connect_group_members TO service_role;
ALTER TABLE public.connect_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own membership" ON public.connect_group_members FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- connect_reports
CREATE TABLE public.connect_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.connect_reports TO authenticated;
GRANT ALL ON public.connect_reports TO service_role;
ALTER TABLE public.connect_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports insert" ON public.connect_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "own reports read" ON public.connect_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_user_id);

-- starter approved stories
INSERT INTO public.connect_stories (pseudonym, category, situation, fear, action_taken, outcome, lesson, advice, moderation_status, is_published) VALUES
('Anonymous Member', 'Career uncertainty', 'I had spent eleven years in a role I no longer believed in, and every Sunday evening felt heavier than the last.', 'That leaving would look like failure to my family, and that I would not be able to replace the income.', 'I gave myself six months to test a different kind of work on evenings and weekends before making any decision.', 'The test work did not become my career, but it showed me the part of my job I actually valued. I moved teams rather than industries.', 'The urge to leave was really an urge to be useful in a different way. I needed information, not courage.', 'Run a small experiment before you make an irreversible choice. The experiment usually tells you what the fear cannot.', 'approved', true),
('Anonymous Member', 'Belonging & loneliness', 'I moved to a city where I knew no one and spent most evenings alone in a full apartment building.', 'That there was something wrong with me — that other people simply found this easy.', 'I chose one recurring thing — a Tuesday reading group — and went even on the nights I did not feel like it.', 'It took four months before anyone learned my name. By month six, two of them were people I could call.', 'Belonging is not found, it is accumulated through repetition in one place.', 'Pick one repeated place, not five interesting ones. Frequency does what charm cannot.', 'approved', true),
('Anonymous Member', 'Comparison with others', 'Every time I opened my phone I felt behind — house, promotion, family, all of it happening to everyone else.', 'That I had wasted my thirties, and that it was already too late to catch up.', 'I wrote down what I actually wanted, separately from what I felt I should want, and compared the two lists.', 'A third of my ambitions turned out to belong to other people. Letting them go made the remaining ones feel possible.', 'Comparison does not tell you what you want. It only tells you what is visible.', 'Write your own list before you read anyone else''s. Visibility is not the same as value.', 'approved', true),
('Anonymous Member', 'Major life transitions', 'After my divorce I had to rebuild a daily life that had been shared for fourteen years.', 'That I would be defined by it, and that my children would carry the damage.', 'I kept three small rituals from the old life and deliberately built three new ones of my own.', 'The first year was hard and honest. The second year was quieter, and mine.', 'Continuity and change are not opposites. Keeping some of the old made the new bearable.', 'Do not rebuild everything at once. Keep the things that still fit you.', 'approved', true),
('Anonymous Member', 'Feeling stuck', 'I knew something had to change but could not name what, so I changed nothing for almost two years.', 'That any move would be the wrong one, and I would have no one to blame but myself.', 'I stopped trying to find the answer and started listing the smallest reversible steps available to me.', 'The third small step opened a door I had not been able to see from where I was standing.', 'Stuckness is often a decision made too large. Reduce the size of the choice.', 'You do not need the whole path. You need the next reversible step.', 'approved', true),
('Anonymous Member', 'Relationships', 'The same argument kept repeating with my partner, in different words, for years.', 'That the argument meant we were fundamentally incompatible.', 'We agreed to describe the underlying objective each of us was defending, before defending it.', 'The objectives turned out to be compatible. The tactics were not, and those were easier to change.', 'Recurring conflict is usually a disagreement about method disguised as a disagreement about values.', 'Ask what the other person is protecting before you argue with how they protect it.', 'approved', true);
