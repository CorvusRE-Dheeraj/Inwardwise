import { createFileRoute, Link } from "@tanstack/react-router";
import { GamesGate } from "@/components/avatar/GamesGate";
import { useEffect, useState } from "react";
import { Lock, Check, Brain, Languages } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { SELF_JOURNEY } from "@/lib/self-journey";
import { GAMES } from "@/lib/self-games";
import { psychGameById } from "@/lib/psych-games";
import { STAGE_REWARDS, loadPlayed, rewardId, totalScore, type PlayRecord, type RewardCategory } from "@/lib/stage-rewards";

export const Route = createFileRoute("/_authenticated/avatar/rewards")({
  validateSearch: z.object({
    stage: z.number().int().min(1).max(5).optional(),
    cat: z.enum(["psychology", "language"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Stage Game Rewards, InwardWise Self" },
      { name: "description", content: "Psychology and language games unlocked as you complete each Self Build stage." },
      { property: "og:title", content: "Stage Game Rewards, InwardWise Self" },
      { property: "og:description", content: "New games unlock after every Self Build stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <GamesGate need={1}><Rewards /></GamesGate>,
});

function Rewards() {
  const { stage, cat } = Route.useSearch();
  const [done, setDone] = useState<Set<number> | null>(null);
  const [played, setPlayed] = useState<Record<string, PlayRecord>>({});

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setPlayed(loadPlayed(data.user.id));
      const { data: rows } = await supabase
        .from("avatar_dimensions")
        .select("dimension_number, progress_pct")
        .eq("user_id", data.user.id);
      const nums = new Set((rows ?? []).filter((r) => r.progress_pct >= 100).map((r) => r.dimension_number));
      setDone(new Set(SELF_JOURNEY.map((s, i) => (nums.has(s.n) ? i + 1 : 0)).filter(Boolean)));
    });
  }, []);

  const stages = stage ? [stage] : [1, 2, 3, 4, 5];
  const cats: RewardCategory[] = cat ? [cat] : ["psychology", "language"];
  const allIds = Object.values(STAGE_REWARDS).flatMap((r) => [
    ...r.psychology.map((id) => rewardId("psychology", id)),
    ...r.language.map((k) => rewardId("language", k)),
  ]);
  const playedCount = allIds.filter((id) => played[id]).length;

  return (
    <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 sm:py-20">
      <SiteHeader />
      <Link to="/avatar" className="font-mono-cap text-[10px] text-[color:var(--royal)]">← Your Self Journey</Link>
      <header className="mt-8 max-w-3xl">
        <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Self Build · Stage rewards</div>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-tight">Discover Yourself Through Play</h1>
        <p className="mt-4 text-base leading-relaxed">
          Some things about you are easier to discover through situations than questions. Each stage you complete unlocks a
          fresh set of psychology and language games. Each game can be played once, then a new set awaits at the next stage.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        <Stat label="Total score" value={totalScore(played)} />
        <Stat label="Games played" value={`${playedCount} of ${allIds.length}`} />
        <Stat label="Stages unlocked" value={`${done?.size ?? 0} of 5`} />
      </section>

      {(stage || cat) && (
        <Link to="/avatar/rewards" search={{}} className="mt-6 inline-block text-sm text-[color:var(--royal)]">Show all stages →</Link>
      )}

      <div className="mt-8 space-y-6">
        {stages.map((s) => {
          const unlocked = done?.has(s) ?? false;
          return (
            <section key={s} className="rounded-2xl border border-[color:var(--rule)] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">Stage {s} · {SELF_JOURNEY[s - 1].label}</h2>
                {!unlocked && <span className="flex items-center gap-1 text-xs"><Lock className="h-3.5 w-3.5" /> Complete this stage to unlock</span>}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {cats.map((c) => (
                  <div key={c}>
                    <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--royal)]">
                      {c === "psychology" ? <Brain className="h-4 w-4" /> : <Languages className="h-4 w-4" />}
                      {c === "psychology" ? "Psychology games" : "Language games"}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {(c === "psychology" ? STAGE_REWARDS[s].psychology : STAGE_REWARDS[s].language).map((k) => {
                        const rec = played[rewardId(c, k)];
                        const title = c === "psychology" ? psychGameById(k)?.title : GAMES.find((g) => g.key === k)?.title;
                        const slug = GAMES.find((g) => g.key === k)?.slug ?? k;
                        return (
                          <li key={k} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--rule)] px-4 py-3 text-sm">
                            <span>{title}</span>
                            {rec ? (
                              <span className="flex items-center gap-1 text-xs text-[color:var(--royal)]"><Check className="h-3.5 w-3.5" /> Played · {rec.score} pts</span>
                            ) : !unlocked ? (
                              <span className="text-xs">Locked</span>
                            ) : c === "psychology" ? (
                              <Link to="/avatar/psych/$id" params={{ id: k }} search={{ stage: s }} className="rounded-full bg-[color:var(--royal)] px-4 py-1.5 text-xs text-[color:var(--background)]">Play</Link>
                            ) : slug === "garden" ? (
                              <Link to="/avatar/play/garden" search={{ via: "rewards" }} className="rounded-full bg-[color:var(--royal)] px-4 py-1.5 text-xs text-[color:var(--background)]">Play</Link>
                            ) : (
                              <Link to="/avatar/play/$game" params={{ game: slug }} search={{ via: "rewards" }} className="rounded-full bg-[color:var(--royal)] px-4 py-1.5 text-xs text-[color:var(--background)]">Play</Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-6 text-xs">Scores reward taking part, there are no right or wrong answers. Nothing here is a diagnosis.</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[color:var(--rule)] p-5">
      <div className="text-xs">{label}</div>
      <div className="mt-2 font-display text-3xl text-[color:var(--royal)]">{value}</div>
    </div>
  );
}
