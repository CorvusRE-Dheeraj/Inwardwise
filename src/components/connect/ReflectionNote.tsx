import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Mic, Square } from "lucide-react";
import {
  listConnectReflections,
  saveConnectReflection,
  type StoredReflection,
} from "@/lib/connect-book.functions";
import { startRecording, transcribe, type Recorder } from "@/lib/voice";

/**
 * A private note, written or spoken, kept so it can be reflected on later.
 * Nothing here is shared with anyone else.
 */
export function ReflectionNote({ readId }: { readId?: string }) {
  const save = useServerFn(saveConnectReflection);
  const list = useServerFn(listConnectReflections);
  const recorder = useRef<Recorder | null>(null);

  const [body, setBody] = useState("");
  const [source, setSource] = useState<"written" | "spoken">("written");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [past, setPast] = useState<StoredReflection[]>([]);

  useEffect(() => {
    list({})
      .then(setPast)
      .catch(() => undefined);
  }, [list]);

  async function toggleRecording() {
    setError(null);
    if (recording && recorder.current) {
      setRecording(false);
      setBusy(true);
      try {
        const blob = await recorder.current.stop();
        recorder.current = null;
        const text = await transcribe(blob);
        setBody((b) => (b ? `${b} ${text}` : text));
        setSource("spoken");
      } catch (e) {
        setError(e instanceof Error ? e.message : "The recording could not be used.");
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      recorder.current = await startRecording();
      setRecording(true);
    } catch {
      setError("Microphone access was not allowed, so please type instead.");
    }
  }

  async function submit() {
    const text = body.trim();
    if (text.length < 2) {
      setError("Write or say a little first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await save({ data: { body: text, source, readId } });
      setBody("");
      setSaved(true);
      setPast(await list({}));
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be kept just now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        § 00 · Write or record
      </div>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">
        Something you want to <em className="italic text-[color:var(--royal)]">keep</em>
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-justify text-[color:var(--muted-foreground)]">
        Do you want to write or record something based on what happened, or based on what you have
        just read? Keep it here and you can come back to reflect on it later. It stays private to
        you.
      </p>

      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setSaved(false);
        }}
        rows={5}
        placeholder="In your own words…"
        className="mt-6 w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
      />

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={submit}
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-60"
        >
          {busy && !recording ? "Keeping…" : "Keep this"}
        </button>
        <button
          onClick={toggleRecording}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-3 text-[13px]"
        >
          {recording ? (
            <>
              <Square className="h-3.5 w-3.5" /> Stop recording
            </>
          ) : (
            <>
              <Mic className="h-3.5 w-3.5" /> Say it instead
            </>
          )}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--royal)]">
            <Check className="h-3.5 w-3.5" /> Kept
          </span>
        )}
      </div>

      {past.length > 0 && (
        <div className="mt-8 border-t border-[color:var(--rule)] pt-6">
          <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            What you have kept
          </div>
          <ul className="mt-4 space-y-4">
            {past.map((r) => (
              <li key={r.id} className="text-[14px] leading-relaxed">
                <span className="text-[color:var(--muted-foreground)]">
                  {new Date(r.createdAt).toLocaleString()} ·{" "}
                  {r.source === "spoken" ? "spoken" : "written"}
                </span>
                <p className="mt-1 whitespace-pre-line">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
