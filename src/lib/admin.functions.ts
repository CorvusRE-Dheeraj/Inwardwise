import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const claimAdminIfNone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_admin_if_none");
    if (error) throw new Error(error.message);
    return { isAdmin: data === true };
  });

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { isAdmin: data === true };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // All events (recent first, limited)
    const { data: events, error: evErr } = await supabaseAdmin
      .from("activity_events")
      .select("id, user_id, event_type, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (evErr) throw new Error(evErr.message);

    // User list (Auth Admin API)
    const { data: usersPage, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (usersErr) throw new Error(usersErr.message);

    const users = usersPage.users.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    }));

    // Aggregate per-user counts
    const perUser = new Map<string, { signIns: number; decisions: number }>();
    for (const e of events ?? []) {
      if (!e.user_id) continue;
      const rec = perUser.get(e.user_id) ?? { signIns: 0, decisions: 0 };
      if (e.event_type === "sign_in") rec.signIns += 1;
      if (e.event_type === "decision_request") rec.decisions += 1;
      perUser.set(e.user_id, rec);
    }

    const totalSignIns = (events ?? []).filter((e) => e.event_type === "sign_in").length;
    const totalDecisions = (events ?? []).filter((e) => e.event_type === "decision_request").length;
    const activeUsers = new Set(
      (events ?? []).filter((e) => e.event_type === "decision_request" && e.user_id).map((e) => e.user_id!),
    ).size;

    return {
      totals: {
        users: users.length,
        activeDecisionUsers: activeUsers,
        signIns: totalSignIns,
        decisionRequests: totalDecisions,
      },
      users: users.map((u) => ({
        ...u,
        signIns: perUser.get(u.id)?.signIns ?? 0,
        decisions: perUser.get(u.id)?.decisions ?? 0,
      })),
      recentEvents: (events ?? []).slice(0, 100),
    };
  });
