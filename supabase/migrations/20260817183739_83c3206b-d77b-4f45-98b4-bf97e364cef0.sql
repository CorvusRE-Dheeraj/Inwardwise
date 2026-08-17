CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('meditation-call-dispatch')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'meditation-call-dispatch');

SELECT cron.schedule(
  'meditation-call-dispatch',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--cd008caf-0d68-4a9e-9728-28d447940785.lovable.app/api/public/meditation-dispatch',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "XmRhtikmEPGhI839m1Bo03pfkOQSDllQeqMpv1mkZd0"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);