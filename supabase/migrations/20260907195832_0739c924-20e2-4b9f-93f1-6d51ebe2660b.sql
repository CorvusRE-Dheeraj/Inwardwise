CREATE TABLE public.connect_only_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL,
  health_notes TEXT,
  location TEXT,
  interests TEXT,
  availability TEXT,
  contact_email TEXT,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX connect_only_sessions_user_idx ON public.connect_only_sessions(user_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_only_sessions TO authenticated;
GRANT ALL ON public.connect_only_sessions TO service_role;
ALTER TABLE public.connect_only_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own connect only sessions" ON public.connect_only_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.connect_only_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.connect_only_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  section_id UUID REFERENCES public.journey_sections(id) ON DELETE SET NULL,
  story_id UUID,
  sequence INTEGER NOT NULL DEFAULT 1,
  channels TEXT[] NOT NULL DEFAULT ARRAY['in_app']::text[],
  state TEXT NOT NULL DEFAULT 'sent',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  send_count INTEGER NOT NULL DEFAULT 1,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX connect_only_deliveries_user_idx ON public.connect_only_deliveries(user_id, session_id, state);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_only_deliveries TO authenticated;
GRANT ALL ON public.connect_only_deliveries TO service_role;
ALTER TABLE public.connect_only_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own connect only deliveries" ON public.connect_only_deliveries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER connect_only_sessions_updated_at BEFORE UPDATE ON public.connect_only_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();