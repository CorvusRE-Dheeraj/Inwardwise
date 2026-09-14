import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PathwaySuggestion } from "@/lib/connect-suggest.server";

export const suggestConnectPathway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ prompt: z.string().trim().min(8).max(3000) }).parse(d),
  )
  .handler(async ({ data }): Promise<PathwaySuggestion> => {
    const { suggestPathway } = await import("@/lib/connect-suggest.server");
    return suggestPathway(data.prompt);
  });
