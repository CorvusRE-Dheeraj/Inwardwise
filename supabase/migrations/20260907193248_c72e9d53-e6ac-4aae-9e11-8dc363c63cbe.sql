DROP POLICY IF EXISTS "manage employees edit" ON public.employees;

CREATE POLICY "manage employees edit"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  public.admin_has_perm(auth.uid(), 'employees.edit')
  AND NOT public.is_super_admin(user_id)
  AND user_id <> auth.uid()
)
WITH CHECK (
  public.admin_has_perm(auth.uid(), 'employees.edit')
  AND NOT public.is_super_admin(user_id)
  AND user_id <> auth.uid()
);