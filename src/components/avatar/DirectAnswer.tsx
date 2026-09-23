import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { startRecording, synthesizeSpeech, transcribe, type Recorder } from "@/lib/voice";
import { VoiceReminder } from "./VoiceReminder";

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
 * Plain, direct question panel, voice first: the question is read aloud and
 * a large mic button is the main way to answer.
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
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState(value);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakId = useRef(0);

  useEffect(() => {
    setText(value);
  }, [value]);

  async function speak() {
    const id = ++speakId.current;
    audioRef.current?.pause();
    try {
      const blob = await synthesizeSpeech(question);
      const audio = new Audio(URL.createObjectURL(blob));
      if (id !== speakId.current) return;
      audioRef.current = audio;
      await audio.play();
    } catch {
      /* autoplay blocked or playback failed; the text is on screen */
    }
  }

  // Read each new question aloud.
  useEffect(() => {
    void speak();
    return () => {
      speakId.current++;
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  function update(next: string) {
    setText(next);
    onChange(next);
  }

  async function toggleMic() {
    setError(null);
    if (recorder) {
      const rec = recorder;
      setRecorder(null);
      setTranscribing(true);
      try {
        const spoken = await transcribe(await rec.stop());
        if (spoken.trim()) update(`${text ? `${text}\n\n` : ""}${spoken.trim()}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Voice input failed.");
      } finally {
        setTranscribing(false);
      }
      return;
    }
    try {
      speakId.current++;
      audioRef.current?.pause();
      setRecorder(await startRecording());
    } catch {
      setError("Microphone unavailable. Please allow microphone access, or type instead.");
    }
  }

  return (
    <div className="space-y-4">
      <VoiceReminder />
      <div className="flex items-start gap-3">
        <p className="flex-1 text-lg leading-relaxed text-[color:var(--ink)]">{question}</p>
        <button
          type="button"
          onClick={() => void speak()}
          aria-label="Hear the question"
          className="rounded-full border border-[color:var(--rule)] p-2.5 text-[color:var(--royal)]"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>
      {helper && (
        <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">{helper}</p>
      )}

      <div className="flex flex-col items-center gap-2 py-2">
        <button
          type="button"
          onClick={toggleMic}
          disabled={transcribing}
          aria-label={recorder ? "Stop recording" : "Speak your answer"}
          className={`flex h-20 w-20 items-center justify-center rounded-full text-[color:var(--paper)] shadow-md disabled:opacity-60 ${
            recorder ? "animate-pulse bg-destructive" : "bg-[color:var(--royal)]"
          }`}
        >
          {recorder ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
        </button>
        <span className="text-sm text-[color:var(--ink)]">
          {transcribing
            ? "Writing down what you said…"
            : recorder
              ? "Listening… tap to stop"
              : "Tap to speak your answer"}
        </span>
      </div>

      <textarea
        aria-label="Your answer"
        value={text}
        onChange={(e) => update(e.target.value)}
        rows={5}
        placeholder="Or write in your own words…"
        className="w-full resize-y rounded-lg border border-[color:var(--rule)] bg-white px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-[color:var(--royal)]/30 focus:outline-none"
      />

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void onComplete()}
        disabled={!text.trim()}
        className="rounded-full bg-[color:var(--ink)] px-6 py-2 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
      >
        {completeLabel} →
      </button>
    </div>
  );
}
