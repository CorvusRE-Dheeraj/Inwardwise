import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { ingestJourneyBook } from "@/lib/journey.functions";

export const Route = createFileRoute("/admin/journey-content")({
  head: () => ({
    meta: [
      { title: "Journey content library, InwardWise Admin" },
      { name: "description", content: "Load approved book sections for My Journey reading." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Journey content library, InwardWise Admin" },
      { property: "og:description", content: "Load approved book sections for My Journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const EXAMPLE = `{
  "bookTitle": "Health, Part 1 and 2 for Class (Refined)",
  "source": "Approved PDF supplied by the founder",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title exactly as printed",
      "sections": [
        {
          "number": 1,
          "title": "Section title exactly as printed",
          "content": "Paste the section text exactly as it appears in the book.",
          "estimatedMinutes": 5,
          "topic": "Uncertainty",
          "theme": "Health",
          "tags": ["health", "uncertainty"],
          "sourceLocator": "pp. 12-15"
        }
      ]
    }
  ]
}`;

function Page() {
  const ingest = useServerFn(ingestJourneyBook);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const parsed = JSON.parse(text);
      const res = await ingest({ data: parsed });
      setMsg(`Loaded ${res.sections} sections into the library.`);
      setText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load that content.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell title="Journey content library">
      <div className="max-w-3xl space-y-5">
        <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          Paste approved book content exactly as it is written. Nothing is rewritten, summarised or
          generated. Only what is loaded here can be shown to members in My Journey.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          rows={20}
          className="w-full rounded-xl border border-[color:var(--rule)] p-4 font-mono text-xs"
        />
        <button
          onClick={() => void submit()}
          disabled={busy || !text.trim()}
          className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--ink)] px-6 text-sm text-[color:var(--paper)] disabled:opacity-50"
        >
          {busy ? "Loading…" : "Load into library"}
        </button>
        {msg && <p className="text-sm text-[color:var(--royal)]">{msg}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </div>
    </AdminShell>
  );
}
