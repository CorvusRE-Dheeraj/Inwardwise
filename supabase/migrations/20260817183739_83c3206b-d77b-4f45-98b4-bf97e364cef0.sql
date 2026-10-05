CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('meditation-call-dispatch')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'meditation-call-dispatch');

-- The 'meditation-call-dispatch' job used to be scheduled here, posting every
-- minute to the Lovable-hosted /api/public/meditation-dispatch with a hardcoded
-- x-cron-secret. The app no longer runs on Lovable, so it is not scheduled.
-- Schedule it again once the dispatcher runs as a Supabase Edge Function, with
-- the secret read from Vault rather than written into a migration.
