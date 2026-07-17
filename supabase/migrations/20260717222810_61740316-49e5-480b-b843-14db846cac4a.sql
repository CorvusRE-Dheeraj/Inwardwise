DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit non-empty feedback" ON public.feedback
  FOR INSERT
  WITH CHECK (
    coalesce(length(btrim(improved)), 0) > 0
    OR coalesce(length(btrim(paid)), 0) > 0
    OR coalesce(length(btrim(recommend)), 0) > 0
    OR coalesce(length(btrim(suggestions)), 0) > 0
  );