import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { analyzeConnectPrompt } from "@/lib/connect.functions";

export type PathwayAnalysis = Awaited<ReturnType<typeof analyzeConnectPrompt>>;

/**
 * A single prompt box shared by the pathway pages. Each page renders only the
 * part of the result that belongs to it, so nothing is shown before the person
 * has written something.
 */
export function PathwayPrompt({
  placeholder,
  cta,
  children,
}: {
  placeholder: string;
  cta: string;
  children: (result: PathwayAnalysis) => React.ReactNode;
}) {
  const analyze = useServerFn(analyzeConnectPrompt);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PathwayAnalysis | null>(null);

  async function submit() {
    if (prompt.trim().length < 8) {
      setError("Please write a little more, a sentence or two is enough.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setResult(await analyze({ data: { prompt: prompt.trim() } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Write your prompt
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder={placeholder}
          className="mt-4 w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
        />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button
          onClick={submit}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-60"
        >
          {busy ? "Working…" : cta} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {result && children(result)}
    </div>
  );
}
