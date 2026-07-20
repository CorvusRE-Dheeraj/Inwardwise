
-- Reset grants on feedback for anon/authenticated
REVOKE ALL ON public.feedback FROM anon, authenticated;

-- Anonymous: can insert, and can SELECT only non-identifying columns
GRANT INSERT ON public.feedback TO anon;
GRANT SELECT (id, improved, paid, recommend, suggestions, created_at) ON public.feedback TO anon;

-- Authenticated: can insert, SELECT non-identifying columns; author_name only via admin policy path
GRANT INSERT ON public.feedback TO authenticated;
GRANT SELECT (id, improved, paid, recommend, suggestions, created_at, author_name) ON public.feedback TO authenticated;

GRANT ALL ON public.feedback TO service_role;
