// Self Build games: tentative AI suggestions through the game-suggest Edge
// Function, which holds the API key.
import { supabase } from "@/integrations/supabase/client";
import type { SuggestKind } from "../../supabase/functions/_shared/game-suggest.ts";

const UNAVAILABLE = "Suggestions aren't available right now.";

export async function suggestForGame(kind: SuggestKind, context: string): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke<{ suggestions: string[] }>(
    "game-suggest",
    { body: { kind, context }, timeout: 30_000 },
  );
  if (!error) return data?.suggestions ?? [];
  const reply = (error as { context?: unknown }).context;
  if (reply instanceof Response) {
    const payload = (await reply.json().catch(() => null)) as { error?: string } | null;
    if (payload?.error) throw new Error(payload.error);
  }
  throw new Error(UNAVAILABLE);
}
