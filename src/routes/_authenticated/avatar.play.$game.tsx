import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { GamesGate } from "@/components/avatar/GamesGate";
import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { suggestForGame } from "@/lib/game-suggest";
import {
  ENCOURAGEMENTS,
  LIFE_DOT_THEMES,
  REFRAME_COST,
  REFRAME_EXAMPLE,
  REFRAME_PROTECT,
  SORT_CATEGORIES,
  SORT_DEFAULT_ACTIVITIES,
  SORT_FOLLOWUPS,
  WORD_LENS_PROMPTS,
  WORD_PAIRS,
  gameBySlug,
  setGameStatus,
  type GameMeta,
} from "@/lib/self-games";

export const Route = createFileRoute("/_authenticated/avatar/play/$game")({
  validateSearch: z.object({ from: z.number().int().min(1).max(5).optional(), via: z.enum(["rewards"]).optional() }),
  loader: ({ params }) => {
    const game = gameBySlug(params.game);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.game.title ?? "Reflection game"}, InwardWise Self` },
      { name: "description", content: loaderData?.game.description ?? "A short private reflection activity." },
      { property: "og:title", content: `${loaderData?.game.title ?? "Reflection game"}, InwardWise Self` },
      { property: "og:description", content: loaderData?.game.description ?? "A short private reflection activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  notFoundComponent: () => <div className="p-10">That activity doesn&rsquo;t exist. <Link to="/avatar/play" search={{}} className="text-[color:var(--royal)]">See all activities</Link></div>,
  component: () => <GamesGate need={1}><GamePage /></GamesGate>,
});

export type Result = { promptKey: string; summary: string; content: Record<string, unknown>; words?: string[]; example?: string; definitions?: Record<string, string> };

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-sm transition duration-200 ${on ? "scale-105 border-[color:var(--royal)] bg-[color:var(--royal)] text-[color:var(--background)]" : "border-[color:var(--rule)] hover:border-[color:var(--royal)]/60"}`;
const btn = "rounded-full bg-[color:var(--royal)] px-5 py-2 text-sm text-[color:var(--background)] disabled:opacity-40";
const ghost = "rounded-full border border-[color:var(--rule)] px-4 py-2 text-sm hover:border-[color:var(--royal)]/60";
const field = "mt-2 w-full rounded-xl border border-[color:var(--rule)] bg-transparent p-3 text-sm outline-none focus:border-[color:var(--royal)]";

function GamePage() {
  const { game } = Route.useLoaderData();
  const { from, via } = Route.useSearch();
  const navigate = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUid(data.user.id);
        setGameStatus(data.user.id, game.key, "in_progress");
      }
    });
  }, [game.key]);

  const exit = () => {
    if (result && !done && !confirm("Leave without saving this reflection?")) return;
    void navigate({ to: via === "rewards" ? "/avatar/rewards" : "/avatar/play", search: via === "rewards" ? {} : { from } });
  };

  const finish = async (save: boolean) => {
    if (!uid || !result) return;
    if (save) {
      const { data, error } = await supabase
        .from("self_build_game_reflections")
        .insert({ user_id: uid, game_key: game.key, prompt_key: result.promptKey, content: { ...result.content, summary: result.summary } as never, save_to_avatar: true })
        .select("id")
        .single();
      if (error) return alert("Couldn't save just now. Please try again.");
      if (result.words?.length) {
        await supabase.from("self_build_saved_words").insert(
          result.words.map((w) => ({
            user_id: uid,
            reflection_id: data.id,
            word: w.slice(0, 60),
            example: result.example?.slice(0, 500) || null,
            user_definition: result.definitions?.[w]?.slice(0, 500) || null,
          })),
        );
      }
    }
    setGameStatus(uid, game.key, "completed");
    setDone(save ? "Saved privately to your Self." : "Kept for this session only, nothing was stored.");
  };

  const discard = () => {
    if (!confirm("Discard this reflection?")) return;
    setResult(null);
    setRound((r) => r + 1);
  };

  return (
    <div className="mx-auto w-[min(820px,calc(100%-2rem))] py-14 sm:py-20">
      <SiteHeader />
      <div className="flex items-center justify-between">
        <button onClick={exit} className="font-mono-cap text-[10px] text-[color:var(--royal)]">← All activities</button>
        <button onClick={exit} className={ghost}>Exit</button>
      </div>
      <header className="mt-6">
        <div className="text-xs text-[color:var(--royal)]">{game.explores} · {game.minutes}</div>
        <h1 className="mt-2 font-display text-4xl">{game.title}</h1>
        <p className="mt-2 text-sm">Optional and private. Skip anything. Nothing is saved unless you choose.</p>
      </header>

      <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {done ? (
          <Card>
            <div className="flex items-center gap-2 text-[color:var(--royal)]"><Check className="h-5 w-5" /> {done}</div>
            <p className="mt-3 font-display text-xl">{ENCOURAGEMENTS[(round + game.title.length) % ENCOURAGEMENTS.length]}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className={btn} onClick={() => { setDone(null); setResult(null); setRound((r) => r + 1); }}>Play again</button>
              {via === "rewards" ? (
                <Link to="/avatar/rewards" search={{}} className={ghost}>All activities</Link>
              ) : (
                <Link to="/avatar/play" search={{ from }} className={ghost}>All activities</Link>
              )}
              {from && <Link to="/avatar/dimension/$n" params={{ n: String(from) }} className={ghost}>Back to my Self Build step</Link>}
            </div>
          </Card>
        ) : result ? (
          <Card>
            <div className="text-xs text-[color:var(--royal)]">Review your reflection</div>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">{result.summary || "You chose not to add details, that's completely fine."}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className={btn} onClick={() => finish(true)}>Save to My Self</button>
              <button className={ghost} onClick={() => setResult(null)}>Edit my reflection</button>
              <button className={ghost} onClick={() => finish(false)}>Keep only for this session</button>
              <button className={ghost} onClick={discard}>Discard</button>
            </div>
          </Card>
        ) : (
          <Game key={round} game={game} onReview={setResult} />
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-[color:var(--rule)] p-6 sm:p-8">{children}</section>;
}

function Game({ game, onReview }: { game: GameMeta; onReview: (r: Result) => void }) {
  if (game.key === "word_lens") return <WordLens onReview={onReview} />;
  if (game.key === "evidence_sort") return <EvidenceSort onReview={onReview} />;
  if (game.key === "word_pair") return <WordPair onReview={onReview} />;
  if (game.key === "life_dots") return <LifeDots onReview={onReview} />;
  return <Reframe onReview={onReview} />;
}

/** Tentative AI suggestions, only on request; each can be accepted or ignored. */
function Suggest({ kind, context, onPick, picked }: { kind: "words" | "themes"; context: string; onPick: (s: string) => void; picked: string[] }) {
  const [list, setList] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    setBusy(true); setErr(null);
    try { setList(await suggestForGame(kind, context)); }
    catch (e) { setErr(e instanceof Error ? e.message : "Suggestions aren't available right now."); }
    finally { setBusy(false); }
  };
  return (
    <div className="mt-5 rounded-xl border border-dashed border-[color:var(--royal)]/40 p-4 text-sm">
      {!list ? (
        <button className={ghost} disabled={busy || context.trim().length < 3} onClick={run}>{busy ? "Thinking…" : kind === "words" ? "Suggest a few more words" : "Suggest possible themes"}</button>
      ) : (
        <>
          <div className="text-xs text-[color:var(--royal)]">Possibilities only, not facts about you. Pick any, edit them, or ignore them all.</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {list.map((s) => <button key={s} className={chip(picked.includes(s))} onClick={() => onPick(s)}>{s}</button>)}
            <button className={ghost} onClick={() => setList(null)}>Dismiss</button>
          </div>
        </>
      )}
      {err && <p className="mt-2 text-destructive">{err}</p>}
    </div>
  );
}

function WordPair({ onReview }: { onReview: (r: Result) => void }) {
  const [i, setI] = useState(0);
  const p = WORD_PAIRS[i];
  const [closer, setCloser] = useState<string | null>(null);
  const [other, setOther] = useState("");
  const [defA, setDefA] = useState("");
  const [defB, setDefB] = useState("");
  const [mine, setMine] = useState("");
  const otherWord = closer === p.a ? p.b : p.a;
  const next = () => { setCloser(null); setOther(""); setDefA(""); setDefB(""); setMine(""); setI((i + 1) % WORD_PAIRS.length); };
  const review = () => {
    const defs: Record<string, string> = { [p.a]: defA.trim(), [p.b]: defB.trim() };
    onReview({
      promptKey: `${p.a}_${p.b}`.toLowerCase(),
      words: closer ? [closer] : [],
      example: mine.trim() || p.example,
      definitions: defs,
      content: { pair: [p.a, p.b], example: p.example, closer, otherWouldFitIf: other, definitions: defs, myExample: mine },
      summary: [
        `${p.a} or ${p.b}?`,
        closer ? `Closer to my experience: ${closer}` : "Neither felt closer.",
        other ? `${otherWord} would fit instead if: ${other}` : "",
        defA ? `${p.a}, in my words: ${defA}` : "",
        defB ? `${p.b}, in my words: ${defB}` : "",
        mine ? `My own example: ${mine}` : "",
      ].filter(Boolean).join("\n"),
    });
  };
  return (
    <Card>
      <div className="flex items-center gap-3 font-display text-3xl"><span>{p.a}</span><span className="text-base text-[color:var(--royal)]">or</span><span>{p.b}</span></div>
      <p className="mt-4 rounded-xl border border-[color:var(--rule)] p-4 text-sm">Example: {p.example}</p>
      <p className="mt-5 text-sm">Which word feels closer to your own experience? There is no correct answer.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[p.a, p.b].map((w) => <button key={w} aria-pressed={closer === w} className={chip(closer === w)} onClick={() => setCloser(closer === w ? null : w)}>{w}</button>)}
      </div>
      {closer && (
        <label className="mt-5 block animate-in fade-in text-sm">What would make &ldquo;{otherWord}&rdquo; fit instead? (optional)
          <textarea rows={2} value={other} onChange={(e) => setOther(e.target.value)} className={field} />
        </label>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">{p.a}, in my own words (optional)<textarea rows={2} value={defA} onChange={(e) => setDefA(e.target.value)} className={field} /></label>
        <label className="text-sm">{p.b}, in my own words (optional)<textarea rows={2} value={defB} onChange={(e) => setDefB(e.target.value)} className={field} /></label>
      </div>
      <label className="mt-4 block text-sm">An example from my own life (optional)
        <input value={mine} maxLength={300} onChange={(e) => setMine(e.target.value)} className={field} />
      </label>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className={btn} disabled={!closer && !defA && !defB} onClick={review}>Review</button>
        <button className={ghost} onClick={next}>Try another pair</button>
      </div>
    </Card>
  );
}

function LifeDots({ onReview }: { onReview: (r: Result) => void }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [dots, setDots] = useState<string[]>([]);
  const [newDot, setNewDot] = useState("");
  const [themes, setThemes] = useState<string[]>(LIFE_DOT_THEMES);
  const [newTheme, setNewTheme] = useState("");
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(null);
  const [pattern, setPattern] = useState("");
  const [alt, setAlt] = useState("");

  useEffect(() => {
    supabase.from("self_build_game_reflections").select("content").order("created_at", { ascending: false }).limit(12).then(({ data }) => {
      setSaved((data ?? []).map((r) => String((r.content as { summary?: string })?.summary ?? "").split("\n")[0]).filter(Boolean).slice(0, 8));
    });
  }, []);

  const addDot = (v: string) => { const t = v.trim().slice(0, 140); if (t && !dots.includes(t)) setDots([...dots, t]); };
  const addTheme = (v: string) => { const t = v.trim().slice(0, 60); if (t && !themes.includes(t)) setThemes([...themes, t]); };
  const renameTheme = (old: string) => {
    const n = prompt("Rename this theme", old)?.trim();
    if (!n || themes.includes(n)) return;
    setThemes(themes.map((t) => (t === old ? n : t)));
    setPlaced(Object.fromEntries(Object.entries(placed).map(([d, t]) => [d, t === old ? n : t])));
  };
  const removeTheme = (t: string) => { setThemes(themes.filter((x) => x !== t)); setPlaced(Object.fromEntries(Object.entries(placed).filter(([, x]) => x !== t))); };
  const grouped = themes.map((t) => ({ t, items: dots.filter((d) => placed[d] === t) })).filter((g) => g.items.length);

  const review = () =>
    onReview({
      promptKey: "life_dots",
      content: { dots, themes: Object.fromEntries(grouped.map((g) => [g.t, g.items])), pattern, otherExplanation: alt },
      summary: [
        ...grouped.map((g) => `${g.t}: ${g.items.join("; ")}`),
        pattern ? `A pattern I notice: ${pattern}` : "",
        alt ? `Another possible explanation: ${alt}` : "",
      ].filter(Boolean).join("\n") || `Experiences: ${dots.join("; ")}`,
    });

  return (
    <Card>
      <p className="font-display text-xl">Add experiences you choose to include. Only what you place here is used.</p>
      {saved.length > 0 && (
        <div className="mt-4 text-sm">
          <div className="text-xs text-[color:var(--royal)]">From your saved reflections, tap to include</div>
          <div className="mt-2 flex flex-wrap gap-2">{saved.map((s) => <button key={s} className={chip(dots.includes(s))} onClick={() => (dots.includes(s) ? setDots(dots.filter((d) => d !== s)) : addDot(s))}>{s.slice(0, 60)}</button>)}</div>
        </div>
      )}
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); addDot(newDot); setNewDot(""); }}>
        <input value={newDot} maxLength={140} onChange={(e) => setNewDot(e.target.value)} placeholder="An experience, e.g. Moving to a new city" className="flex-1 rounded-full border border-[color:var(--rule)] bg-transparent px-4 py-2 text-sm outline-none" />
        <button className={ghost}>Add dot</button>
      </form>

      {dots.length > 0 && (
        <>
          <div className="mt-6 flex flex-wrap gap-3">
            {dots.map((d) => (
              <button key={d} aria-pressed={active === d} onClick={() => setActive(active === d ? null : d)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${active === d ? "border-[color:var(--royal)] bg-[color:var(--royal)]/10" : "border-[color:var(--rule)]"}`}>
                <span className={`h-3 w-3 rounded-full ${placed[d] ? "bg-[color:var(--royal)]" : "border border-[color:var(--royal)]"}`} />{d.slice(0, 50)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs">Tap a dot, then tap a theme to place it there. Tap the theme again to take it out.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {themes.map((t) => (
              <div key={t} className={`rounded-xl border p-4 ${active && placed[active] === t ? "border-[color:var(--royal)]" : "border-[color:var(--rule)]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <button disabled={!active} onClick={() => active && setPlaced((m) => { const n = { ...m }; if (n[active] === t) delete n[active]; else n[active] = t; return n; })} className="text-left text-sm font-medium text-[color:var(--royal)]">{t}</button>
                  <span className="flex gap-2 text-xs"><button onClick={() => renameTheme(t)}>Rename</button><button onClick={() => removeTheme(t)}>Remove</button></span>
                </div>
                <div className="mt-2 text-xs">{dots.filter((d) => placed[d] === t).join("; ")}</div>
              </div>
            ))}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addTheme(newTheme); setNewTheme(""); }}>
            <input value={newTheme} maxLength={60} onChange={(e) => setNewTheme(e.target.value)} placeholder="Name your own theme" className="flex-1 rounded-full border border-[color:var(--rule)] bg-transparent px-4 py-2 text-sm outline-none" />
            <button className={ghost}>Add theme</button>
          </form>
          {dots.length >= 2 && <Suggest kind="themes" context={dots.join("\n")} picked={themes} onPick={addTheme} />}
          <label className="mt-5 block text-sm">Do you notice a pattern? (optional, only you decide)
            <textarea rows={2} value={pattern} onChange={(e) => setPattern(e.target.value)} className={field} />
          </label>
          <label className="mt-4 block text-sm">What is another possible explanation? (optional)
            <textarea rows={2} value={alt} onChange={(e) => setAlt(e.target.value)} className={field} />
          </label>
        </>
      )}
      <div className="mt-6 flex gap-2"><button className={btn} disabled={dots.length < 1} onClick={review}>Review</button></div>
    </Card>
  );
}

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function WordLens({ onReview }: { onReview: (r: Result) => void }) {
  const [i, setI] = useState(0);
  const p = WORD_LENS_PROMPTS[i];
  const [sel, setSel] = useState<string[]>([]);
  const [own, setOwn] = useState("");
  const [none, setNone] = useState(false);
  const [why, setWhy] = useState("");
  const all = [...sel, ...(own.trim() ? [own.trim()] : [])];

  const next = () => {
    setSel([]); setOwn(""); setNone(false); setWhy("");
    setI((i + 1) % WORD_LENS_PROMPTS.length);
  };
  const review = () =>
    onReview({
      promptKey: p.key,
      words: none ? [] : all,
      example: why.trim() || p.question,
      content: { question: p.question, words: none ? [] : all, none, why },
      summary: [p.question, none ? "None of these words fit." : all.length ? `Words: ${all.join(", ")}` : "", why ? `Why it fits: ${why}` : ""].filter(Boolean).join("\n"),
    });

  return (
    <Card>
      <p className="font-display text-xl leading-snug">{p.question}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {[...p.words, ...sel.filter((w) => !p.words.includes(w))].map((w) => (
          <button key={w} aria-pressed={sel.includes(w)} className={chip(sel.includes(w))} onClick={() => { setNone(false); setSel(toggle(sel, w)); }}>{w}</button>
        ))}
        <button aria-pressed={none} className={chip(none)} onClick={() => { setNone(!none); setSel([]); }}>None of these</button>
      </div>
      <label className="mt-5 block text-sm">Add my own word
        <input value={own} maxLength={60} onChange={(e) => { setNone(false); setOwn(e.target.value); }} className={field} placeholder="Something else…" />
      </label>
      <Suggest key={p.key} kind="words" context={`${p.question}\nAlready considered: ${p.words.join(", ")}${why ? `\nTheir note: ${why}` : ""}`} picked={sel} onPick={(w) => { setNone(false); setSel(toggle(sel, w)); }} />
      {all.length > 0 && (
        <label className="mt-5 block animate-in fade-in text-sm">What makes this word feel right for your experience? (optional)
          <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={3} className={field} />
        </label>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <button className={btn} disabled={!all.length && !none} onClick={review}>Review</button>
        <button className={ghost} onClick={next}>Skip this question</button>
      </div>
    </Card>
  );
}

function EvidenceSort({ onReview }: { onReview: (r: Result) => void }) {
  const [acts, setActs] = useState<string[]>(SORT_DEFAULT_ACTIVITIES);
  const [newAct, setNewAct] = useState("");
  const [cats, setCats] = useState<Record<string, string[]>>({});
  const [active, setActive] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState<string | null>(null);

  const sorted = Object.entries(cats).filter(([, c]) => c.length);
  const assign = (a: string, c: string) => setCats((m) => ({ ...m, [a]: toggle(m[a] ?? [], c) }));

  const review = () =>
    onReview({
      promptKey: "sort",
      content: { categories: cats, notes },
      summary: SORT_CATEGORIES.map((c) => {
        const items = sorted.filter(([, cs]) => cs.includes(c.id)).map(([a]) => (notes[a] ? `${a} (${notes[a]})` : a));
        return items.length ? `${c.label}: ${items.join(", ")}` : "";
      }).filter(Boolean).join("\n"),
    });

  return (
    <Card>
      <p className="font-display text-xl">Tap an activity, then choose what it is for you. Pick as many as fit, or drag a card onto a category.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {acts.map((a) => (
          <button key={a} draggable onDragStart={() => setDrag(a)} aria-pressed={active === a} className={chip(active === a)} onClick={() => setActive(active === a ? null : a)}>
            {a}{cats[a]?.length ? ` · ${cats[a].length}` : ""}
          </button>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = newAct.trim(); if (v && !acts.includes(v)) setActs([...acts, v]); setNewAct(""); }}>
        <input value={newAct} maxLength={60} onChange={(e) => setNewAct(e.target.value)} placeholder="Add your own activity" className="flex-1 rounded-full border border-[color:var(--rule)] bg-transparent px-4 py-2 text-sm outline-none" />
        <button className={ghost}>Add</button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SORT_CATEGORIES.map((c) => {
          const on = !!active && (cats[active] ?? []).includes(c.id);
          return (
            <button
              key={c.id}
              disabled={!active && !drag}
              onClick={() => active && assign(active, c.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (drag) assign(drag, c.id); setDrag(null); }}
              className={`rounded-xl border p-4 text-left transition ${on ? "border-[color:var(--royal)] bg-[color:var(--royal)]/10" : "border-[color:var(--rule)]"}`}
            >
              <div className="text-sm font-medium text-[color:var(--royal)]">{c.label}</div>
              <div className="text-xs">{c.hint}</div>
              <div className="mt-2 text-xs">{sorted.filter(([, cs]) => cs.includes(c.id)).map(([a]) => a).join(", ")}</div>
            </button>
          );
        })}
      </div>

      {active && (cats[active]?.length ?? 0) > 0 && (
        <label className="mt-5 block animate-in fade-in text-sm">
          Optional note about {active}: {SORT_FOLLOWUPS[active.length % SORT_FOLLOWUPS.length]}
          <textarea rows={2} value={notes[active] ?? ""} onChange={(e) => setNotes({ ...notes, [active]: e.target.value })} className={field} />
        </label>
      )}
      <p className="mt-4 text-xs">This records your own view of yourself, not a verified ability.</p>
      <div className="mt-6 flex gap-2">
        <button className={btn} disabled={!sorted.length} onClick={review}>See my summary</button>
      </div>
    </Card>
  );
}

function Reframe({ onReview }: { onReview: (r: Result) => void }) {
  const [behavior, setBehavior] = useState(REFRAME_EXAMPLE);
  const [protect, setProtect] = useState<string[]>([]);
  const [pText, setPText] = useState("");
  const [cost, setCost] = useState<string[]>([]);
  const [cText, setCText] = useState("");
  const [now, setNow] = useState("");
  const [step, setStep] = useState(0);
  const pAll = [...protect, pText.trim()].filter(Boolean);
  const cAll = [...cost, cText.trim()].filter(Boolean);

  const review = () =>
    onReview({
      promptKey: "two_sides",
      content: { behavior, protected: pAll, cost: cAll, now },
      summary: [`Behavior: ${behavior}`, `May have protected me from: ${pAll.join(", ") || "not explored"}`, `May have cost me: ${cAll.join(", ") || "not explored"}`, now ? `How I'd describe it now: ${now}` : ""].filter(Boolean).join("\n"),
    });

  if (step === 0)
    return (
      <Card>
        <p className="font-display text-xl">Sometimes waiting before acting may help us feel more prepared. Choose a behavior you are comfortable exploring, or keep this neutral example.</p>
        <input value={behavior} maxLength={120} onChange={(e) => setBehavior(e.target.value)} className={field} />
        <div className="mt-6 flex gap-2"><button className={btn} disabled={!behavior.trim()} onClick={() => setStep(1)}>Continue</button></div>
      </Card>
    );

  if (step === 1 || step === 2) {
    const isP = step === 1;
    const opts = isP ? REFRAME_PROTECT : REFRAME_COST;
    const sel = isP ? protect : cost;
    const setSel = isP ? setProtect : setCost;
    return (
      <Card>
        <div className="text-xs text-[color:var(--royal)]">Perspective {step} of 2</div>
        <p className="mt-2 font-display text-xl">{isP ? "What might this behavior have been trying to protect me from?" : "What might this behavior have cost me?"}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {opts.map((o) => <button key={o} aria-pressed={sel.includes(o)} className={chip(sel.includes(o))} onClick={() => setSel(toggle(sel, o))}>{o}</button>)}
        </div>
        <label className="mt-5 block text-sm">Something else (optional)
          <input value={isP ? pText : cText} onChange={(e) => (isP ? setPText : setCText)(e.target.value)} className={field} />
        </label>
        <div className="mt-6 flex flex-wrap gap-2">
          <button className={btn} onClick={() => setStep(step + 1)}>Continue</button>
          <button className={ghost} onClick={() => { setSel([]); isP ? setPText("") : setCText(""); setStep(step + 1); }}>I don&rsquo;t know</button>
          <button className={ghost} onClick={() => { setSel([]); isP ? setPText("") : setCText(""); setStep(step + 1); }}>I don&rsquo;t want to explore this</button>
          <button className={ghost} onClick={() => setStep(step - 1)}>Back</button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-xs text-[color:var(--royal)]">Two perspectives on: {behavior}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--rule)] p-4"><div className="text-sm font-medium text-[color:var(--royal)]">What it may have protected me from</div><p className="mt-2 text-sm">{pAll.join(", ") || "Not explored"}</p></div>
        <div className="rounded-xl border border-[color:var(--rule)] p-4"><div className="text-sm font-medium text-[color:var(--royal)]">What it may have cost me</div><p className="mt-2 text-sm">{cAll.join(", ") || "Not explored"}</p></div>
      </div>
      <p className="mt-4 text-xs">These are possibilities you noticed, not conclusions about you.</p>
      <label className="mt-5 block text-sm">How would you like to describe this behavior now? (optional)
        <textarea rows={3} value={now} onChange={(e) => setNow(e.target.value)} className={field} />
      </label>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className={btn} onClick={review}>Review</button>
        <button className={ghost} onClick={() => setStep(1)}>Explore another perspective</button>
      </div>
    </Card>
  );
}
