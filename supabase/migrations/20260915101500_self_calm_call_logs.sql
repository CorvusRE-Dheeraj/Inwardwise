CREATE TABLE public.meditation_call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  meditation_setting_id uuid REFERENCES public.meditation_settings(id) ON DELETE SET NULL,
  phone_number text,
  scheduled_at timestamptz,
  duration_minutes integer NOT NULL DEFAULT 10,
  attempt_number integer NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN ('queued', 'calling', 'completed', 'unanswered', 'cancelled', 'requeued', 'failed')),
  provider_call_id text,
  failure_reason text,
  placed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.meditation_call_logs TO authenticated;
GRANT ALL ON public.meditation_call_logs TO service_role;

ALTER TABLE public.meditation_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own meditation call logs"
ON public.meditation_call_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX meditation_call_logs_user_created_idx
ON public.meditation_call_logs (user_id, created_at DESC);

CREATE INDEX meditation_call_logs_provider_idx
ON public.meditation_call_logs (provider_call_id)
WHERE provider_call_id IS NOT NULL;

CREATE TRIGGER meditation_call_logs_updated_at
BEFORE UPDATE ON public.meditation_call_logs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
