import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AVATAR_DIMENSIONS, getDimension } from "@/lib/avatar-factors";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { decryptText, encryptText } from "@/lib/avatar-crypto";

export const Route = createFileRoute("/_authenticated/avatar/dimension/$n")({
  head: () => ({
    meta: [
      { title: "Factor — InwardWise Self · Inwardwise" },
      {
        name: "description",
        content:
          "Answer the questions of this factor to build your Inner InwardWise Self. Private and encrypted.",
      },
      { property: "og:title", content: "Factor — InwardWise Self · Inwardwise" },
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

  return (
    <div className="mx-auto w-[min(820px,calc(100%-2rem))] py-14 sm:py-20">
      <Link
        to="/avatar"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← InwardWise Self Design
      </Link>

      <div className="font-mono-cap mt-8 flex items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
        {dim.section} · {dim.italic}
        {dim.locked && <Lock className="h-3 w-3" />}
      </div>

      {step === -1 ? (
        <section className="mt-4">
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] tracking-tight">
            {dim.title} <span className="italic text-[color:var(--royal)]">{dim.italic}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--muted-foreground)]">
            {dim.intro}
          </p>
          {dim.locked && (
            <div className="mt-8 max-w-2xl">
              <Caution>
                This factor is private and encrypted with your PIN. It is stored as written —
                unread, unmoderated, and invisible to administrators.
              </Caution>
            </div>
          )}
          <button
            onClick={() => setStep(0)}
            disabled={!loaded}
            className="mt-10 rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
          >
            Begin — {total} {total === 1 ? "question" : "questions"}
          </button>
        </section>
      ) : (
        <section className="mt-4">
          <div className="h-px w-full bg-[color:var(--rule)]">
            <div
              className="h-px bg-[color:var(--ink)] transition-all"
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
          <div className="font-mono-cap mt-3 text-[10px] text-[color:var(--muted-foreground)]">
            Question {step + 1} of {total}
          </div>

          <h1 className="mt-8 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.15] tracking-tight">
            {q!.prompt}
          </h1>
          {q!.helper && (
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{q!.helper}</p>
          )}
          {dim.locked && (
            <div className="font-mono-cap mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-3 py-1 text-[10px]">
              <Lock className="h-3 w-3" /> Encrypted · only visible to you
            </div>
          )}

          <textarea
            value={answers[q!.key] ?? ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q!.key]: e.target.value }))}
            placeholder="Write in your own words…"
            className="mt-6 min-h-[220px] w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
          />

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[color:var(--rule)] pt-6">
            <button
              onClick={async () => {
                await persist(false);
                setStep((s) => s - 1);
              }}
              className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px]"
            >
              Back
            </button>
            <button
              onClick={async () => {
                if (step + 1 < total) {
                  await persist(false);
                  setStep((s) => s + 1);
                } else {
                  const allDone = await persist(true);
                  navigate({ to: allDone ? "/avatar/consult" : "/avatar" });
                }
              }}
              disabled={saving}
              className="rounded-full bg-[color:var(--ink)] px-6 py-2 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
            >
              {step + 1 < total ? "Continue" : "Finish factor"}
            </button>
            {saving && (
              <span className="text-sm text-[color:var(--muted-foreground)]">Saving…</span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
