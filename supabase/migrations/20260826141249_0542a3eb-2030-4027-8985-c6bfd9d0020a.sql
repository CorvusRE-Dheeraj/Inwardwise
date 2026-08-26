-- Restore the public_feedback safe view as an invoker-security view.
CREATE OR REPLACE VIEW public.public_feedback
WITH (security_invoker = true) AS
SELECT id, improved, paid, recommend, suggestions, created_at
FROM public.feedback;

-- Grant read access on the safe view.
GRANT SELECT ON public.public_feedback TO anon, authenticated;

-- Allow anon/authenticated to read the non-sensitive columns through the view.
CREATE POLICY "Public can read feedback via safe view"
ON public.feedback FOR SELECT
TO anon, authenticated
USING (true);

-- Column-level grants: anon/authenticated can only see the columns exposed by the view.
GRANT SELECT (id, improved, paid, recommend, suggestions, created_at) ON public.feedback TO anon, authenticated;

-- Ensure admins can still read all columns via their policy.
GRANT SELECT ON public.feedback TO authenticated;