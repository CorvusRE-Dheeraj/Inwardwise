CREATE TABLE public.avatar_consult_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text,
  focus text NOT NULL DEFAULT '',
  scheduled_at timestamp with time zone,
  timezone text NOT NULL DEFAULT 'UTC',
  duration_minutes integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'scheduled',
  provider_call_id text,
  last_error text,
  last_call_at timestamp with time zone,
  call_attempts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avatar_consult_calls TO authenticated;
GRANT ALL ON public.avatar_consult_calls TO service_role;

ALTER TABLE public.avatar_consult_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own consultation calls"
ON public.avatar_consult_calls FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX avatar_consult_calls_user_id_key ON public.avatar_consult_calls (user_id);
CREATE INDEX avatar_consult_calls_due_idx ON public.avatar_consult_calls (status, scheduled_at);

CREATE TRIGGER update_avatar_consult_calls_updated_at
BEFORE UPDATE ON public.avatar_consult_calls
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();