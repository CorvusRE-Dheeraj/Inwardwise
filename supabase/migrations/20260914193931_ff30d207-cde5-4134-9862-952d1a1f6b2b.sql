CREATE TABLE public.connect_book_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  section_id UUID,
  section_title TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  send_count INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_book_reads TO authenticated;
GRANT ALL ON public.connect_book_reads TO service_role;
ALTER TABLE public.connect_book_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own book reads" ON public.connect_book_reads
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX connect_book_reads_user_idx ON public.connect_book_reads (user_id, created_at DESC);

CREATE TABLE public.connect_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  read_id UUID REFERENCES public.connect_book_reads ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'written',
  body TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.connect_reflections TO authenticated;
GRANT ALL ON public.connect_reflections TO service_role;
ALTER TABLE public.connect_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own reflections" ON public.connect_reflections
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX connect_reflections_user_idx ON public.connect_reflections (user_id, created_at DESC);