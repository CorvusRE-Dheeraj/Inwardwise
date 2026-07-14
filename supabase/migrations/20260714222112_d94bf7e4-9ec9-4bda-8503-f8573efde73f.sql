
-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Activity events
CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_events_user_idx ON public.activity_events (user_id);
CREATE INDEX IF NOT EXISTS activity_events_type_idx ON public.activity_events (event_type);
CREATE INDEX IF NOT EXISTS activity_events_created_idx ON public.activity_events (created_at DESC);

GRANT SELECT ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity"
  ON public.activity_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Claim first admin (only if none exists)
CREATE OR REPLACE FUNCTION public.claim_admin_if_none()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  admin_count int;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count > 0 THEN
    RETURN public.has_role(uid, 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_admin_if_none() TO authenticated;

-- Log sign-ins automatically via auth.users updates (last_sign_in_at)
CREATE OR REPLACE FUNCTION public.log_sign_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at
     AND NEW.last_sign_in_at IS NOT NULL THEN
    INSERT INTO public.activity_events (user_id, event_type, metadata)
    VALUES (NEW.id, 'sign_in', jsonb_build_object('email', NEW.email));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.log_sign_in();
