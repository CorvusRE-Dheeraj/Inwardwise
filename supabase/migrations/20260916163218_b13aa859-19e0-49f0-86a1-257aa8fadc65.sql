-- Deep learn memory: every AI prompt/response exchange, super-admin readable only.
CREATE TABLE public.ai_memory_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  surface text NOT NULL,
  model text,
  prompt text,
  response text,
  ok boolean NOT NULL DEFAULT true,
  latency_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_memory_log_created_idx ON public.ai_memory_log (created_at DESC);
CREATE INDEX ai_memory_log_surface_idx ON public.ai_memory_log (surface);
CREATE INDEX ai_memory_log_user_idx ON public.ai_memory_log (user_id);

GRANT SELECT ON public.ai_memory_log TO authenticated;
GRANT ALL ON public.ai_memory_log TO service_role;

ALTER TABLE public.ai_memory_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super admins read ai memory"
  ON public.ai_memory_log FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Activity events: allow super admins to read every event for the memory view.
CREATE POLICY "super admins read activity events"
  ON public.activity_events FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Security fix: only super admins may change privileged columns on employees.
CREATE OR REPLACE FUNCTION public.guard_employee_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW; -- trusted server/service context
  END IF;
  IF (NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin
      OR NEW.role_id IS DISTINCT FROM OLD.role_id)
     AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only a Super Admin can change roles or super admin status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_employee_privileges_trg
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.guard_employee_privileges();
