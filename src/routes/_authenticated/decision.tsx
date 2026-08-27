import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Download,
  Loader2,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sparkles,
} from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { CrisisNotice } from "@/components/CrisisNotice";
import { DecisionIntro } from "@/components/decision/DecisionIntro";
import { JourneyProgress } from "@/components/decision/JourneyProgress";
import { TOTAL_STAGES, journeyStage } from "@/lib/decision-journey";
import { detectCrisisInMessages } from "@/lib/crisis-detect";
import { STAGES, parseStageTag, stripStageTag } from "@/lib/ooi-stages";
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
      { title: "New Decision — Objective Solution Framework" },
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
    () => Boolean(routeId) && (session.messages?.length ?? 0) > 0,
  );
  const [resumable, setResumable] = useState<DecisionSession | null>(null);
  const [savedNote, setSavedNote] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);
  const prevStageRef = useRef(1);

  useEffect(() => {
    if (routeId) return;
    const unfinished = loadSessions().find(
      (s) => s.messages.length > 0 && s.stage < TOTAL_STAGES,
    );
    setResumable(unfinished ?? null);
  }, [routeId]);


  const { messages, sendMessage, status, stop, regenerate, setMessages } = useChat({
    id: session.id,
    messages: session.messages,
    transport: useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []),
  });

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

  // Deterministic safety net: surface hotlines whenever the person describes a crisis.
  const crisisCategories = useMemo(
    () =>
      detectCrisisInMessages(
        messages.filter((m) => m.role === "user").map((m) => extractText(m)),
      ),
    [messages],
  );

  // Autosave.
  useEffect(() => {
    const t = setTimeout(() => {
      const next: DecisionSession = {
        ...session,
        category,
        stage: currentStage,
        title: deriveTitle(messages) || session.title,
        messages,
        updatedAt: Date.now(),
      };
      saveSession(next);
      setSession(next);
      // Update URL with id so it's shareable/resumable.
      if (typeof window !== "undefined" && !routeId) {
        const url = new URL(window.location.href);
        url.searchParams.set("id", next.id);
        window.history.replaceState(null, "", url);
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, category, currentStage]);

  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
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
      setVoiceError(
        err instanceof Error ? err.message : "Microphone access was denied.",
      );
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
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.replaceState(null, "", url);
    }
  };

  const downloadSession = async () => {
    const { jsPDF } = await import("jspdf");
    const stageAt = (idx: number) => {
      for (let i = idx; i >= 0; i--) {
        const msg = messages[i];
        if (msg.role === "assistant") {
          const n = parseStageTag(extractText(msg));
          if (n) return n;
        }
      }
      return null;
    };
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
      opts: { size?: number; style?: "normal" | "bold" | "italic"; color?: [number, number, number]; gap?: number } = {},
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
        const n = parseStageTag(raw) ?? stageAt(i);
        const stage = n ? STAGES.find((s) => s.n === n) : null;
        const header = stage ? `Stage ${stage.n} — ${stage.name} · Facilitator` : `Facilitator`;
        writeBlock(header, { size: 12, style: "bold", color: [20, 90, 190], gap: 4 });
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
      doc.text("InwardWise — Objective Solution Framework", margin, pageH - 24);
    }

    const safe = title.replace(/[^a-z0-9\-_. ]/gi, "").slice(0, 60).trim() || "decision-session";
    doc.save(`${safe}.pdf`);
  };


  const canDownload = currentStage >= 8;

  return (
    <AppShell>
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

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <StageRail current={currentStage} />

        <div className="glass-strong flex min-h-[600px] flex-col overflow-hidden rounded-3xl">
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
            <CrisisNotice categories={crisisCategories} />
            {messages.length === 0 ? (
              <EmptyIntro onPick={submit} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble key={m.id} m={m} />
                ))}
              </AnimatePresence>
            )}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Facilitator is thinking…
              </div>
            )}
            {canDownload && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong mt-4 rounded-2xl border border-accent/40 p-5 text-center"
              >
                <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-accent">
                  All 8 stages complete
                </div>
                <h3 className="font-display text-xl">Your decision session is ready</h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                  Download the full transcript — every stage's questions, your answers, and the facilitator's recommendation.
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
        </div>
      </div>

      <div className="mt-4 text-center text-[10px] text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">
          View all decision sessions →
        </Link>
      </div>
    </AppShell>
  );
}

function StageRail({ current }: { current: number }) {
  return (
    <aside className="glass sticky top-24 h-fit rounded-3xl p-4">
      <div className="mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-accent" /> 8-Step progress
      </div>
      <ol className="space-y-1.5">
        {STAGES.map((s) => {
          const done = s.n < current;
          const active = s.n === current;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs transition ${
                active ? "bg-foreground/5" : ""
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                  done
                    ? "bg-accent text-background"
                    : active
                      ? "bg-foreground text-background"
                      : "bg-foreground/5 text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : s.n}
              </span>
              <span className={active ? "font-medium text-foreground" : "text-foreground/80"}>
                Step {s.n}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 rounded-xl border border-glass-border bg-foreground/[0.02] p-3 text-[10px] leading-relaxed text-muted-foreground">
        The facilitator asks 2–5 questions per stage and waits for your confirmation before advancing. Recommendations only come after Stage 8.
      </p>
    </aside>
  );
}

function MessageBubble({ m }: { m: UIMessage }) {
  const raw = extractText(m);
  const isUser = m.role === "user";
  const stageN = !isUser ? parseStageTag(raw) : null;
  const text = !isUser ? stripStageTag(raw) : raw;
  const stage = stageN ? STAGES.find((s) => s.n === stageN) : null;

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
        {stage && (
          <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-accent">
            <span className="h-1 w-1 rounded-full bg-accent" />
            Stage {stage.n} · {stage.name}
          </div>
        )}
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

// Lightweight markdown-ish renderer: paragraphs, bullets, numbered lists, bold.
function FormattedText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isBulleted = lines.every((l) => /^\s*[-•*]\s+/.test(l));
        const isNumbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (isBulleted) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (isNumbered) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}

function inline(s: string): React.ReactNode {
  // Bold **text** support.
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
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
        Speak or type. The facilitator will not answer directly. It will guide you through 8 stages —
        starting with facts, never with recommendations.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="glass rounded-2xl px-4 py-3 text-left text-sm text-foreground/90 transition hover:bg-foreground/5"
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
