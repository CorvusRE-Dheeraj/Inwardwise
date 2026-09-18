import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Download,
  Loader2,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
} from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { CrisisNotice } from "@/components/CrisisNotice";
import { DecisionIntro } from "@/components/decision/DecisionIntro";
import { SevenStagePanel } from "@/components/decision/SevenStagePanel";

import { FormattedText } from "@/components/FormattedText";
import { JourneyProgress } from "@/components/decision/JourneyProgress";
import { TOTAL_STAGES, journeyStage } from "@/lib/decision-journey";
import { detectCrisisInMessages } from "@/lib/crisis-detect";
import { parseStageTag, stripStageTag } from "@/lib/ooi-stages";
import {
  CATEGORIES,
  deriveTitle,
  extractText,
  getSession,
  loadSessions,
  newSession,
  saveSession,
  type DecisionSession,
} from "@/lib/ooi-storage";
import { startRecording, synthesizeSpeech, transcribe, type Recorder } from "@/lib/voice";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/_authenticated/decision")({
  head: () => ({
    meta: [
      { title: "New Decision, Objective Solution Framework" },
      {
        name: "description",
        content:
          "A conversational facilitator that walks you through the 7-stage Objective Solution Framework before any recommendation is given.",
      },
    ],
  }),
  validateSearch: searchSchema,
  component: DecisionChat,
});

const STARTERS = [
  "I'm considering leaving my job to start a company.",
  "My marriage is at a crossroads and I don't know what to do.",
  "Should we buy a house now or keep renting?",
  "A close friend's behavior is affecting me and I'm unsure how to respond.",
];

