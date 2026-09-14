CREATE TABLE public.mantra_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text,
  mantra_text text NOT NULL,
  repeats integer NOT NULL DEFAULT 12,
  scheduled_at timestamptz,
  timezone text NOT NULL DEFAULT 'UTC',
  status text NOT NULL DEFAULT 'scheduled',
  provider_call_id text,
  call_attempts integer NOT NULL DEFAULT 0,
  last_error text,
  last_call_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mantra_calls_user_unique UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mantra_calls TO authenticated;
GRANT ALL ON public.mantra_calls TO service_role;

ALTER TABLE public.mantra_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own mantra call"
ON public.mantra_calls FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX mantra_calls_due_idx ON public.mantra_calls (status, scheduled_at);

CREATE TRIGGER mantra_calls_updated_at
BEFORE UPDATE ON public.mantra_calls
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();