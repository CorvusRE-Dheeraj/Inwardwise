-- The public_feedback view exposes only non-sensitive feedback columns.
-- Make it a security-definer view so anonymous users can read it through
-- the view without needing direct SELECT privileges on the base table.
CREATE OR REPLACE VIEW public.public_feedback
WITH (security_invoker = false) AS
SELECT id, improved, paid, recommend, suggestions, created_at
FROM public.feedback;

-- Allow public and signed-in users to read the safe view.
GRANT SELECT ON public.public_feedback TO anon, authenticated;

-- Ensure direct anonymous reads of the base table remain blocked.
-- (The previous migration already revoked this; the line is idempotent.)
REVOKE SELECT ON public.feedback FROM anon;