DROP POLICY IF EXISTS "Public can read feedback via safe view" ON public.feedback;

REVOKE SELECT ON public.feedback FROM anon;
REVOKE SELECT (id, improved, paid, recommend, suggestions, created_at) ON public.feedback FROM anon;

GRANT SELECT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;

CREATE OR REPLACE VIEW public.public_feedback
WITH (security_invoker = false) AS
SELECT id, improved, paid, recommend, suggestions, created_at
FROM public.feedback;

GRANT SELECT ON public.public_feedback TO anon, authenticated;

CREATE POLICY "authors update own pending stories"
ON public.connect_stories FOR UPDATE
TO authenticated
USING (auth.uid() = owner_user_id AND is_published = false AND moderation_status = 'pending')
WITH CHECK (auth.uid() = owner_user_id AND is_published = false AND moderation_status = 'pending');

CREATE POLICY "authors delete own pending stories"
ON public.connect_stories FOR DELETE
TO authenticated
USING (auth.uid() = owner_user_id AND is_published = false);