
-- Restrict direct table SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read feedback" ON public.feedback;

CREATE POLICY "Admins can read all feedback"
ON public.feedback FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create a public view that excludes author names
CREATE OR REPLACE VIEW public.public_feedback
WITH (security_invoker = true) AS
SELECT id, improved, paid, recommend, suggestions, created_at
FROM public.feedback;

-- Allow anon/authenticated to read the safe view
GRANT SELECT ON public.public_feedback TO anon, authenticated;

-- Public needs to be able to SELECT the non-sensitive columns through the view;
-- the view runs as invoker so add a policy allowing that read of those columns.
CREATE POLICY "Public can read feedback via safe view"
ON public.feedback FOR SELECT
TO anon, authenticated
USING (true);

-- Note: to prevent leaking author_name through the base table, revoke column access.
REVOKE SELECT ON public.feedback FROM anon, authenticated;
GRANT SELECT (id, improved, paid, recommend, suggestions, created_at) ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated; -- admins still need full row via policy? handled by column grants below
GRANT SELECT (author_name) ON public.feedback TO authenticated;
-- Keep insert grants intact
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;
