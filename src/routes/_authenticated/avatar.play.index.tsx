import { createFileRoute, Link } from "@tanstack/react-router";
import { GamesGate } from "@/components/avatar/GamesGate";
import { useEffect, useState } from "react";
import { Trash2, Sprout } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import type React from "react";
import { GAMES, loadGameStatus, recommendGames, type GameKey, type GameStatus } from "@/lib/self-games";

export const Route = createFileRoute("/_authenticated/avatar/play/")({
  validateSearch: z.object({ from: z.number().int().min(1).max(5).optional() }),
  head: () => ({
    meta: [
      { title: "Explore Yourself Through Play, InwardWise Self" },
      { name: "description", content: "Short, private reflection games that help you find words for your own experiences." },
      { property: "og:title", content: "Explore Yourself Through Play, InwardWise Self" },
      { property: "og:description", content: "Short, private reflection games for your Self Build." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <GamesGate need={5}><PlayHome /></GamesGate>,
});

type Reflection = { id: string; game_key: string; prompt_key: string; content: Record<string, unknown>; save_to_avatar: boolean; created_at: string };

const STATUS_LABEL: Record<GameStatus, string> = { not_started: "Not started", in_progress: "In progress", completed: "Completed" };

function PlayHome() {
  const { from } = Route.useSearch();
  const [uid, setUid] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<GameKey, GameStatus> | null>(null);
  const [items, setItems] = useState<Reflection[]>([]);
  const [words, setWords] = useState<{ id: string; word: string }[]>([]);

  const load = async (id: string) => {
    const [r, w] = await Promise.all([
      supabase.from("self_build_game_reflections").select("*").order("created_at", { ascending: false }),
      supabase.from("self_build_saved_words").select("id, word").order("created_at", { ascending: false }),
    ]);
    setItems((r.data ?? []) as Reflection[]);
    setWords(w.data ?? []);
    setStatus(loadGameStatus(id));
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      void load(data.user.id);
    });
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this reflection? It will also be removed from your Self.")) return;
    await supabase.from("self_build_game_reflections").delete().eq("id", id);
    if (uid) void load(uid);
  };

  const explored = status ? Object.values(status).filter((s) => s !== "not_started").length : 0;
  const gardenSize = explored + items.length + words.length;

  return (
    <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 sm:py-20">
      <SiteHeader />
      {from ? (
        <Link to="/avatar/dimension/$n" params={{ n: String(from) }} className="font-mono-cap text-[10px] text-[color:var(--royal)]">
          ← Back to where you were
        </Link>
      ) : (
        <Link to="/avatar" className="font-mono-cap text-[10px] text-[color:var(--royal)]">← Your Self Journey</Link>
      )}

      <header className="mt-8 max-w-3xl">
        <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Self Build · Optional</div>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-tight">Explore Yourself Through Play</h1>
        <p className="mt-4 text-base leading-relaxed">
          Short, private activities to help you find words for your own experiences. There are no right or wrong answers,
          no scores, and nothing is saved unless you choose to save it.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        <Stat label="Games explored" value={`${explored} of ${GAMES.length}`} />
        <Stat label="Reflections saved" value={items.length} />
        <Stat label="Words you kept" value={words.length} />
      </section>

      <section className="mt-6 rounded-2xl border border-[color:var(--rule)] p-5">
        <div className="flex items-center gap-2 text-sm font-medium"><Sprout className="h-4 w-4 text-[color:var(--royal)]" /> Your private garden</div>
        <div className="mt-4 flex min-h-12 flex-wrap items-end gap-2" aria-label={`Garden with ${gardenSize} sprouts`}>
          {gardenSize === 0 && <span className="text-sm">Your garden grows gently as you explore. It never shrinks.</span>}
          {Array.from({ length: Math.min(gardenSize, 40) }).map((_, i) => (
            <span key={i} className="inline-block animate-in fade-in zoom-in rounded-full bg-[color:var(--royal)]" style={{ width: 8 + (i % 3) * 4, height: 14 + (i % 4) * 6, opacity: 0.5 + (i % 3) * 0.2, animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
        {words.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {words.slice(0, 24).map((w) => (
              <span key={w.id} className="rounded-full border border-[color:var(--royal)]/30 px-3 py-1 text-xs text-[color:var(--royal)]">{w.word}</span>
            ))}
          </div>
        )}
      </section>

      {status && (() => {
        const recs = recommendGames({ status, reflectionGames: items.map((r) => r.game_key), wordCount: words.length });
        return recs.length ? (
          <section className="mt-6 rounded-2xl border border-[color:var(--royal)]/30 p-5">
            <div className="text-sm font-medium">You might like to try</div>
            <ul className="mt-3 space-y-2 text-sm">
              {recs.map((r) => (
                <li key={r.game.key} className="flex flex-wrap items-center justify-between gap-2">
                  <span>{r.reason}</span>
                  <GameLink slug={r.game.slug} from={from} className="text-[color:var(--royal)]">{r.game.title} →</GameLink>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">Every activity is open to you. These are only invitations.</p>
          </section>
        ) : null;
      })()}

      {items.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[color:var(--rule)] p-5 text-sm">
          <div className="font-medium">Your reflection summary</div>
          <ul className="mt-3 space-y-1">
            {GAMES.map((g) => { const n = items.filter((r) => r.game_key === g.key).length; return n ? <li key={g.key}>{g.title}: {n} saved reflection{n > 1 ? "s" : ""}</li> : null; })}
            {words.length > 0 && <li>Words you kept most recently: {words.slice(0, 5).map((w) => w.word).join(", ")}</li>}
          </ul>
          <p className="mt-2 text-xs">Built only from what you chose to save. Nothing here is a conclusion about you.</p>
        </section>
      )}

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {GAMES.map((g) => {
          const s = status?.[g.key] ?? "not_started";
          return (
            <article key={g.key} className="group flex flex-col rounded-2xl border border-[color:var(--rule)] p-6 transition hover:-translate-y-0.5 hover:border-[color:var(--royal)]/50">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[color:var(--royal)]">{g.explores}</span>
                <span>{g.minutes}</span>
              </div>
              <h2 className="mt-4 font-display text-2xl">{g.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed">{g.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs">{STATUS_LABEL[s]}</span>
                <GameLink slug={g.slug} from={from} className="rounded-full bg-[color:var(--royal)] px-4 py-2 text-sm text-[color:var(--background)]">
                  {s === "in_progress" ? "Continue" : g.key === "word_garden" ? "Open" : "Play"}
                </GameLink>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Your saved reflections</h2>
        <p className="mt-1 text-sm">Only you can see these. Delete any of them at any time.</p>
        {items.length === 0 ? (
          <p className="mt-4 text-sm">Nothing saved yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-[color:var(--rule)] p-4">
                <div className="min-w-0 text-sm">
                  <div className="text-[11px] text-[color:var(--royal)]">
                    {GAMES.find((g) => g.key === r.game_key)?.title} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{summarize(r.content)}</div>
                </div>
                <button onClick={() => remove(r.id)} aria-label="Delete reflection" className="shrink-0 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function summarize(c: Record<string, unknown>): string {
  return typeof c.summary === "string" ? c.summary : "";
}

function GameLink({ slug, from, className, children }: { slug: string; from?: number; className: string; children: React.ReactNode }) {
  if (slug === "garden") return <Link to="/avatar/play/garden" className={className}>{children}</Link>;
  return <Link to="/avatar/play/$game" params={{ game: slug }} search={{ from }} className={className}>{children}</Link>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[color:var(--rule)] p-5">
      <div className="text-xs">{label}</div>
      <div className="mt-2 font-display text-3xl text-[color:var(--royal)]">{value}</div>
    </div>
  );
}
