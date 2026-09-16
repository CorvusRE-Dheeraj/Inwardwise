ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;

UPDATE public.feedback
SET hidden = true
WHERE id IN (
  '01bda259-e342-416c-a48e-981c3e3b36af',
  'e52234c2-bd66-4276-9cab-855fd46161a4'
);

CREATE OR REPLACE FUNCTION public.get_public_feedback(_limit integer DEFAULT 100)
 RETURNS TABLE(id uuid, improved text, paid text, recommend text, suggestions text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT f.id, f.improved, f.paid, f.recommend, f.suggestions, f.created_at
  FROM public.feedback f
  WHERE f.hidden = false
  ORDER BY f.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 100), 1), 200);
$function$;