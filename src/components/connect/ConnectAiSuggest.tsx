import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Mic, Square } from "lucide-react";
import { suggestConnectPathway } from "@/lib/connect-suggest.functions";
import { pathwayById } from "@/lib/connect-pathways";

/** Pathways Connect AI can suggest right now; the others are under development. */
const SUGGESTABLE_PATHWAYS = ["book", "membership"];
import { startRecording, transcribe, type Recorder } from "@/lib/voice";
import { CrisisNotice } from "@/components/CrisisNotice";
import { detectCrisis } from "@/lib/crisis-detect";
import type { MiCrisisCategory } from "@/lib/mi-filter";

type Suggestion = Awaited<ReturnType<typeof suggestConnectPathway>>;

/**
 * The single Connect AI prompt. Someone writes or speaks how they feel and
 * Connect AI names the one pathway that fits, with the first useful step.
 */
export function ConnectAiSuggest() {
  const suggest = useServerFn(suggestConnectPathway);
  const recorder = useRef<Recorder | null>(null);

  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Suggestion | null>(null);
  const [crisis, setCrisis] = useState<MiCrisisCategory[]>([]);

  async function toggleRecording() {
    setError(null);
    if (recording && recorder.current) {
      setRecording(false);
      setBusy(true);
      try {
        const blob = await recorder.current.stop();
        recorder.current = null;
        const text = await transcribe(blob);
        setPrompt((p) => (p ? `${p} ${text}` : text));
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
    const text = prompt.trim();
    if (text.length < 8) {
      setError("Please write a little more, a sentence or two is enough.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setCrisis(detectCrisis(text));
      setResult(await suggest({ data: { prompt: text } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const rawPathway = result ? pathwayById(result.pathwayId) : null;
  const suggestable = !!rawPathway && SUGGESTABLE_PATHWAYS.includes(rawPathway.id);
  const pathway = suggestable ? rawPathway : result ? pathwayById("membership") : null;
  /** True when the suggested pathway is not open yet and Membership is offered instead. */
  const substituted = !!result && !suggestable;


  return (
    <section className="mx-auto mt-12 w-[min(1100px,calc(100%-2rem))]">
      <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
        <h2 className="font-display text-2xl sm:text-3xl">
          Type how you are feeling, or say it
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
          Write what you want to do to connect to this world. It could be going out to meet people,
          sitting quietly with something to read, listening to something that lifts you, or watching
          something that makes you curious. You do not have to choose first.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="How are you feeling, or what would you like to do right now…"
          className="mt-6 w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
        />

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={submit}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-60"
          >
            {busy && !recording ? "Thinking…" : "Let Connect AI suggest"}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={toggleRecording}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-3 text-[13px]"
          >
            {recording ? (
              <>
                <Square className="h-3.5 w-3.5" /> Stop and use it
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" /> Say it instead
              </>
            )}
          </button>
        </div>

        <CrisisNotice categories={crisis} />

        {result && pathway && (
          <div className="mt-7 rounded-md border border-[color:var(--royal)]/40 bg-[color:var(--royal)]/5 p-5">
            <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              Suggestion
            </div>
            <h3 className="font-display mt-3 text-xl sm:text-2xl">
              {pathway.name} <span className="text-[color:var(--royal)]">{pathway.accent}</span>
            </h3>
            {substituted ? (
              <>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">
                  {rawPathway
                    ? `${rawPathway.name} ${rawPathway.accent} would suit what you wrote, but it is still being built.`
                    : "The closest way of connecting for what you wrote is still being built."}{" "}
                  For now, {pathway.name} {pathway.accent} is the nearest place to start.
                </p>
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed">
                  {pathway.purpose}
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{result.why}</p>
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed">
                  {result.firstStep}
                </p>
              </>
            )}

            <Link
              to={pathway.to}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)]"
            >
              {pathway.action} <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
