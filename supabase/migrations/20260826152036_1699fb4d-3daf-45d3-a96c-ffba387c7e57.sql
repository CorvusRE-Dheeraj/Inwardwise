DROP VIEW IF EXISTS public.public_feedback;

CREATE OR REPLACE FUNCTION public.get_public_feedback(_limit integer DEFAULT 100)
RETURNS TABLE (
  id uuid,
  improved text,
  paid text,
  recommend text,
  suggestions text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.improved, f.paid, f.recommend, f.suggestions, f.created_at
  FROM public.feedback f
  ORDER BY f.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 100), 1), 200);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_feedback(integer) TO anon, authenticated;