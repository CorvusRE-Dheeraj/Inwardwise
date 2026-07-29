import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getPrivateDimensions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("private_dimensions")
      .select("shadow, enemy")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { shadow: data?.shadow ?? "", enemy: data?.enemy ?? "" };
  });

const saveSchema = z.object({
  shadow: z.string().max(20000),
  enemy: z.string().max(20000),
});

export const savePrivateDimensions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("private_dimensions")
      .upsert(
        {
          user_id: context.userId,
          shadow: data.shadow,
          enemy: data.enemy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
