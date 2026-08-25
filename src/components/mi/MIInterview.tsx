import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { miInterviewTurn } from "@/lib/mi.functions";
import { buildMiOpening, MI_MAX_ROUNDS } from "@/lib/mi-filter";
import { startRecording, transcribe, type Recorder } from "@/lib/voice";

export interface MIInterviewProps {
  /** The real question we need answered internally. */
  targetQuestion: string;
  /** Easy, non-threatening opening question shown first. */
  openingQuestion?: string;
  /** Framing context for the interviewer (factor intro, decision brief, …). */
  context?: string;
  /** Answer already captured before (resumes the panel). */
  initialAnswer?: string;
  /** Fires whenever the consolidated answer changes. */
  onCapture?: (answer: string) => void;
  /** Fires when the interviewer is satisfied, or the person moves on. */
  onComplete?: (answer: string) => void;
  completeLabel?: string;
}

type Turn = { role: "user" | "assistant"; content: string };

export function MIInterview({
  targetQuestion,
  openingQuestion,
  context,
  initialAnswer = "",
  onCapture,
  onComplete,
  completeLabel = "Continue",
}: MIInterviewProps) {
  const turnFn = useServerFn(miInterviewTurn);
  const opening = buildMiOpening({ targetQuestion, openingQuestion, context });

  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", content: opening }]);
  const [input, setInput] = useState("");
  const [round, setRound] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState(initialAnswer);
  const [satisfied, setSatisfied] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset when the target question changes (moving to the next question).
  useEffect(() => {
    setTurns([{ role: "assistant", content: opening }]);
    setInput("");
    setRound(1);
    setSatisfied(false);
    setCrisis(false);
    setError(null);
    setCaptured(initialAnswer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetQuestion]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: trimmed }];
    setTurns(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await turnFn({
        data: { targetQuestion, context, round, transcript: next },
      });
      setTurns([...next, { role: "assistant", content: res.reply }]);
      if (res.capturedAnswer.trim()) {
        setCaptured(res.capturedAnswer.trim());
        onCapture?.(res.capturedAnswer.trim());
      }
      setCrisis(res.crisis);
      setSatisfied(res.satisfied);
      setRound((r) => Math.min(MI_MAX_ROUNDS, r + 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setTurns(next);
    } finally {
      setBusy(false);
    }
  }

  async function toggleMic() {
    setError(null);
    if (recorder) {
      const rec = recorder;
      setRecorder(null);
      try {
        const blob = await rec.stop();
        const text = await transcribe(blob);
        if (text.trim()) await send(text);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Voice input failed.");
      }
      return;
    }
    try {
      setRecorder(await startRecording());
    } catch {
      setError("Microphone unavailable. You can type instead.");
    }
  }

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-[color:var(--rule)] bg-white/40 px-4 py-3 text-[13px] leading-relaxed text-justify text-[color:var(--muted-foreground)]">
        {MI_PRIVACY_NOTICE}
      </p>
      <div
        ref={scrollRef}
        className="max-h-[420px] space-y-4 overflow-y-auto rounded-lg border border-[color:var(--rule)] bg-white/60 p-5"
      >

        {turns.map((t, i) => (
          <div
            key={i}
            className={
              t.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-secondary px-4 py-3 text-sm"
                : "mr-auto max-w-[92%] rounded-lg border border-[color:var(--rule)] bg-white px-4 py-3 text-sm leading-relaxed"
            }
          >
            <div className="whitespace-pre-wrap text-justify">{t.content}</div>
          </div>
        ))}
        {busy && (
          <div className="text-sm text-[color:var(--muted-foreground)]">
            <span className="animate-pulse">Listening…</span>
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {crisis && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
          If you are in immediate danger or thinking of harming yourself, please contact emergency
          services or call 988 (US suicide and crisis line) now. This interview can wait.
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          aria-label="Your answer"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="Answer in your own words…"
          className="flex-1 resize-none rounded-md border border-[color:var(--rule)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
        />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={toggleMic}
            aria-label={recorder ? "Stop recording" : "Speak your answer"}
            className="rounded-full border border-[color:var(--rule)] p-2.5"
          >
            {recorder ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => void send(input)}
            disabled={busy || !input.trim()}
            className="rounded-full bg-[color:var(--ink)] px-5 py-2 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {captured && (
        <div className="rounded-lg border border-[color:var(--rule)] p-4">
          <div className="font-mono-cap mb-2 text-[10px] text-[color:var(--muted-foreground)]">
            What is being kept — edit freely
          </div>
          <textarea
            value={captured}
            onChange={(e) => {
              setCaptured(e.target.value);
              onCapture?.(e.target.value);
            }}
            className="min-h-[120px] w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-sm leading-relaxed focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onComplete?.(captured)}
          className="rounded-full bg-[color:var(--ink)] px-6 py-2 text-[13px] text-[color:var(--paper)]"
        >
          {satisfied ? `${completeLabel} →` : `${completeLabel} anyway →`}
        </button>
        {satisfied && (
          <span className="text-sm text-[color:var(--muted-foreground)]">
            This one feels answered.
          </span>
        )}
      </div>
    </div>
  );
}
