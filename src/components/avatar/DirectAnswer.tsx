import { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { startRecording, transcribe, type Recorder } from "@/lib/voice";

export interface DirectAnswerProps {
  /** The question shown to the person, in full. */
  question: string;
  helper?: string;
  value: string;
  onChange: (text: string) => void;
  onComplete: () => void | Promise<void>;
  completeLabel?: string;
}

/**
 * Plain, direct question panel. Used for the later stages of the Self Journey,
 * where a guided back-and-forth interview made sessions long and tiring.
 */
export function DirectAnswer({
  question,
  helper,
  value,
  onChange,
  onComplete,
  completeLabel = "Continue",
}: DirectAnswerProps) {
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  function update(next: string) {
    setText(next);
    onChange(next);
  }

  async function toggleMic() {
    setError(null);
    if (recorder) {
      const rec = recorder;
      setRecorder(null);
      try {
        const spoken = await transcribe(await rec.stop());
        if (spoken.trim()) update(`${text ? `${text}\n\n` : ""}${spoken.trim()}`);
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
      <p className="text-lg leading-relaxed text-[color:var(--ink)]">{question}</p>
      {helper && (
        <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">{helper}</p>
      )}

      <textarea
        aria-label="Your answer"
        value={text}
        onChange={(e) => update(e.target.value)}
        rows={8}
        placeholder="Write in your own words…"
        className="w-full resize-y rounded-lg border border-[color:var(--rule)] bg-white px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-[color:var(--royal)]/30 focus:outline-none"
      />

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onComplete()}
          disabled={!text.trim()}
          className="rounded-full bg-[color:var(--ink)] px-6 py-2 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
        >
          {completeLabel} →
        </button>
        <button
          type="button"
          onClick={toggleMic}
          aria-label={recorder ? "Stop recording" : "Speak your answer"}
          className="rounded-full border border-[color:var(--rule)] p-2.5"
        >
          {recorder ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
