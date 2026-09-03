import { supabase } from "@/integrations/supabase/client";

/**
 * The admin portal tables are not part of the generated public-site types,
 * so we use a loosely typed view of the same authenticated client.
 * All authorization is enforced by row-level security in the database.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adb = supabase as any;

export type AdminContext = {
  employee_id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  is_super_admin: boolean;
  role: string;
  permissions: string[];
} | null;

export async function fetchAdminContext(): Promise<AdminContext> {
  const { data, error } = await adb.rpc("my_admin_context");
  if (error) throw new Error(error.message);
  return (data as AdminContext) ?? null;
}

export async function claimSuperAdminIfNone(): Promise<boolean> {
  const { data, error } = await adb.rpc("claim_super_admin_if_none");
  if (error) throw new Error(error.message);
  return data === true;
}

export async function logAudit(input: {
  employeeId: string | null;
  actorEmail?: string | null;
  action: string;
  module: string;
  recordId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await adb.from("audit_logs").insert({
      employee_id: input.employeeId,
      actor_email: input.actorEmail ?? null,
      action: input.action,
      module: input.module,
      record_id: input.recordId ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    /* audit logging must never block the action */
  }
}
