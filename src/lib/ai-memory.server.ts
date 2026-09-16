// Deep-learn memory: server-only recorder for every AI prompt/response
// exchange and site activity. Writes are best-effort and never throw, so a
// logging problem can never break a member's session.

export type AiMemoryRecord = {
  surface: string;
  prompt?: string | null;
  response?: string | null;
  userId?: string | null;
  model?: string | null;
  ok?: boolean;
  latencyMs?: number | null;
  metadata?: Record<string, unknown>;
};

const MAX_TEXT = 20000;

function clip(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT)}…` : value;
}

/** Records one AI exchange. Fire-and-forget: call with `void`. */
export async function recordAiExchange(record: AiMemoryRecord): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_memory_log").insert({
      surface: record.surface,
      user_id: record.userId ?? null,
      model: record.model ?? null,
      prompt: clip(record.prompt),
      response: clip(record.response),
      ok: record.ok ?? true,
      latency_ms: record.latencyMs ?? null,
      metadata: (record.metadata ?? {}) as never,
    });
  } catch (err) {
    console.error("[ai-memory] failed to record exchange", err);
  }
}

/** Resolves the signed-in user id from a request bearer token, or null. */
export async function userIdFromRequest(request: Request): Promise<string | null> {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    if (token.split(".").length !== 3) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.getUser(token);
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
