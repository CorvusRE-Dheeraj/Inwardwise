import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GamesGate } from "@/components/avatar/GamesGate";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { psychGameById, psychScore, reflectOn, type PsychOption } from "@/lib/psych-games";
import { loadPlayed, recordPlayed, rewardId } from "@/lib/stage-rewards";

export const Route = createFileRoute("/_authenticated/avatar/psych/$id")({
  validateSearch: z.object({ stage: z.number().int().min(1).max(5).optional() }),
  loader: ({ params }) => {
    const game = psychGameById(params.id);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.game.title ?? "Psychology game"}, InwardWise Self` },
      { name: "description", content: "A short, private situation game. No right or wrong answers." },
      { property: "og:title", content: `${loaderData?.game.title ?? "Psychology game"}, InwardWise Self` },
      { property: "og:description", content: "See how you naturally respond to a situation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <GamesGate need={1}><PsychGamePage /></GamesGate>,
});

const btn = "rounded-full bg-[color:var(--royal)] px-5 py-2 text-sm text-[color:var(--background)] disabled:opacity-40";
const ghost = "rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm";
const card = "rounded-2xl border border-[color:var(--rule)] p-6 animate-in fade-in slide-in-from-bottom-2 duration-500";

function PsychGamePage() {
  const { game } = Route.useLoaderData();
  const { stage } = Route.useSearch();
  const [uid, setUid] = useState<string | null>(null);
  const [already, setAlready] = useState(false);
  const [first, setFirst] = useState<PsychOption | null>(null);
  const [second, setSecond] = useState<PsychOption | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [why, setWhy] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      setAlready(!!loadPlayed(data.user.id)[rewardId("psychology", game.id)]);
    });
  }, [game.id]);

  const reflection = reflectOn([first?.signal, second?.signal].filter(Boolean) as string[]);

  const complete = () => {
    if (!uid) return;
    const s = psychScore(2, why.trim().length > 0);
    recordPlayed(uid, rewardId("psychology", game.id), s);
    setScore(s);
    setStep(3);
  };

  const save = async () => {
    if (!uid) return;
    const summary = `${game.title}: ${first?.label} → ${second?.label}${why.trim() ? `\nWhy: ${why.trim()}` : ""}\n${reflection}`;
    const { error } = await supabase.from("self_build_game_reflections").insert({
      user_id: uid, game_key: "psychology", prompt_key: game.id,
      content: { first: first?.label, second: second?.label, why: why.trim().slice(0, 1000), summary } as never,
      save_to_avatar: true,
    });
    setSaved(error ? "Couldn't save just now. Please try again." : "Saved privately to your Self.");
  };

  const back = <Link to="/avatar/rewards" search={stage ? { stage, cat: "psychology" } : {}} className="font-mono-cap text-[10px] text-[color:var(--royal)]">← Stage games</Link>;

  if (already && step !== 3) {
    return (
      <div className="mx-auto w-[min(820px,calc(100%-2rem))] py-14 sm:py-20">
        <SiteHeader />{back}
        <div className={`${card} mt-8`}>
          <p className="font-display text-2xl">You've already played {game.title}.</p>
          <p className="mt-2 text-sm">Each game is played once. Complete your next stage to unlock new ones.</p>
          <Link to="/avatar/rewards" search={{}} className={`${btn} mt-5 inline-block`}>See your game dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[min(820px,calc(100%-2rem))] py-14 sm:py-20">
      <SiteHeader />
      {back}
      <header className="mt-6">
        <div className="text-xs text-[color:var(--royal)]">{game.kind} · {game.minutes}</div>
        <h1 className="mt-2 font-display text-4xl">{game.title}</h1>
        <p className="mt-2 text-sm">Let's see how you naturally respond. No right or wrong answers.</p>
      </header>

      <div className="mt-8 space-y-5">
        <div className={card}>
          <p className="text-base leading-relaxed">{game.situation}</p>
          {game.message && (
            <div className="mt-4 inline-block max-w-md rounded-2xl rounded-bl-sm bg-[color:var(--royal)]/10 px-4 py-3 text-sm">
              <div className="text-[11px] text-[color:var(--royal)]">{game.message.who}</div>"{game.message.text}"
            </div>
          )}
        </div>

        {step === 1 && (
          <div className={card}>
            <p className="font-medium">{game.q1}</p>
            <Choices options={game.options} picked={first} onPick={setFirst} />
            <button className={`${btn} mt-5`} disabled={!first} onClick={() => setStep(2)}>Continue</button>
          </div>
        )}

        {step === 2 && first && (
          <div className={card}>
            <p className="text-sm text-[color:var(--royal)]">You chose: {first.label}</p>
            {first.consequence && <p className="mt-3 text-base italic">{first.consequence}</p>}
            <p className="mt-4 font-medium">{game.q2}</p>
            <Choices options={game.options2} picked={second} onPick={setSecond} />
            {game.askWhy !== false && (
              <label className="mt-5 block text-sm">
                What made you choose it? (optional)
                <textarea value={why} onChange={(e) => setWhy(e.target.value)} maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border border-[color:var(--rule)] bg-transparent p-3" />
              </label>
            )}
            <button className={`${btn} mt-5`} disabled={!second} onClick={complete}>See what your choices revealed</button>
          </div>
        )}

        {step === 3 && (
          <div className={card}>
            <div className="text-xs text-[color:var(--royal)]">What your choices revealed</div>
            <p className="mt-3 font-display text-xl leading-relaxed">{reflection}</p>
            {score !== null && <p className="mt-4 flex items-center gap-2 text-sm text-[color:var(--royal)]"><Check className="h-4 w-4" /> Game complete · +{score} points</p>}
            <p className="mt-2 text-xs">This is a signal, not a fact about you. You remain the final authority on your Self.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {!saved && <button className={btn} onClick={save}>Save to My Self</button>}
              {saved && <span className="self-center text-sm text-[color:var(--royal)]">{saved}</span>}
              <Link to="/avatar/rewards" search={{}} className={ghost}>Game dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Choices({ options, picked, onPick }: { options: PsychOption[]; picked: PsychOption | null; onPick: (o: PsychOption) => void }) {
  return (
    <div className="mt-4 grid gap-2">
      {options.map((o) => (
        <button
          key={o.label}
          onClick={() => onPick(o)}
          className={`rounded-xl border px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 ${picked?.label === o.label ? "border-[color:var(--royal)] bg-[color:var(--royal)]/10" : "border-[color:var(--rule)]"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
