import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AVATAR_DIMENSIONS, getDimension } from "@/lib/avatar-factors";
import {
  SELF_JOURNEY,
  TOTAL_JOURNEY_STAGES,
  getStage,
  stageIndex,
} from "@/lib/self-journey";
import { SelfJourneyProgress } from "@/components/avatar/SelfJourneyProgress";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { MIInterview } from "@/components/mi/MIInterview";
import { decryptText, encryptText } from "@/lib/avatar-crypto";
import { ProductName } from "@/components/products/ProductChrome";
import {
  FactorSharingControl,
  defaultFactorSharingPreference,
  type FactorSharingPreference,
} from "@/components/avatar/FactorSharingControl";

export const Route = createFileRoute("/_authenticated/avatar/dimension/$n")({
  head: () => ({
    meta: [
      { title: "Your Self Journey, InwardWise" },
      {
        name: "description",
        content:
          "A guided conversation that builds your Self Avatar, one stage at a time. Private and encrypted.",
      },
      { property: "og:title", content: "Your Self Journey, InwardWise" },
      { property: "og:description", content: "One question at a time, in your own words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DimensionFlow,
});

function DimensionFlow() {
  const { n } = Route.useParams();
  const navigate = useNavigate();
  const vault = useAvatarVault();
  const dim = useMemo(() => getDimension(Number(n)), [n]);

  const [step, setStep] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [finished, setFinished] = useState<{ allDone: boolean } | null>(null);
  const [resumeStep, setResumeStep] = useState(0);
  const [sharing, setSharing] = useState<FactorSharingPreference>(
    defaultFactorSharingPreference(),
  );
  const [sharingSaving, setSharingSaving] = useState(false);

  useEffect(() => {
    if (vault.status !== "unlocked" || !vault.key || !vault.profile || !dim) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("avatar_answers")
        .select("question_key, answer_text")
        .eq("user_id", vault.profile!.user_id)
        .eq("dimension_number", dim.n);
      const { data: dimensionRow } = await supabase
        .from("avatar_dimensions")
        .select("sharing_classification, external_share_acknowledged, external_share_acknowledged_at")
        .eq("user_id", vault.profile!.user_id)
        .eq("dimension_number", dim.n)
        .maybeSingle();
      const out: Record<string, string> = {};
      for (const row of data ?? []) {
        out[row.question_key] = await decryptText(vault.key!, row.answer_text);
      }
      if (!cancelled) {
        setAnswers(out);
        if (dimensionRow) {
          setSharing({
            classification:
              dimensionRow.sharing_classification === "external_approved"
                ? "external_approved"
                : "internal_only",
            acknowledged: dimensionRow.external_share_acknowledged,
            acknowledgedAt: dimensionRow.external_share_acknowledged_at,
          });
        }
        // Resume on the first question that has nothing written yet.
        const firstEmpty = dim.questions.findIndex((q) => !(out[q.key] ?? "").trim());
        setResumeStep(firstEmpty === -1 ? dim.questions.length - 1 : firstEmpty);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vault.status, vault.key, vault.profile, dim]);

  // Autosave: anything written is stored a moment after typing stops.
  useEffect(() => {
    if (!loaded || vault.status !== "unlocked") return;
    const t = setTimeout(() => {
      void persist(false).then(() => {
        setSavedNote("Saved");
        setTimeout(() => setSavedNote(null), 2000);
      });
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, loaded, vault.status]);


  if (!dim) {
    return (
      <div className="mx-auto w-[min(700px,calc(100%-2rem))] py-24 text-center">
        <p className="font-display text-3xl">That stage does not exist.</p>
        <Link to="/avatar" className="mt-6 inline-block text-sm underline">
          Back to your Self Journey
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
          Your answers are encrypted with this PIN. There is no recovery flow, losing the PIN
          means permanently losing access to what you wrote here.
        </Caution>
      </div>
    );
  }

  const total = dim.questions.length;
  const q = step >= 0 ? dim.questions[step] : null;

  async function persist(finished: boolean) {
    if (!vault.key || !vault.profile) return false;
    setSaving(true);
    try {
      const rows = await Promise.all(
        dim!.questions.map(async (question) => ({
          user_id: vault.profile!.user_id,
          dimension_number: dim!.n,
          question_key: question.key,
          answer_text: await encryptText(vault.key!, answers[question.key] ?? ""),
          updated_at: new Date().toISOString(),
        })),
      );
      await supabase.from("avatar_answers").upsert(rows, { onConflict: "user_id,question_key" });

      const answered = dim!.questions.filter((question) =>
        (answers[question.key] ?? "").trim(),
      ).length;
      const pct = finished ? 100 : Math.round((answered / total) * 100);
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
      const done = new Set(
        (data ?? []).filter((r) => r.progress_pct >= 100).map((r) => r.dimension_number),
      );
      return AVATAR_DIMENSIONS.every((d) => done.has(d.n));
    } finally {
      setSaving(false);
    }
  }

  async function saveSharing(next: FactorSharingPreference) {
    if (!vault.profile || !dim) return;
    setSharingSaving(true);
    try {
      const { error } = await supabase.from("avatar_dimensions").upsert(
        {
          user_id: vault.profile.user_id,
          dimension_number: dim.n,
          progress_pct: Math.round(
            (dim.questions.filter((question) => (answers[question.key] ?? "").trim()).length /
              dim.questions.length) *
              100,
          ),
          sharing_classification: next.classification,
          external_share_acknowledged: next.acknowledged,
          external_share_acknowledged_at: next.acknowledgedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,dimension_number" },
      );
      if (error) throw new Error(error.message);
      setSharing(next);
    } finally {
      setSharingSaving(false);
    }
  }

  const stage = getStage(dim.n) ?? SELF_JOURNEY[0];
  const stageNo = stageIndex(dim.n) + 1;


  if (finished) {
    const nextStage = SELF_JOURNEY.find((s) => s.n > dim.n);
    return (
      <div className="mx-auto w-[min(820px,calc(100%-2rem))] py-20">
        <SelfJourneyProgress current={dim.n} compact />
        <h1 className="mt-10 font-display text-[clamp(2rem,4.5vw,3rem)] leading-tight">
          {finished.allDone ? "Your Self Journey is Complete" : stage.milestone}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--muted-foreground)]">
          {finished.allDone
            ? "We've explored different parts of your story to build a richer picture of you. Now let's bring it together."
            : nextStage
              ? nextStage.n === SELF_JOURNEY[SELF_JOURNEY.length - 1].n
                ? "You're getting close. Let's bring everything together."
                : `Next: ${nextStage.blurb}`
              : ""}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {finished.allDone ? (
            <button
              onClick={() => navigate({ to: "/avatar/consult" })}
              className="min-h-11 rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)]"
            >
              View My InwardWise Self
            </button>
          ) : (
            nextStage && (
              <Link
                to="/avatar/dimension/$n"
                params={{ n: String(nextStage.n) }}
                className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)]"
              >
                Continue
              </Link>
            )
          )}
          <Link
            to="/avatar"
            className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--rule)] px-6 py-2.5 text-[13px]"
          >
            Back to my journey
          </Link>
        </div>
      </div>
    );
  }


  const Encouragement = (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-xl border border-[color:var(--rule)] bg-white/60 p-6">
        <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Where you are
        </p>
        <p className="mt-3 text-base leading-relaxed text-[color:var(--ink)]">
          {stage.orientation}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          {stage.encouragement}
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--rule)] p-6">
        <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          A few gentle reminders
        </p>
        <ul className="mt-3 space-y-2.5">
          {stage.tips.map((tip) => (
            <li
              key={tip}
              className="flex gap-2.5 text-sm leading-relaxed text-[color:var(--muted-foreground)]"
            >
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--royal)]" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[color:var(--rule)] p-6">
        <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Why are we asking this?
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          {stage.why}
        </p>
      </div>
    </aside>
  );

  return (
    <div className="mx-auto w-[min(1180px,calc(100%-2rem))] py-14 sm:py-20">
      <Link
        to="/avatar"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← Your <ProductName id="self" /> Journey
      </Link>

      <div className="mt-8 max-w-3xl">
        <SelfJourneyProgress current={dim.n} compact={step === -1} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        {step === -1 ? (
          <section>
            <div className="font-mono-cap flex items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
              Stage {stageNo} of {TOTAL_JOURNEY_STAGES}
              {dim.locked && <Lock className="h-3 w-3" />}
            </div>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] tracking-tight">
              {stage.label}
            </h1>

            <div className="mt-4 inline-flex items-center rounded-full border border-[color:var(--royal)]/30 bg-[color:var(--royal)]/5 px-4 py-1.5 text-[13px] font-medium text-[color:var(--royal)]">
              {stage.focus}
            </div>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--muted-foreground)]">
              {stage.blurb} This is a conversation, not a test. There are no right or wrong answers,
              and you can share only what you are comfortable sharing.
            </p>

            <div className="mt-8 max-w-2xl rounded-xl border border-[color:var(--rule)] bg-white/60 p-6">
              <p className="text-base leading-relaxed text-[color:var(--ink)]">
                {stage.encouragement}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                Take your time. There is no rush, and you can pause whenever you need to.
              </p>
            </div>

            {dim.locked && (
              <div className="mt-8 max-w-2xl">
                <Caution>
                  This part of the conversation is private and encrypted with your PIN. It is stored
                  as written, unread, unmoderated, and invisible to administrators.
                </Caution>
              </div>
            )}
            <div className="mt-8 max-w-2xl">
              <FactorSharingControl
                factor={dim.n}
                preference={sharing}
                saving={sharingSaving}
                onChange={saveSharing}
              />
            </div>
            <button
              onClick={() => setStep(resumeStep)}
              disabled={!loaded}
              className="mt-10 min-h-11 rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
            >
              {stageNo === 1 ? "Start My Self Journey" : "Continue"}
            </button>
          </section>
        ) : (
          <section>
            <div className="font-mono-cap flex flex-wrap items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
              Stage {stageNo} of {TOTAL_JOURNEY_STAGES} · Question {step + 1} of {total}
            </div>
            <h1 className="mt-2 font-display text-[clamp(1.7rem,3.4vw,2.4rem)] leading-tight tracking-tight">
              {stage.label}
            </h1>

            {dim.locked && (
              <div className="font-mono-cap mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-3 py-1 text-[10px]">
                <Lock className="h-3 w-3" /> Encrypted · only visible to you
              </div>
            )}

            <div className="mt-5">
              <FactorSharingControl
                factor={dim.n}
                preference={sharing}
                saving={sharingSaving}
                onChange={saveSharing}
              />
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] bg-white/60 px-3 py-1 text-[12px] text-[color:var(--muted-foreground)]">
              <Lock className="h-3 w-3" />
              Remember: {stage.focus.replace(/^This section is about /, "").replace(/^This is the final section /, "")}
            </div>

            <div className="mt-4 lg:hidden">
              <button
                type="button"
                onClick={() => setShowWhy((v) => !v)}
                aria-expanded={showWhy}
                className="font-mono-cap min-h-11 text-[10px] text-[color:var(--muted-foreground)] underline-offset-4 hover:underline"
              >
                Why are we asking this?
              </button>
              {showWhy && (
                <p className="mt-2 max-w-2xl text-sm text-[color:var(--muted-foreground)]">
                  {stage.why}
                </p>
              )}
            </div>

            <div className="mt-6">
              <MIInterview
                key={q!.key}
                targetQuestion={q!.prompt}
                openingQuestion={q!.opening}
                context={`${dim.intro}${q!.helper ? `\n\n${q!.helper}` : ""}`}
                initialAnswer={answers[q!.key] ?? ""}
                sessionKey={`${dim.n}:${q!.key}`}
                onCapture={(text) => setAnswers((a) => ({ ...a, [q!.key]: text }))}
                onDraft={(text) =>
                  setAnswers((a) => (a[q!.key] === text ? a : { ...a, [q!.key]: text }))
                }
                completeLabel={step + 1 < total ? "Next question" : "Complete this stage"}
                onComplete={async () => {
                  if (step + 1 < total) {
                    await persist(false);
                    setStep((s) => s + 1);
                  } else {
                    const allDone = await persist(true);
                    setFinished({ allDone });
                  }
                }}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[color:var(--rule)] pt-6">
              <button
                onClick={async () => {
                  await persist(false);
                  setStep((s) => Math.max(0, s - 1));
                }}
                className="min-h-11 rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px]"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  await persist(false);
                  setSavedNote("Saved, you can continue later");
                  navigate({ to: "/avatar" });
                }}
                className="min-h-11 rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px]"
              >
                Save &amp; continue later
              </button>
              <span className="text-sm text-[color:var(--muted-foreground)]">
                {saving ? "Saving…" : "Everything you write is saved automatically."}
              </span>
              {savedNote && (
                <span className="text-sm text-[color:var(--royal)]" role="status">
                  {savedNote}
                </span>
              )}
            </div>
          </section>
        )}

        {Encouragement}
      </div>
    </div>
  );
}

