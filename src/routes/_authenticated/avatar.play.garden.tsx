import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { GamesGate } from "@/components/avatar/GamesGate";
import { useEffect, useMemo, useState } from "react";
import { Sprout } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { GARDEN_INTERVALS, MILESTONES, setGameStatus } from "@/lib/self-games";

export const Route = createFileRoute("/_authenticated/avatar/play/garden")({
  validateSearch: z.object({ via: z.enum(["rewards"]).optional() }),
  head: () => ({
    meta: [
      { title: "Word Garden, InwardWise Self" },
      { name: "description", content: "Revisit the words you chose to keep, at a pace you choose." },
      { property: "og:title", content: "Word Garden, InwardWise Self" },
      { property: "og:description", content: "A private garden of the words you kept, with gentle recall." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <GamesGate need={1}><Garden /></GamesGate>,
});

type Word = { id: string; word: string; user_definition: string | null; example: string | null; garden_status: string; next_review_at: string | null; review_count: number };

const btn = "rounded-full bg-[color:var(--royal)] px-5 py-2 text-sm text-[color:var(--background)] disabled:opacity-40";
const ghost = "rounded-full border border-[color:var(--rule)] px-4 py-2 text-sm hover:border-[color:var(--royal)]/60";
const MS_KEY = "iw.garden.milestones";

function Garden() {
  const { via } = Route.useSearch();
  const [uid, setUid] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [open, setOpen] = useState<Word | null>(null);
  const [def, setDef] = useState("");
  const [recall, setRecall] = useState<{ target: Word; options: string[]; picked?: string } | null>(null);
  const [showMs, setShowMs] = useState(false);
  const [showRetired, setShowRetired] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("self_build_saved_words").select("id, word, user_definition, example, garden_status, next_review_at, review_count").order("created_at");
    setWords((data ?? []) as Word[]);
  };
  useEffect(() => {
    setShowMs(localStorage.getItem(MS_KEY) === "1");
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      setGameStatus(data.user.id, "word_garden", "in_progress");
      void load();
    });
  }, []);

  const active = words.filter((w) => w.garden_status !== "retired");
  const due = useMemo(() => active.filter((w) => w.next_review_at && new Date(w.next_review_at) <= new Date()), [active]);

  const update = async (id: string, patch: Partial<Word>) => {
    const { error } = await supabase.from("self_build_saved_words").update(patch).eq("id", id);
    if (error) return alert("Couldn't save just now. Please try again.");
    await load();
  };
  const mark = async (w: Word, status: "useful" | "not_quite" | "retired") => {
    await update(w.id, { garden_status: status, review_count: w.review_count + 1 });
    if (uid) setGameStatus(uid, "word_garden", "completed");
    setOpen(null);
  };
  const schedule = (w: Word, days: number) =>
    update(w.id, { next_review_at: days ? new Date(Date.now() + days * 86400000).toISOString() : null });

  const startRecall = () => {
    const pool = (due.length ? due : active).filter((w) => w.example);
    if (!pool.length) return alert("Recall uses the example you saved with a word. Save a word with an example first.");
    const target = pool[Math.floor(Math.random() * pool.length)];
    const others = active.filter((w) => w.word !== target.word).map((w) => w.word).sort(() => Math.random() - 0.5).slice(0, 3);
    setRecall({ target, options: [...new Set([target.word, ...others])].sort(() => Math.random() - 0.5) });
  };

  const toggleMs = () => { const v = !showMs; setShowMs(v); localStorage.setItem(MS_KEY, v ? "1" : "0"); };

  return (
    <div className="mx-auto w-[min(1000px,calc(100%-2rem))] py-14 sm:py-20">
      <SiteHeader />
      <Link to={via === "rewards" ? "/avatar/rewards" : "/avatar/play"} search={{}} className="font-mono-cap text-[10px] text-[color:var(--royal)]">← All activities</Link>
      <header className="mt-6">
        <div className="text-xs text-[color:var(--royal)]">Revisiting useful words · at your pace</div>
        <h1 className="mt-2 font-display text-4xl">Word Garden</h1>
        <p className="mt-2 max-w-2xl text-sm">The words you chose to keep. Revisit them when you like. There are no streaks, nothing is lost if you take a break, and retired words can always come back.</p>
      </header>

      <section className="mt-8 rounded-2xl border border-[color:var(--rule)] p-6">
        {active.length === 0 ? (
          <p className="text-sm">Your garden is waiting for its first word. Play <Link to="/avatar/play/$game" params={{ game: "word-lens" }} search={{}} className="text-[color:var(--royal)]">Word Lens</Link> or <Link to="/avatar/play/$game" params={{ game: "word-pair" }} search={{}} className="text-[color:var(--royal)]">Word Pair</Link> and save a word.</p>
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            {active.map((w, i) => (
              <button key={w.id} onClick={() => { setOpen(w); setDef(w.user_definition ?? ""); }} className="group flex flex-col items-center animate-in fade-in zoom-in" style={{ animationDelay: `${i * 40}ms` }}>
                <Sprout className={`text-[color:var(--royal)] transition group-hover:scale-110 ${w.garden_status === "useful" ? "h-9 w-9" : w.garden_status === "not_quite" ? "h-5 w-5 opacity-60" : "h-7 w-7"}`} />
                <span className="mt-1 rounded-full border border-[color:var(--royal)]/30 px-3 py-1 text-xs">{w.word}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <button className={btn} disabled={active.length < 1} onClick={startRecall}>{due.length ? `Gentle recall (${due.length} ready)` : "Gentle recall"}</button>
          <button className={ghost} onClick={toggleMs}>{showMs ? "Hide milestones" : "Show milestones"}</button>
          {words.length > active.length && <button className={ghost} onClick={() => setShowRetired(!showRetired)}>{showRetired ? "Hide" : "Show"} retired words</button>}
        </div>
      </section>

      {recall && (
        <section className="mt-6 rounded-2xl border border-[color:var(--royal)]/40 p-6 animate-in fade-in">
          <div className="text-xs text-[color:var(--royal)]">Gentle recall</div>
          <p className="mt-3 font-display text-xl">&ldquo;{recall.target.example}&rdquo;</p>
          <p className="mt-2 text-sm">Which word did you connect with this?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {recall.options.map((o) => (
              <button key={o} onClick={() => setRecall({ ...recall, picked: o })} className={`rounded-full border px-4 py-2 text-sm ${recall.picked === o ? "border-[color:var(--royal)] bg-[color:var(--royal)]/10" : "border-[color:var(--rule)]"}`}>{o}</button>
            ))}
          </div>
          {recall.picked && (
            <div className="mt-4 text-sm">
              <p>You saved this with <strong className="text-[color:var(--royal)]">{recall.target.word}</strong>.{recall.picked !== recall.target.word && " Choosing another word is fine too, your sense of it may have shifted."}</p>
              <WordActions w={recall.target} onMark={(s) => { void mark(recall.target, s); setRecall(null); }} onSchedule={(d) => { void schedule(recall.target, d); setRecall(null); }} />
            </div>
          )}
          <button className="mt-4 text-xs text-[color:var(--royal)]" onClick={() => setRecall(null)}>Close</button>
        </section>
      )}

      {open && (
        <section className="mt-6 rounded-2xl border border-[color:var(--rule)] p-6 animate-in fade-in">
          <h2 className="font-display text-3xl">{open.word}</h2>
          {open.example && <p className="mt-3 text-sm">Your example: {open.example}</p>}
          <label className="mt-4 block text-sm">My own definition
            <textarea rows={2} value={def} onChange={(e) => setDef(e.target.value)} className="mt-2 w-full rounded-xl border border-[color:var(--rule)] bg-transparent p-3 text-sm outline-none focus:border-[color:var(--royal)]" />
          </label>
          <button className={`${ghost} mt-2`} onClick={() => update(open.id, { user_definition: def.slice(0, 500) || null })}>Save definition</button>
          <WordActions w={open} onMark={(s) => mark(open, s)} onSchedule={(d) => schedule(open, d)} />
          {open.next_review_at && <p className="mt-3 text-xs">Next visit: {new Date(open.next_review_at).toLocaleDateString()}</p>}
          <button className="mt-4 text-xs text-[color:var(--royal)]" onClick={() => setOpen(null)}>Close</button>
        </section>
      )}

      {showRetired && (
        <section className="mt-6 text-sm">
          <h2 className="font-display text-xl">Retired words</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {words.filter((w) => w.garden_status === "retired").map((w) => (
              <button key={w.id} className={ghost} onClick={() => update(w.id, { garden_status: "growing" })}>{w.word} · bring back</button>
            ))}
          </div>
        </section>
      )}

      {showMs && (
        <section className="mt-6 rounded-2xl border border-[color:var(--rule)] p-6">
          <h2 className="font-display text-xl">Your milestones</h2>
          <p className="mt-1 text-xs">Optional. They only ever grow.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {MILESTONES.map((m) => (
              <li key={m.at} className={words.length >= m.at ? "text-[color:var(--royal)]" : ""}>{words.length >= m.at ? "✓" : "○"} {m.label}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function WordActions({ w, onMark, onSchedule }: { w: Word; onMark: (s: "useful" | "not_quite" | "retired") => void; onSchedule: (days: number) => void }) {
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={ghost} onClick={() => onMark("useful")}>Still useful</button>
        <button className={ghost} onClick={() => onMark("not_quite")}>Not quite</button>
        <button className={ghost} onClick={() => confirm(`Retire "${w.word}"? You can bring it back any time.`) && onMark("retired")}>Retire this word</button>
      </div>
      <div className="mt-4 text-xs text-[color:var(--royal)]">When would you like to revisit it?</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {GARDEN_INTERVALS.map((i) => <button key={i.label} className="rounded-full border border-[color:var(--rule)] px-3 py-1 text-xs" onClick={() => onSchedule(i.days)}>{i.label}</button>)}
      </div>
    </>
  );
}
