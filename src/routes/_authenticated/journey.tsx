import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { FREQUENCY_OPTIONS, NEUTRAL_FALLBACK, isCompletionPhrase } from "@/lib/journey";
import {
  askAboutSection,
  getJourneyState,
  respondToSection,
  startSection,
  updateJourneyPreferences,
  type JourneyStateResult,
} from "@/lib/journey.functions";

export const Route = createFileRoute("/_authenticated/journey")({
  head: () => ({
    meta: [
      { title: "My Journey, small experiences chosen for you | InwardWise" },
      {
        name: "description",
        content:
          "A personal reading journey that moves one section at a time, at your pace, with your own controls over what is used to choose it.",
      },
      { property: "og:title", content: "My Journey | InwardWise" },
      {
        property: "og:description",
        content: "Small experiences, thoughtfully chosen for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JourneyPage,
});

type Msg = { role: "you" | "guide"; text: string };

function JourneyPage() {
  const load = useServerFn(getJourneyState);
  const open = useServerFn(startSection);
  const respond = useServerFn(respondToSection);
  const ask = useServerFn(askAboutSection);
  const savePrefs = useServerFn(updateJourneyPreferences);

  const [state, setState] = useState<JourneyStateResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<Msg[]>([]);
  const [showWhy, setShowWhy] = useState(false);
  const [showControls, setShowControls] = useState(false);

  async function refresh() {
    try {
      setState(await load({}));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percent = useMemo(() => {
    if (!state || state.progress.total === 0) return 0;
    return Math.round((state.progress.completed / state.progress.total) * 100);
  }, [state]);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setThread([]);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function submitQuestion() {
    const text = question.trim();
    if (!text || !state?.active) return;
    setQuestion("");
    if (isCompletionPhrase(text)) {
      await act(() => respond({ data: { itemId: state.active!.itemId, action: "complete" } }));
      return;
    }
    setThread((t) => [...t, { role: "you", text }]);
    setBusy(true);
    try {
      const res = await ask({ data: { itemId: state.active.itemId, question: text } });
      if (res.completed) {
        await act(() => respond({ data: { itemId: state.active!.itemId, action: "complete" } }));
        return;
      }
      setThread((t) => [...t, { role: "guide", text: res.answer ?? "" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-12 md:py-16">
        <header className="max-w-3xl">
          <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            My Journey · Reading
          </div>
          <h1 className="font-display mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.05] tracking-tight">
            My Journey
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[color:var(--muted-foreground)]">
            Small experiences, thoughtfully chosen for you.
          </p>
          <Link
            to="/people-like-me"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--ink)] px-5 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
          >
            People Like Me <span aria-hidden>→</span>
          </Link>
        </header>

        {error && (
          <p className="mt-6 rounded-lg border border-[color:var(--rule)] bg-[color:var(--ink)]/[0.03] p-4 text-sm">
            {error}
          </p>
        )}

        {!state ? (
          <p className="mt-10 text-sm text-[color:var(--muted-foreground)]">Loading your journey…</p>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              {state.libraryEmpty && (
                <Panel title="Nothing in the library yet">
                  <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                    No approved reading has been added yet, so nothing is being recommended. Once
                    approved book sections are loaded, your journey starts here, one section at a
                    time.
                  </p>
                </Panel>
              )}

              {state.active && (
                <Panel
                  title={state.active.state === "PAUSED" ? "Paused reading" : "Today's reading"}
                  meta={`${state.active.section.estimated_minutes} min · Chapter ${state.active.section.chapterNumber}, Section ${state.active.section.number}`}
                >
                  <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                    {state.active.section.bookTitle}
                    {state.active.section.source_locator
                      ? ` · ${state.active.section.source_locator}`
                      : ""}
                  </div>
                  <h2 className="font-display mt-2 text-2xl leading-tight">
                    {state.active.section.title}
                  </h2>

                  {state.active.reminderDue && (
                    <p className="mt-4 rounded-lg bg-[color:var(--royal)]/10 p-3 text-sm text-[color:var(--ink)]">
                      You still have this short reading waiting for you. Would you like to continue?
                    </p>
                  )}

                  {state.active.state === "PAUSED" ? (
                    <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
                      Your journey is paused here. Nothing new will be sent until you continue.
                    </p>
                  ) : (
                    <article className="mt-5 space-y-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[color:var(--ink)]">
                      {state.active.section.content}
                    </article>
                  )}

                  {thread.length > 0 && (
                    <div className="mt-6 space-y-3 border-t border-[color:var(--rule)] pt-4">
                      {thread.map((m, i) => (
                        <p
                          key={i}
                          className={
                            m.role === "you"
                              ? "text-sm text-[color:var(--ink)]"
                              : "text-sm leading-relaxed text-[color:var(--muted-foreground)]"
                          }
                        >
                          <span className="font-mono-cap mr-2 text-[10px]">
                            {m.role === "you" ? "YOU" : "GUIDE"}
                          </span>
                          {m.text}
                        </p>
                      ))}
                    </div>
                  )}

                  {state.active.state !== "PAUSED" && (
                    <div className="mt-6 border-t border-[color:var(--rule)] pt-5">
                      <label className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                        Ask a question about this section
                      </label>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void submitQuestion();
                          }}
                          placeholder="What does this mean in practice?"
                          className="min-h-11 flex-1 rounded-full border border-[color:var(--rule)] px-4 text-sm"
                        />
                        <button
                          onClick={() => void submitQuestion()}
                          disabled={busy}
                          className="min-h-11 rounded-full border border-[color:var(--ink)] px-5 text-sm disabled:opacity-50"
                        >
                          Ask
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                        Asking a question keeps this section open. Nothing new arrives until you
                        confirm you have read it.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 border-t border-[color:var(--rule)] pt-5">
                    <p className="text-sm text-[color:var(--ink)]">Ready for the next section?</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {state.active.state === "PAUSED" ? (
                        <Btn
                          primary
                          disabled={busy}
                          onClick={() =>
                            void act(() =>
                              respond({ data: { itemId: state.active!.itemId, action: "resume" } }),
                            )
                          }
                        >
                          Continue
                        </Btn>
                      ) : (
                        <Btn
                          primary
                          disabled={busy}
                          onClick={() =>
                            void act(() =>
                              respond({ data: { itemId: state.active!.itemId, action: "complete" } }),
                            )
                          }
                        >
                          Mark as read
                        </Btn>
                      )}
                      <Btn
                        disabled={busy}
                        onClick={() =>
                          void act(() =>
                            respond({ data: { itemId: state.active!.itemId, action: "pause" } }),
                          )
                        }
                      >
                        Pause journey
                      </Btn>
                      <Btn
                        disabled={busy}
                        onClick={() =>
                          void act(() =>
                            respond({ data: { itemId: state.active!.itemId, action: "skip" } }),
                          )
                        }
                      >
                        Skip
                      </Btn>
                    </div>
                  </div>
                </Panel>
              )}

              {!state.active && state.recommendation && (
                <Panel
                  title="Today's reading"
                  meta={`${state.recommendation.estimatedMinutes} min`}
                >
                  <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                    {state.recommendation.bookTitle} · Chapter {state.recommendation.chapterNumber},{" "}
                    {state.recommendation.chapterTitle} · Section {state.recommendation.sectionNumber}
                    {state.recommendation.sourceLocator
                      ? ` · ${state.recommendation.sourceLocator}`
                      : ""}
                  </div>
                  <h2 className="font-display mt-2 text-2xl leading-tight">
                    {state.recommendation.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                    {state.recommendation.relevanceNote}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Btn
                      primary
                      disabled={busy}
                      onClick={() =>
                        void act(() =>
                          open({
                            data: {
                              sectionId: state.recommendation!.sectionId,
                              relevanceNote: state.recommendation!.relevanceNote,
                            },
                          }),
                        )
                      }
                    >
                      Start reading
                    </Btn>
                    <Btn disabled={busy} onClick={() => setShowControls(true)}>
                      Choose another topic
                    </Btn>
                    <Btn disabled={busy} onClick={() => setShowWhy((v) => !v)}>
                      Why this?
                    </Btn>
                  </div>
                  {showWhy && (
                    <p className="mt-4 rounded-lg border border-[color:var(--rule)] p-4 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                      {state.recommendation.relevanceNote} Nothing private is used to explain a
                      choice, and you can turn personalisation off at any time.
                    </p>
                  )}
                </Panel>
              )}

              {!state.active && !state.recommendation && !state.libraryEmpty && (
                <Panel title={NEUTRAL_FALLBACK.title}>
                  <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                    {NEUTRAL_FALLBACK.body}
                  </p>
                  <div className="mt-4">
                    <Btn onClick={() => setShowControls(true)}>Choose a topic</Btn>
                  </div>
                </Panel>
              )}
            </div>

            <aside className="space-y-6">
              <Panel title="Continue your journey">
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {state.progress.completed} of {state.progress.total} sections read
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[color:var(--ink)]/10">
                  <div
                    className="h-full rounded-full bg-[color:var(--royal)] transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">{percent}%</p>
              </Panel>

              <Panel title="Your controls">
                <button
                  onClick={() => setShowControls((v) => !v)}
                  className="text-sm underline underline-offset-4"
                >
                  {showControls ? "Hide" : "Adjust what is used"}
                </button>
                {showControls && (
                  <div className="mt-4 space-y-4">
                    <label className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={state.preferences.personalization_enabled}
                        onChange={(e) =>
                          void act(() =>
                            savePrefs({ data: { personalization_enabled: e.target.checked } }),
                          )
                        }
                        className="mt-1"
                      />
                      <span>
                        Use what I have shared to choose readings. Turn this off and readings simply
                        follow the book order.
                      </span>
                    </label>

                    <div>
                      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                        How often
                      </div>
                      <select
                        value={state.preferences.frequency}
                        onChange={(e) => void act(() => savePrefs({ data: { frequency: e.target.value as "daily" } }))}
                        className="mt-2 min-h-10 w-full rounded-lg border border-[color:var(--rule)] px-3 text-sm"
                      >
                        {FREQUENCY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {state.topics.length > 0 && (
                      <div>
                        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                          Topics I want
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {state.topics.map((t) => {
                            const on = state.preferences.topics.includes(t);
                            return (
                              <button
                                key={t}
                                onClick={() =>
                                  void act(() =>
                                    savePrefs({
                                      data: {
                                        topics: on
                                          ? state.preferences.topics.filter((x) => x !== t)
                                          : [...state.preferences.topics, t],
                                      },
                                    }),
                                  )
                                }
                                className={`rounded-full border px-3 py-1 text-xs transition ${
                                  on
                                    ? "border-[color:var(--royal)] bg-[color:var(--royal)] text-white"
                                    : "border-[color:var(--rule)] text-[color:var(--muted-foreground)]"
                                }`}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <label className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={state.preferences.paused}
                        onChange={(e) => void act(() => savePrefs({ data: { paused: e.target.checked } }))}
                        className="mt-1"
                      />
                      <span>Pause my journey. Nothing new will be suggested.</span>
                    </label>
                  </div>
                )}
              </Panel>

              <Panel title="Coming next">
                <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                  Listen, Reflect and Explore join this journey later. Reading comes first, and the
                  rest is built on the same personal context.
                </p>
              </Panel>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[color:var(--rule)] p-6 md:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">{title}</div>
        {meta && (
          <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">{meta}</div>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Btn({
  children,
  onClick,
  primary,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        primary
          ? "inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 text-sm text-[color:var(--paper)] transition hover:opacity-90 disabled:opacity-50"
          : "inline-flex min-h-11 items-center rounded-full border border-[color:var(--ink)] px-5 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}
