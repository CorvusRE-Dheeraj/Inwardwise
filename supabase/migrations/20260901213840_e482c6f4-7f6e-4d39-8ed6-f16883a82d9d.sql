ALTER TABLE public.meditation_settings
  ADD COLUMN IF NOT EXISTS provider_call_id text,
  ADD COLUMN IF NOT EXISTS call_attempts integer NOT NULL DEFAULT 0;