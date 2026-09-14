
CREATE TABLE public.mantra_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mantra_library TO authenticated;
GRANT ALL ON public.mantra_library TO service_role;
ALTER TABLE public.mantra_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own mantras" ON public.mantra_library FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER mantra_library_updated_at BEFORE UPDATE ON public.mantra_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mantra_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  time_of_day text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  repeats integer NOT NULL DEFAULT 12 CHECK (repeats BETWEEN 1 AND 108),
  mantras_per_call integer NOT NULL DEFAULT 1 CHECK (mantras_per_call BETWEEN 1 AND 2),
  is_active boolean NOT NULL DEFAULT true,
  next_run_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','calling','sent','failed','paused')),
  provider_call_id text,
  call_attempts integer NOT NULL DEFAULT 0,
  last_error text,
  last_call_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mantra_schedules TO authenticated;
GRANT ALL ON public.mantra_schedules TO service_role;
ALTER TABLE public.mantra_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own mantra schedules" ON public.mantra_schedules FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER mantra_schedules_updated_at BEFORE UPDATE ON public.mantra_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX mantra_schedules_due_idx ON public.mantra_schedules (next_run_at) WHERE is_active;
