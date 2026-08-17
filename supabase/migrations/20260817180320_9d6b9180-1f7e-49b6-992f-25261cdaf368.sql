CREATE TABLE public.meditation_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  phone_number text,
  scheduled_at timestamptz,
  duration_minutes integer not null default 10,
  voice_enabled boolean not null default false,
  timezone text not null default 'UTC',
  status text not null default 'scheduled' check (status in ('scheduled','sent','failed','cancelled')),
  script jsonb,
  last_error text,
  last_call_at timestamptz,
  call_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meditation_settings TO authenticated;
GRANT ALL ON public.meditation_settings TO service_role;

ALTER TABLE public.meditation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own meditation settings"
ON public.meditation_settings FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX meditation_settings_due_idx ON public.meditation_settings (status, scheduled_at);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER meditation_settings_updated_at
BEFORE UPDATE ON public.meditation_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();