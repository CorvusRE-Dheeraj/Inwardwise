import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, Square, Play, Trash2, Send } from "lucide-react";
import { startRecording, type Recorder } from "@/lib/voice";
import {
  EXPERIENCE_PROMPTS,
  listMyVoiceExperiences,
  submitVoiceExperience,
} from "@/lib/voice-experience.functions";

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the recording."));
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

export function VoiceExperience() {
  const submit = useServerFn(submitVoiceExperience);
  const listMine = useServerFn(listMyVoiceExperiences);

  const [prompt, setPrompt] = useState(EXPERIENCE_PROMPTS[0]!);
  const [category, setCategory] = useState("Life");
  const [situation, setSituation] = useState("");
  const [lesson, setLesson] = useState("");
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [mine, setMine] = useState<Awaited<ReturnType<typeof listMyVoiceExperiences>>>([]);
  const rec = useRef<Recorder | null>(null);

  const refresh = () => listMine({}).then(setMine).catch(() => undefined);
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setNote(null);
    try {
      rec.current = await startRecording();
      setRecording(true);
    } catch {
      setNote("We could not reach your microphone. Please allow access and try again.");
    }
  }

  async function stop() {
    if (!rec.current) return;
    const b = await rec.current.stop();
    rec.current = null;
    setRecording(false);
    setBlob(b);
    setUrl(URL.createObjectURL(b));
  }

  function discard() {
    setBlob(null);
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
  }

  async function send() {
    if (!blob || !consent || situation.trim().length < 10) return;
    setBusy(true);
    setNote(null);
    try {
      await submit({
        data: {
          category: category.trim() || "Life",
          promptTitle: prompt,
          situation: situation.trim(),
          lesson: lesson.trim() || undefined,
          audioBase64: await toBase64(blob),
          audioType: blob.type || "audio/webm",
          consent: true,
        },
      });
      discard();
      setSituation("");
      setLesson("");
      setConsent(false);
      setNote("Thank you. Your recording is with our reviewers. Nobody else can hear it until it is approved.");
      void refresh();
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Something went wrong sending your recording.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
      <h2 className="font-display text-2xl">Record an experience for someone else</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
        Pick one of the experiences below and tell it in your own voice. Nothing is shared until you
        agree to it and a reviewer has listened. Your name is never attached.
      </p>

      <label className="mt-6 block text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
        What would you like to talk about?
      </label>
      <select
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="mt-2 w-full rounded-md border border-[color:var(--rule)] bg-transparent p-3 text-sm"
      >
        {EXPERIENCE_PROMPTS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Area, e.g. Health"
          className="rounded-md border border-[color:var(--rule)] bg-transparent p-3 text-sm"
        />
        <input
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          placeholder="In one line, what would you tell someone in the same place?"
          className="rounded-md border border-[color:var(--rule)] bg-transparent p-3 text-sm"
        />
      </div>

      <textarea
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        rows={4}
        placeholder="A few sentences about what happened, so a listener knows the context."
        className="mt-4 w-full rounded-md border border-[color:var(--rule)] bg-transparent p-3 text-sm leading-relaxed"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!recording && !blob ? (
          <button
            onClick={start}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm text-[color:var(--paper)]"
          >
            <Mic className="h-4 w-4" /> Start recording
          </button>
        ) : null}
        {recording ? (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--royal)] px-4 py-2 text-sm text-white"
          >
            <Square className="h-4 w-4" /> Stop
          </button>
        ) : null}
        {url ? (
          <>
            <span className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
              <Play className="h-4 w-4" /> Listen back
            </span>
            <audio controls src={url} className="h-9" />
            <button
              onClick={discard}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-3 py-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Record again
            </button>
          </>
        ) : null}
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span className="text-[color:var(--muted-foreground)]">
          I agree that this recording may be shared anonymously with other members after review, and
          I understand I can ask for it to be removed at any time.
        </span>
      </label>

      <button
        onClick={send}
        disabled={!blob || !consent || situation.trim().length < 10 || busy}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-sm text-[color:var(--paper)] disabled:opacity-40"
      >
        <Send className="h-4 w-4" /> {busy ? "Sending…" : "Share for review"}
      </button>

      {note ? <p className="mt-3 text-sm text-[color:var(--royal)]">{note}</p> : null}

      {mine.length > 0 ? (
        <div className="mt-8 border-t border-[color:var(--rule)] pt-5">
          <h3 className="text-sm font-medium">Your recordings</h3>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted-foreground)]">
            {mine.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4">
                <span className="truncate">{m.situation.split("\n")[0]}</span>
                <span className="shrink-0 text-xs">
                  {m.is_published
                    ? "Shared with members"
                    : m.moderation_status === "rejected"
                      ? "Not approved"
                      : "Waiting for review"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
