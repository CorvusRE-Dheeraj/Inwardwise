CREATE TABLE IF NOT EXISTS public.private_dimensions (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shadow TEXT NOT NULL DEFAULT '',
  enemy TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_dimensions TO authenticated;
GRANT ALL ON public.private_dimensions TO service_role;
ALTER TABLE public.private_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pd own row select" ON public.private_dimensions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pd own row insert" ON public.private_dimensions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pd own row update" ON public.private_dimensions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pd own row delete" ON public.private_dimensions FOR DELETE TO authenticated USING (auth.uid() = user_id);