function DecisionChat() {
  const { id: routeId } = useSearch({ from: "/_authenticated/decision" });

  const [session, setSession] = useState<DecisionSession>(() => {
    if (typeof window !== "undefined" && routeId) {
      const existing = getSession(routeId);
      if (existing) return existing;
    }
    return newSession();
  });

  const [category, setCategory] = useState(session.category);

  // Orientation screen shown before the conversation begins (presentation only).
  const [started, setStarted] = useState(
    () => Boolean(routeId) && ((session.messages?.length ?? 0) > 0 || Boolean(session.started)),
  );
  const [resumable, setResumable] = useState<DecisionSession | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);
  const prevStageRef = useRef(1);
  const [input, setInput] = useState(session.draft ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);

  const { messages, sendMessage, status, stop, regenerate, setMessages } = useChat({
    id: session.id,
    messages: session.messages,
    transport: useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []),
  });

  // Restore exactly where the person left off. Runs once on the client, after
  // hydration, so a session opened by URL (or reloaded mid-wizard) comes back
  // with its messages, stage, category and unsent draft intact.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = routeId ? getSession(routeId) : null;
    if (saved) {
      setSession(saved);
      setCategory(saved.category);
      if (saved.messages.length) setMessages(saved.messages);
      setInput(saved.draft ?? "");
      prevStageRef.current = saved.stage;
      setStarted(saved.messages.length > 0 || Boolean(saved.started));
      requestAnimationFrame(() =>
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight }),
      );
      return;
    }
    const unfinished = loadSessions().find((s) => s.messages.length > 0 && s.stage < TOTAL_STAGES);
    setResumable(unfinished ?? null);
  }, [routeId, setMessages]);

  // Track current stage from the latest assistant message's [STAGE: n] tag.
  const currentStage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== "assistant") continue;
      const n = parseStageTag(extractText(m));
      if (n) return n;
    }
    return 1;
  }, [messages]);

  // Quiet milestone when a stage is left behind. Display only.
  useEffect(() => {
    if (currentStage > prevStageRef.current) {
      const note = journeyStage(currentStage - 1).milestone;
      prevStageRef.current = currentStage;
      if (note) {
        setMilestone(note);
        const t = setTimeout(() => setMilestone(null), 9000);
        return () => clearTimeout(t);
      }
    }
    prevStageRef.current = Math.max(prevStageRef.current, currentStage);
  }, [currentStage]);

  // Step 7 → Step 8 completes on its own. Once the facilitator reaches step 7
  // the person never types again: if a facilitator reply still ends inside
  // step 7 instead of carrying the Action Stage with it, send one automatic
  // "continue" so the journey moves to the final step without prompt input.
  const autoAdvanceTriesRef = useRef(0);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  useEffect(() => {
    if (status !== "ready" || !started) return;
    if (currentStage < 7 || currentStage >= TOTAL_STAGES) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (autoAdvanceTriesRef.current >= 2) return;
    autoAdvanceTriesRef.current += 1;
    setAutoAdvancing(true);
    const t = setTimeout(() => {
      setAutoAdvancing(false);
      sendMessage({ text: "Please continue to the next step." });
    }, 1200);
    return () => {
      clearTimeout(t);
      setAutoAdvancing(false);
    };
  }, [status, started, currentStage, messages, sendMessage]);

  // Deterministic safety net: surface hotlines whenever the person describes a crisis.
  const crisisCategories = useMemo(
    () =>
      detectCrisisInMessages(messages.filter((m) => m.role === "user").map((m) => extractText(m))),
    [messages],
  );

  // Single source of truth for what gets persisted at any moment.
  const snapshot = (): DecisionSession => ({
    ...session,
    category,
    stage: currentStage,
    title: deriveTitle(messages) || session.title,
    messages,
    draft: input,
    started,
    updatedAt: Date.now(),
  });
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  // Autosave on every wizard step: new messages, stage changes, category,
  // starting the journey, and the unsent draft the person is typing.
  useEffect(() => {
    if (!started && messages.length === 0 && !input) return;
    const t = setTimeout(() => {
      const next = snapshotRef.current();
      saveSession(next);
      setSession(next);
      // Update URL with id so it's shareable/resumable.
      if (typeof window !== "undefined" && !routeId) {
        const url = new URL(window.location.href);
        url.searchParams.set("id", next.id);
        window.history.replaceState(null, "", url);
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, category, currentStage, started, input]);

  // Flush the latest state when the tab is hidden or closed, so nothing typed
  // in the last moment is lost.
  useEffect(() => {
    const flush = () => {
      const s = snapshotRef.current();
      if (s.messages.length === 0 && !s.draft && !s.started) return;
      saveSession(s);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);


  const isBusy = status === "streaming" || status === "submitted";

  // Voice input.
  const recorderRef = useRef<Recorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const toggleRecording = async () => {
    setVoiceError(null);
    if (isRecording && recorderRef.current) {
      const rec = recorderRef.current;
      recorderRef.current = null;
      setIsRecording(false);
      setIsTranscribing(true);
      try {
        const blob = await rec.stop();
        const text = await transcribe(blob);
        if (text.trim()) {
          // Auto-send the transcribed message so the exchange stays conversational.
          sendMessage({ text: text.trim() });
        }
      } catch (err) {
        setVoiceError(err instanceof Error ? err.message : "Voice input failed.");
      } finally {
        setIsTranscribing(false);
      }
      return;
    }
    try {
      const rec = await startRecording();
      recorderRef.current = rec;
      setIsRecording(true);
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : "Microphone access was denied.");
    }
  };

  const submit = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isBusy) return;
    setInput("");
    sendMessage({ text: value });
  };

  const resetConversation = () => {
    recorderRef.current?.cancel();
    recorderRef.current = null;
    setIsRecording(false);
    const fresh = newSession(category);
    setSession(fresh);
    setMessages([]);
    setStarted(false);
    setInput("");
    prevStageRef.current = 1;
    autoAdvanceTriesRef.current = 0;
    setMilestone(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.replaceState(null, "", url);
    }
  };

  // Save & continue later, uses the same persistence as the autosave.
  const saveAndContinueLater = () => {
    const next = snapshotRef.current();
    saveSession(next);
    setSession(next);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 6000);
  };

  const resumeSession = (s: DecisionSession) => {
    setSession(s);
    setCategory(s.category);
    setMessages(s.messages);
    setInput(s.draft ?? "");
    prevStageRef.current = s.stage;
    setStarted(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("id", s.id);
      window.history.replaceState(null, "", url);

    }
  };

  const downloadSession = async () => {
    const { jsPDF } = await import("jspdf");
    const title = deriveTitle(messages) || session.title;
    const dateStr = new Date(session.updatedAt).toLocaleString();

    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 54;
    const maxW = pageW - margin * 2;
    let y = margin;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };
    const writeBlock = (
      text: string,
      opts: {
        size?: number;
        style?: "normal" | "bold" | "italic";
        color?: [number, number, number];
        gap?: number;
      } = {},
    ) => {
      const { size = 11, style = "normal", color = [30, 30, 30], gap = 6 } = opts;
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, maxW) as string[];
      const lineH = size * 1.35;
      for (const line of lines) {
        ensureSpace(lineH);
        doc.text(line, margin, y);
        y += lineH;
      }
      y += gap;
    };

    writeBlock(title, { size: 20, style: "bold", gap: 8 });
    writeBlock(`Category: ${category}`, { size: 10, color: [110, 110, 110], gap: 2 });
    writeBlock(`Saved: ${dateStr}`, { size: 10, color: [110, 110, 110], gap: 12 });
    ensureSpace(2);
    doc.setDrawColor(210);
    doc.line(margin, y, pageW - margin, y);
    y += 16;

    messages.forEach((m, i) => {
      const raw = extractText(m).trim();
      if (!raw) return;
      if (m.role === "assistant") {
        writeBlock("Facilitator", { size: 12, style: "bold", color: [20, 90, 190], gap: 4 });
        writeBlock(stripStageTag(raw), { size: 11, gap: 12 });
      } else {
        writeBlock(`You`, { size: 12, style: "bold", color: [40, 40, 40], gap: 4 });
        writeBlock(raw, { size: 11, gap: 12 });
      }
    });

    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`${p} / ${total}`, pageW - margin, pageH - 24, { align: "right" });
      doc.text("InwardWise, Objective Solution Framework", margin, pageH - 24);
    }

    const safe =
      title
        .replace(/[^a-z0-9\-_. ]/gi, "")
        .slice(0, 60)
        .trim() || "decision-session";
    doc.save(`${safe}.pdf`);
  };

  const canDownload = currentStage >= 8;

  return (
    <AppShell>
      <div className="mx-auto w-[min(1280px,calc(100%-2rem))] py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Facilitated by AI · 7 Stage Decision Intelligence Philosophy
          </p>
          <h1 className="font-display mt-1 text-3xl md:text-4xl">Structured decision session</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="glass rounded-full border border-glass-border bg-transparent px-3 py-1.5 text-xs text-foreground"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-background">
                {c}
              </option>
            ))}
          </select>
          {canDownload && (
            <button
              onClick={downloadSession}
              className="glass inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-3 py-1.5 text-xs text-accent hover:bg-accent/10"
              title="Download full session (all 8 stages)"
            >
              <Download className="h-3.5 w-3.5" /> Download session
            </button>
          )}
          <button
            onClick={resetConversation}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      <div className={started ? "grid gap-6 lg:grid-cols-[260px_1fr]" : "grid gap-8 lg:grid-cols-[1fr_1fr]"}>
        {!started && (
          <div className="order-2 lg:order-1">
            <SevenStagePanel />
          </div>
        )}
        {started && (
          <>
            {/* Desktop: sticky left sidebar, stays visible while the chat scrolls */}
            <div className="hidden lg:block">
              <aside className="glass-strong sticky top-24 h-fit rounded-3xl">
                <JourneyProgress current={currentStage} vertical />
                <p className="mx-4 mb-4 rounded-xl border border-glass-border bg-foreground/[0.02] p-3 text-[10px] leading-relaxed text-muted-foreground">
                  The facilitator asks 2 to 5 questions per stage and waits for your confirmation
                  before advancing. After step 7 the session completes on its own — no further
                  answers are needed, and the final step is yours to download.
                </p>
              </aside>
            </div>
            {/* Mobile: compact bar pinned to the top of the viewport */}
            <div className="glass-strong sticky top-16 z-20 -mx-1 rounded-2xl lg:hidden">
              <JourneyProgress current={currentStage} />
            </div>
          </>
        )}

        <div className={`glass-strong flex min-h-[600px] flex-col overflow-hidden rounded-3xl ${started ? "" : "order-1 lg:order-2"}`}>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
            <CrisisNotice categories={crisisCategories} />
            {!started ? (
              <DecisionIntro
                onStart={() => setStarted(true)}
                resumable={resumable}
                onResume={resumeSession}
              />
            ) : messages.length === 0 ? (
              <EmptyIntro onPick={submit} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble key={m.id} m={m} />
                ))}
              </AnimatePresence>
            )}
            {milestone && messages.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="status"
                className="text-center text-[11px] text-muted-foreground"
              >
                ✓ {milestone}
              </motion.p>
            )}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Facilitator is thinking…
              </div>
            )}
            {autoAdvancing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Moving to the Action Stage…
              </div>
            )}
            {canDownload && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong mt-4 rounded-2xl border border-accent/40 p-5 text-center"
              >
                <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-accent">
                  Decision Making Completed
                </div>
                <h3 className="font-display text-xl">Your decision session is ready</h3>
                <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
                  Nothing more to answer. The final stage, the Action Stage, is yours to work
                  through on your own: use the sub-objectives above to find each answer. Download
                  the full transcript, every stage's questions, your answers, and the facilitator's
                  recommendation.
                </p>
                <button
                  onClick={downloadSession}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" /> Download whole session (PDF)
                </button>
              </motion.div>
            )}
          </div>

          {started && currentStage < 7 && (
          <div className="border-t border-glass-border p-3 md:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="glass flex items-end gap-2 rounded-2xl p-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder={
                  isRecording
                    ? "Listening…"
                    : isTranscribing
                      ? "Transcribing…"
                      : messages.length === 0
                        ? "Describe the situation you are facing"
                        : "Reply to the facilitator. Enter to send, Shift+Enter for new line."
                }
                rows={2}
                className="min-h-10 max-h-48 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground caret-accent outline-none placeholder:text-accent/70"
              />
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isBusy || isTranscribing}
                aria-label={isRecording ? "Stop recording" : "Speak"}
                title={isRecording ? "Stop recording" : "Speak"}
                className={`grid h-10 w-10 place-items-center rounded-xl transition disabled:opacity-40 ${
                  isRecording
                    ? "bg-accent text-background animate-pulse"
                    : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                }`}
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
              {isBusy ? (
                <button
                  type="button"
                  onClick={stop}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-foreground/10 text-foreground transition hover:bg-foreground/20"
                  aria-label="Stop"
                >
                  <Square className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background transition hover:opacity-90 disabled:opacity-40"
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </form>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                {voiceError
                  ? voiceError
                  : "Autosaved locally · Speak or type. The facilitator will not recommend until all 8 stages complete."}
              </span>
              <div className="flex items-center gap-3">
                {messages.length > 0 && (
                  <button onClick={saveAndContinueLater} className="min-h-8 hover:text-foreground">
                    Save &amp; Continue Later
                  </button>
                )}
                {messages.length > 0 && (
                  <button
                    onClick={() => regenerate()}
                    disabled={isBusy}
                    className="hover:text-foreground disabled:opacity-40"
                  >
                    Regenerate last
                  </button>
                )}
              </div>
            </div>
            {savedNote && (
              <p role="status" className="mt-2 text-[10px] text-accent">
                Your progress has been saved. You can return and continue your Decision journey
                later.
              </p>
            )}
          </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-[10px] text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">
          View all decision sessions →
        </Link>
      </div>
      </div>
    </AppShell>
  );
}


function MessageBubble({ m }: { m: UIMessage }) {
  const raw = extractText(m);
  const isUser = m.role === "user";
  const text = !isUser ? stripStageTag(raw) : raw;

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audio?.pause();
      if (audio) URL.revokeObjectURL(audio.src);
    };
  }, [audio]);

  const togglePlayback = async () => {
    setTtsError(null);
    if (audio && isPlaying) {
      audio.pause();
      return;
    }
    if (audio) {
      audio.play().catch(() => setTtsError("Playback failed."));
      return;
    }
    setIsLoading(true);
    try {
      const blob = await synthesizeSpeech(text);
      const url = URL.createObjectURL(blob);
      const el = new Audio(url);
      el.onplay = () => setIsPlaying(true);
      el.onpause = () => setIsPlaying(false);
      el.onended = () => setIsPlaying(false);
      setAudio(el);
      await el.play();
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : "Playback failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-foreground text-background"
              : "border border-glass-border bg-background/40 text-foreground"
          }`}
        >
          <FormattedText text={text} />
          {!isUser && text.trim().length > 0 && (
            <div className="mt-3 flex items-center gap-2 border-t border-glass-border pt-2 text-[10px] text-muted-foreground">
              <button
                type="button"
                onClick={togglePlayback}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-glass-border px-2.5 py-1 transition hover:bg-foreground/5 disabled:opacity-40"
                aria-label={isPlaying ? "Pause playback" : "Play aloud"}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                {isPlaying ? "Pause" : "Play aloud"}
              </button>
              {ttsError && <span className="text-destructive/80">{ttsError}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyIntro({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="mx-auto max-w-xl py-8 text-center">
      <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Not a Chatbot · A Decision Intelligence Philosophy
      </div>
      <h2 className="font-display mt-4 text-2xl md:text-3xl">
        Describe the situation you are facing
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Speak or type. The facilitator will not answer directly. It will guide you through 8 stages, starting with facts, never with recommendations.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="glass rounded-2xl px-4 py-3 text-left text-sm text-foreground transition hover:bg-foreground/5"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-5 text-center">
        <Link
          to="/examples"
          className="inline-flex items-center gap-1 text-[11px] tracking-wide text-muted-foreground transition hover:text-accent"
        >
          Browse example sessions →
        </Link>
      </div>
      <h3 className="font-display mt-10 text-2xl leading-tight text-accent md:text-3xl">
        Your confidentiality is never compromised!
        <br />
        That's our promise!
      </h3>
    </div>
  );
}
