import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { AnimatedCharacter } from "@/components/people/AnimatedCharacter";
import {
  getScenario,
  saveScenarioProgress,
  saveScenarioReflection,
  saveScenarioResponse,
  type ScenarioDetail,
} from "@/lib/people.functions";

export const Route = createFileRoute("/_authenticated/people-like-me/$slug")({
  head: () => ({
    meta: [
      { title: "A fictional story | People Like Me | InwardWise" },
      {
        name: "description",
        content:
          "A fictional scenario you can move through one scene at a time, with space to reflect on what feels familiar.",
      },
      { property: "og:title", content: "A fictional story | InwardWise" },
      { property: "og:description", content: "Move through a fictional scenario, scene by scene." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StoryPage,
});

const FAMILIARITY = [
  { value: "very_much", label: "Very much" },
  { value: "somewhat", label: "Somewhat" },
  { value: "a_little", label: "A little" },
  { value: "not_really", label: "Not really" },
  { value: "not_sure", label: "I'm not sure" },
] as const;

function StoryPage() {
  const { slug } = useParams({ from: "/_authenticated/people-like-me/$slug" });
  const load = useServerFn(getScenario);
  const saveProgress = useServerFn(saveScenarioProgress);
  const saveResponse = useServerFn(saveScenarioResponse);
  const saveReflection = useServerFn(saveScenarioReflection);

  const [detail, setDetail] = useState<ScenarioDetail | null | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { optionId: string | null; freeText: string }>>({});
  const [familiarity, setFamiliarity] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load({ data: { slug } })
      .then((d) => {
        setDetail(d);
        if (!d) return;
        setIndex(Math.min(Math.max((d.interaction?.currentScene ?? 1) - 1, 0), d.scenes.length - 1));
        setPaused(d.interaction?.status === "paused");
        setFinished(d.interaction?.status === "completed");
        setFamiliarity(d.interaction?.familiarity ?? null);
        setNote(d.interaction?.familiarityNote ?? "");
        setAnswers(
          Object.fromEntries(
            Object.entries(d.responses).map(([k, v]) => [
              k,
              { optionId: v.optionId, freeText: v.freeText ?? "" },
            ]),
          ),
        );
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Something went wrong."));
  }, [load, slug]);

  const scene = useMemo(() => detail?.scenes[index] ?? null, [detail, index]);

  function persist(nextIndex: number, status: "in_progress" | "paused" | "completed") {
    if (!detail) return;
    void saveProgress({
      data: {
        scenarioId: detail.scenario.id,
        currentScene: nextIndex + 1,
        status,
      },
    }).catch(() => undefined);
  }

  function go(delta: number) {
    if (!detail) return;
    const next = Math.min(Math.max(index + delta, 0), detail.scenes.length - 1);
    setIndex(next);
    setPaused(false);
    persist(next, "in_progress");
  }

  function answer(questionId: string, optionId: string | null, freeText: string) {
    if (!detail) return;
    setAnswers((a) => ({ ...a, [questionId]: { optionId, freeText } }));
    void saveResponse({
      data: {
        scenarioId: detail.scenario.id,
        questionId,
        optionId,
        freeText,
      },
    }).catch(() => undefined);
  }

  if (detail === undefined) {
    return (
      <AppShell>
        <div className="mx-auto w-[min(900px,calc(100%-2rem))] py-16 text-sm text-[color:var(--muted-foreground)]">
          Loading story…
        </div>
      </AppShell>
    );
  }

  if (detail === null) {
    return (
      <AppShell>
        <div className="mx-auto w-[min(900px,calc(100%-2rem))] py-16">
          <p className="text-sm">This story is not available.</p>
          <Link to="/people-like-me" className="mt-4 inline-block text-sm underline">
            Back to People Like Me
          </Link>
        </div>
      </AppShell>
    );
  }

  const total = detail.scenes.length;
  const last = index === total - 1;

  return (
    <AppShell>
      <div className="mx-auto w-[min(900px,calc(100%-2rem))] py-12 md:py-16">
        <div className="flex items-center gap-4">
          <AnimatedCharacter
            avatarKey={detail.character.avatarKey}
            name={detail.character.name}
            state={scene?.characterState}
            environment={scene?.environment}
            animation={scene?.animation}
            size={84}
          />
          <div>
            <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              Fictional scenario
            </div>
            <h1 className="font-display mt-1 text-[clamp(1.8rem,5vw,2.8rem)] leading-tight">
              {detail.scenario.title}
            </h1>
          </div>
        </div>

        <p className="mt-5 rounded-lg border border-[color:var(--rule)] bg-[color:var(--royal)]/[0.04] p-4 text-sm leading-relaxed">
          {detail.character.name} is a fictional character created to help you explore different
          life situations and perspectives.
        </p>

        {error && (
          <p className="mt-5 rounded-lg border border-[color:var(--rule)] p-4 text-sm">{error}</p>
        )}

        {!finished && scene && (
          <section className="mt-8 rounded-2xl border border-[color:var(--rule)] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">
                Scene {scene.number} of {total}
              </div>
              <div className="flex items-center gap-1" aria-hidden>
                {detail.scenes.map((s, i) => (
                  <span key={s.id} className="flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        i <= index
                          ? "bg-[color:var(--royal)]"
                          : "border border-[color:var(--rule)]"
                      }`}
                    />
                    {i < total - 1 && <span className="h-px w-4 bg-[color:var(--rule)]" />}
                  </span>
                ))}
              </div>
            </div>

            {paused ? (
              <p className="mt-6 text-sm text-[color:var(--muted-foreground)]">
                The story is paused here. It will be waiting when you come back.
              </p>
            ) : (
              <>
                <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-[color:var(--rule)] p-5 sm:flex-row sm:items-center sm:gap-6">
                  <AnimatedCharacter
                    key={scene.id}
                    avatarKey={detail.character.avatarKey}
                    name={detail.character.name}
                    state={scene.characterState}
                    environment={scene.environment}
                    animation={scene.animation}
                    size={132}
                  />
                  <div className="text-center sm:text-left">
                    {!scene.environment && !scene.narration && (
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {detail.character.name} is with you in this scene.
                      </p>
                    )}
                    {scene.environment && (
                      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                        {scene.environment}
                      </div>
                    )}
                    {scene.narration && (
                      <p className="mt-2 text-[15px] italic leading-relaxed text-[color:var(--muted-foreground)]">
                        {scene.narration}
                      </p>
                    )}
                  </div>
                </div>
                <article className="mt-6 text-[16px] leading-relaxed">
                  {scene.body}
                </article>
              </>
            )}

            {!paused &&
              scene.questions.map((q) => {
                const current = answers[q.id] ?? { optionId: null, freeText: "" };
                return (
                  <div key={q.id} className="mt-8 border-t border-[color:var(--rule)] pt-6">
                    <p className="text-[15px] leading-relaxed">{q.prompt}</p>
                    <div className="mt-4 space-y-2">
                      {q.options.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => answer(q.id, o.id, current.freeText)}
                          className={`block w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                            current.optionId === o.id
                              ? "border-[color:var(--royal)] bg-[color:var(--royal)]/[0.06]"
                              : "border-[color:var(--rule)] hover:bg-[color:var(--ink)]/[0.03]"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    {q.allowFreeText && (
                      <label className="mt-4 block">
                        <span className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                          {q.freeTextLabel} (optional)
                        </span>
                        <textarea
                          value={current.freeText}
                          onChange={(e) =>
                            setAnswers((a) => ({
                              ...a,
                              [q.id]: { optionId: current.optionId, freeText: e.target.value },
                            }))
                          }
                          onBlur={(e) => answer(q.id, current.optionId, e.target.value)}
                          rows={3}
                          className="mt-2 w-full rounded-lg border border-[color:var(--rule)] bg-transparent p-3 text-sm"
                        />
                      </label>
                    )}
                    <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
                      There is no right answer here, and nothing you choose is judged.
                    </p>
                  </div>
                );
              })}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[color:var(--rule)] pt-6">
              <button
                onClick={() => go(-1)}
                disabled={index === 0}
                className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--ink)] px-5 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] disabled:opacity-40"
              >
                Back
              </button>
              {last ? (
                <button
                  onClick={() => {
                    setFinished(true);
                    persist(index, "completed");
                  }}
                  className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 text-sm text-[color:var(--paper)] transition hover:opacity-90"
                >
                  Finish story
                </button>
              ) : (
                <button
                  onClick={() => go(1)}
                  className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 text-sm text-[color:var(--paper)] transition hover:opacity-90"
                >
                  Next
                </button>
              )}
              <button
                onClick={() => {
                  const next = !paused;
                  setPaused(next);
                  persist(index, next ? "paused" : "in_progress");
                }}
                className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--rule)] px-5 text-sm"
              >
                {paused ? "Resume story" : "Pause story"}
              </button>
              <Link
                to="/people-like-me"
                onClick={() => persist(index, paused ? "paused" : "in_progress")}
                className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--rule)] px-5 text-sm"
              >
                Exit
              </Link>
            </div>
          </section>
        )}

        {finished && (
          <section className="mt-8 rounded-2xl border border-[color:var(--rule)] p-6 md:p-8">
            <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Reflection</div>
            <h2 className="font-display mt-3 text-2xl leading-tight">
              Did any part of {detail.character.name}'s situation feel familiar?
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {FAMILIARITY.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFamiliarity(f.value)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    familiarity === f.value
                      ? "border-[color:var(--royal)] bg-[color:var(--royal)]/[0.06]"
                      : "border-[color:var(--rule)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <label className="mt-6 block">
              <span className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                What felt similar? (optional)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-[color:var(--rule)] bg-transparent p-3 text-sm"
              />
            </label>

            <div className="mt-6">
              <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                Shared themes
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {detail.themes.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[color:var(--royal)]/40 bg-[color:var(--royal)]/[0.05] px-3 py-1 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                disabled={!familiarity}
                onClick={() => {
                  if (!familiarity) return;
                  void saveReflection({
                    data: {
                      scenarioId: detail.scenario.id,
                      familiarity: familiarity as (typeof FAMILIARITY)[number]["value"],
                      note,
                      sceneCount: total,
                    },
                  })
                    .then(() => setSaved(true))
                    .catch((e: unknown) =>
                      setError(e instanceof Error ? e.message : "Something went wrong."),
                    );
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 text-sm text-[color:var(--paper)] transition hover:opacity-90 disabled:opacity-40"
              >
                Save reflection
              </button>
              <button
                onClick={() => {
                  setFinished(false);
                  setIndex(0);
                  persist(0, "in_progress");
                }}
                className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--rule)] px-5 text-sm"
              >
                Read again
              </button>
              <Link to="/people-like-me" className="text-sm underline">
                Back to People Like Me
              </Link>
              {saved && (
                <span className="text-xs text-[color:var(--muted-foreground)]">
                  Saved, only you can see this.
                </span>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
