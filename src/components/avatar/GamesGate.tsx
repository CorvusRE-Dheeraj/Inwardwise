import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Number of Self Build stages the signed-in user has fully completed (null while loading). */
export function useCompletedStageCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setCount(0);
      const { data: rows } = await supabase
        .from("avatar_dimensions")
        .select("progress_pct")
        .eq("user_id", data.user.id);
      setCount((rows ?? []).filter((r) => r.progress_pct >= 100).length);
    });
  }, []);
  return count;
}

/** Games stay hidden until the required number of stages are complete. */
export function GamesGate({ need, children }: { need: number; children: ReactNode }) {
  const count = useCompletedStageCount();
  if (count === null) return <div className="p-10 text-sm">Loading…</div>;
  if (count >= need) return <>{children}</>;
  return (
    <div className="mx-auto w-[min(700px,calc(100%-2rem))] py-24 text-center">
      <Lock className="mx-auto h-6 w-6 text-[color:var(--royal)]" />
      <p className="mt-4 font-display text-3xl">Games are not unlocked yet</p>
      <p className="mt-3 text-sm">
        {need >= 5
          ? "Free play opens once you complete all five stages of your Self Build."
          : "Complete the first stage of your Self Build to unlock your first games."}
      </p>
      {count >= 1 && (
        <Link to="/avatar/rewards" search={{}} className="mt-4 block text-sm text-[color:var(--royal)]">← Back to my stage game rewards</Link>
      )}
      <Link to="/avatar" className="mt-6 inline-block rounded-full bg-[color:var(--royal)] px-5 py-2 text-sm text-[color:var(--background)]">
        Continue my Self Build
      </Link>
    </div>
  );
}
