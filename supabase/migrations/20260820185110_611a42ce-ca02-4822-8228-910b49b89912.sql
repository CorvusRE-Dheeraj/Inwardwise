CREATE TABLE public.connect_story_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  category TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  provider_call_id TEXT,
  last_error TEXT,
  last_call_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_story_calls TO authenticated;
GRANT ALL ON public.connect_story_calls TO service_role;

ALTER TABLE public.connect_story_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own story calls"
ON public.connect_story_calls FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER connect_story_calls_updated_at
BEFORE UPDATE ON public.connect_story_calls
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();