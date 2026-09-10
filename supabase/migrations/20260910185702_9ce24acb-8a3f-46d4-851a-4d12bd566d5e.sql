
ALTER TABLE public.scenario_scenes
  ADD COLUMN IF NOT EXISTS character_state text NOT NULL DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS environment text,
  ADD COLUMN IF NOT EXISTS animation text,
  ADD COLUMN IF NOT EXISTS narration text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

ALTER TABLE public.scenario_scenes
  DROP CONSTRAINT IF EXISTS scenario_scenes_character_state_check;
ALTER TABLE public.scenario_scenes
  ADD CONSTRAINT scenario_scenes_character_state_check
  CHECK (character_state IN ('neutral','thoughtful','concerned','uncertain','hopeful','relieved','reflective'));

DROP POLICY IF EXISTS "manage employees create" ON public.employees;
CREATE POLICY "manage employees create" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK (
    admin_has_perm(auth.uid(), 'employees.create')
    AND (
      is_super_admin(auth.uid())
      OR (is_super_admin = false AND role_id IS NULL AND user_id IS DISTINCT FROM auth.uid())
    )
  );
