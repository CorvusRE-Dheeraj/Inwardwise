
-- Drop self-promotion function (privilege-escalation surface)
DROP FUNCTION IF EXISTS public.claim_admin_if_none();

-- Tighten EXECUTE on has_role: allow only authenticated (needed by RLS policies), revoke from public/anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Explicit deny policies on user_roles for authenticated clients
CREATE POLICY "Deny role inserts from clients"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny role updates from clients"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny role deletes from clients"
  ON public.user_roles FOR DELETE TO authenticated
  USING (false);

-- Explicit deny policy on activity_events for authenticated clients (writes go through service role)
CREATE POLICY "Deny activity inserts from clients"
  ON public.activity_events FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny activity updates from clients"
  ON public.activity_events FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny activity deletes from clients"
  ON public.activity_events FOR DELETE TO authenticated
  USING (false);
