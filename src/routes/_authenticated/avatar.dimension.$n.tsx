import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lightbulb, Lock, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AVATAR_DIMENSIONS, getDimension } from "@/lib/avatar-factors";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { decryptText, encryptText } from "@/lib/avatar-crypto";
import { runMiFilter } from "@/lib/mi-filter.functions";

const MAX_ROUNDS = 10;

export const Route = createFileRoute("/_authenticated/avatar/dimension/$n")({
  head: () => ({
    meta: [
      { title: "Factor — InwardWise Self · InwardWise" },
      {
        name: "description",
        content:
          "A guided conversation that builds this factor of your InwardWise Self. Private and encrypted.",
      },
      { property: "og:title", content: "Factor — InwardWise Self · InwardWise" },
      { property: "og:description", content: "A conversation, in your own words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DimensionFlow,
});

type Turn = { question: string; answer: string };

function DimensionFlow() {
  const { n } = Route.useParams();
  const navigate = useNavigate();
  const vault = useAvatarVault();
  const dim = useMemo(() => getDimension(Number(n)), [n]);

  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [asked, setAsked] = useState<string>("");
  const [round, setRound] = useState(1);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [careNote, setCareNote] = useState(false);

  useEffect(() => {
    if (vault.status !== "unlocked" || !vault.key || !vault.profile || !dim) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("avatar_answers")
        .select("question_key, answer_text")
        .eq("user_id", vault.profile!.user_id)
        .eq("dimension_number", dim.n);
      const out: Record<string, string> = {};
      for (const row of data ?? []) {
        out[row.question_key] = await decryptText(vault.key!, row.answer_text);
      }
      if (!cancelled) {
        setAnswers(out);
        // Resume where they stopped: first question without an answer.
        const firstOpen = dim.questions.findIndex((q) => !(out[q.key] ?? "").trim());
        const idx = firstOpen === -1 ? 0 : firstOpen;
        setQIndex(idx);
        setAsked(dim.questions[idx].opener ?? dim.questions[idx].prompt);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vault.status, vault.key, vault.profile, dim]);

  if (!dim) {
    return (
      <div className="mx-auto w-[min(700px,calc(100%-2rem))] py-24 text-center">
        <p className="font-display text-3xl">That factor does not exist.</p>
        <Link to="/avatar" className="mt-6 inline-block text-sm underline">
          Back to InwardWise Self Design
        </Link>
      </div>
    );
  }

  if (vault.status === "loading") return <div className="min-h-[60vh]" />;

  if (vault.status !== "unlocked") {
    return (
      <div className="mx-auto grid w-[min(900px,calc(100%-2rem))] gap-8 py-20 md:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--rule)] p-8">
          <PinKeypad
            mode={vault.status === "needs-setup" ? "setup" : "enter"}
            busy={vault.busy}
            error={vault.error}
            onSubmit={(pin) =>
              vault.status === "needs-setup" ? vault.setupPin(pin) : vault.unlock(pin)
            }
          />
        </div>
        <Caution>
          Your answers are encrypted with this PIN. There is no recovery flow — losing the PIN
          means permanently losing access to what you wrote here.
        </Caution>
      </div>
    );
  }

  const q = dim.questions[qIndex];
  const answeredCount = dim.questions.filter((question) =>
    (answers[question.key] ?? "").trim(),
  ).length;

  async function persist(nextAnswers: Record<string, string>, finished: boolean) {
    if (!vault.key || !vault.profile) return false;
    const rows = await Promise.all(
      dim!.questions.map(async (question) => ({
        user_id: vault.profile!.user_id,
        dimension_number: dim!.n,
        question_key: question.key,
        answer_text: await encryptText(vault.key!, nextAnswers[question.key] ?? ""),
        updated_at: new Date().toISOString(),
      })),
    );
    await supabase.from("avatar_answers").upsert(rows, { onConflict: "user_id,question_key" });

    const done = dim!.questions.filter((question) =>
      (nextAnswers[question.key] ?? "").trim(),
    ).length;
    const pct = finished ? 100 : Math.round((done / dim!.questions.length) * 100);
    await supabase.from("avatar_dimensions").upsert(
      {
        user_id: vault.profile.user_id,
        dimension_number: dim!.n,
        progress_pct: pct,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,dimension_number" },
    );

    if (!finished) return false;
    const { data } = await supabase
      .from("avatar_dimensions")
      .select("dimension_number, progress_pct")
      .eq("user_id", vault.profile.user_id);
    const complete = new Set(
      (data ?? []).filter((r) => r.progress_pct >= 100).map((r) => r.dimension_number),
    );
    return AVATAR_DIMENSIONS.every((d) => complete.has(d.n));
  }

  function moveToNextQuestion(nextAnswers: Record<string, string>) {
    const next = qIndex + 1;
    setTurns([]);
    setRound(1);
    setDraft("");
    setShowExamples(false);
    if (next < dim!.questions.length) {
      setQIndex(next);
      setAsked(dim!.questions[next].opener ?? dim!.questions[next].prompt);
      void persist(nextAnswers, false);
    } else {
      void (async () => {
        const allDone = await persist(nextAnswers, true);
        navigate({ to: allDone ? "/avatar/consult" : "/avatar" });
      })();
    }
  }

  async function submit() {
    const text = draft.trim();
    if (!text || thinking) return;
    const nextTurns = [...turns, { question: asked, answer: text }];
    setTurns(nextTurns);
    setDraft("");
    setThinking(true);
    setAffirmation(null);
    try {
      const combined = nextTurns
        .map((t) => t.answer)
        .join("\n\n")
        .trim();
      const nextAnswers = { ...answers, [q.key]: combined };
      setAnswers(nextAnswers);

      const result = await runMiFilter({
        data: {
          factorNumber: dim!.n,
          targetQuestion: q.prompt,
          targetIntent: q.intent,
          round,
          turns: nextTurns.slice(-8),
        },
      });

      setAffirmation(result.affirmation || null);
      if (result.safety === "concern") setCareNote(true);

      if (result.sufficient || round >= MAX_ROUNDS || !result.nextQuestion) {
        moveToNextQuestion(nextAnswers);
      } else {
        setAsked(result.nextQuestion);
        setRound((r) => r + 1);
        setShowExamples(false);
        await persist(nextAnswers, false);
      }
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="mx-auto w-[min(820px,calc(100%-2rem))] py-14 sm:py-20">
      <Link
        to="/avatar"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← InwardWise Self Design
      </Link>

      <div className="font-mono-cap mt-8 flex items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
        Factor {dim.n}
        {dim.locked && <Lock className="h-3 w-3" />}
      </div>

      {!started ? (
        <section className="mt-4">
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] tracking-tight">
            Factor {dim.n}
          </h1>
          <p className="mt-6 max-w-2xl text-justify text-base leading-relaxed text-[color:var(--muted-foreground)]">
            This is a conversation, not a form. We begin somewhere easy, listen to what you write,
            and follow it with the next question that fits. There is no set number of questions and
            nothing to score. Everything is encrypted and visible only to you.
          </p>
          {answeredCount > 0 && (
            <p className="mt-4 max-w-2xl text-sm text-[color:var(--royal)]">
              You stopped part way through this factor before. We will pick up where you left off.
            </p>
          )}
          {dim.locked && (
            <div className="mt-8 max-w-2xl">
              <Caution>
                This factor is private and encrypted with your PIN. It is stored as written —
                unread, unmoderated, and invisible to administrators.
              </Caution>
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setStarted(true)}
              disabled={!loaded}
              className="rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
            >
              {answeredCount > 0 ? "Continue the conversation" : "Begin the conversation"}
            </button>
            <Link
              to="/avatar"
              className="font-mono-cap inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[10px]"
            >
              <Phone className="h-3 w-3" /> Rather answer by phone
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-4">
          {turns.length > 0 && (
            <div className="mb-8 space-y-4 border-l border-[color:var(--rule)] pl-5">
              {turns.map((t, i) => (
                <div key={i}>
                  <p className="text-sm text-[color:var(--muted-foreground)]">{t.question}</p>
                  <p className="mt-1 text-justify text-[15px] leading-relaxed">{t.answer}</p>
                </div>
              ))}
            </div>
          )}

          {careNote && (
            <div className="mb-6 rounded-lg border border-[color:var(--rule)] p-5">
              <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                Before we carry on
              </div>
              <p className="mt-3 text-justify text-sm text-[color:var(--muted-foreground)]">
                What you wrote matters more than this exercise. If you are unsafe or having thoughts
                of harming yourself, please reach a person now: call or text{" "}
                <span className="text-[color:var(--ink)]">988</span> in the US, or your local
                emergency number. This page will wait for you.
              </p>
            </div>
          )}

          {affirmation && (
            <p className="mb-6 text-justify text-sm italic text-[color:var(--royal)]">
              {affirmation}
            </p>
          )}

          <h1 className="mt-2 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.15] tracking-tight">
            {asked}
          </h1>
          {round === 1 && q.helper && (
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{q.helper}</p>
          )}
          {dim.locked && (
            <div className="font-mono-cap mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-3 py-1 text-[10px]">
              <Lock className="h-3 w-3" /> Encrypted · only visible to you
            </div>
          )}

          {q.examples && q.examples.length > 0 && (
            <div className="mt-5">
              <button
                onClick={() => setShowExamples((v) => !v)}
                className="font-mono-cap inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-4 py-1.5 text-[10px]"
              >
                <Lightbulb className="h-3 w-3" />
                {showExamples ? "Hide examples" : "Show me examples"}
              </button>
              {showExamples && (
                <ul className="mt-4 space-y-2 rounded-lg border border-[color:var(--rule)] p-5 text-sm text-[color:var(--muted-foreground)]">
                  {q.examples.map((ex) => (
                    <li key={ex} className="text-justify">
                      “{ex}”
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write in your own words…"
            className="mt-6 min-h-[200px] w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
          />

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[color:var(--rule)] pt-6">
            <button
              onClick={submit}
              disabled={thinking || !draft.trim()}
              className="rounded-full bg-[color:var(--ink)] px-6 py-2 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
            >
              {thinking ? "Listening…" : "Continue"}
            </button>
            <button
              onClick={() => moveToNextQuestion(answers)}
              disabled={thinking}
              className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px] disabled:opacity-50"
            >
              Move on
            </button>
            <Link
              to="/avatar"
              className="text-[13px] text-[color:var(--muted-foreground)] underline"
            >
              Save and come back later
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
