import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Save, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { decryptText, encryptText } from "@/lib/avatar-crypto";
import { ProductName } from "@/components/products/ProductChrome";

export const Route = createFileRoute("/_authenticated/avatar/library")({
  head: () => ({
    meta: [
      { title: "Your Self Record, InwardWise" },
      {
        name: "description",
        content:
          "Search, edit and download everything you have written across your five factors, unlocked with your PIN.",
      },
      { property: "og:title", content: "Your Self Record, InwardWise" },
      { property: "og:description", content: "Search, edit and download your own answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SelfLibrary,
});

type Row = {
  factor: number;
  factorTitle: string;
  key: string;
  question: string;
  answer: string;
};

function SelfLibrary() {
  const vault = useAvatarVault();
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (vault.status !== "unlocked" || !vault.profile || !vault.key) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("avatar_answers")
        .select("dimension_number, question_key, answer_text")
        .eq("user_id", vault.profile!.user_id);

      const stored: Record<string, string> = {};
      for (const r of data ?? []) {
        try {
          stored[r.question_key] = await decryptText(vault.key!, r.answer_text);
        } catch {
          stored[r.question_key] = "";
        }
      }
      const out: Row[] = [];
      for (const d of AVATAR_DIMENSIONS) {
        for (const q of d.questions) {
          out.push({
            factor: d.n,
            factorTitle: `Factor ${d.n}`,
            key: q.key,
            question: q.prompt,
            answer: stored[q.key] ?? "",
          });
        }
      }
      if (!cancelled) {
        setRows(out);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vault.status, vault.profile, vault.key]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withEdits = rows.map((r) => ({ ...r, answer: edited[r.key] ?? r.answer }));
    if (!q) return withEdits;
    return withEdits.filter((r) =>
      `${r.factorTitle} ${r.question} ${r.answer}`.toLowerCase().includes(q),
    );
  }, [rows, edited, query]);

  const answered = rows.filter((r) => (edited[r.key] ?? r.answer).trim().length > 0).length;

  async function save(row: Row) {
    if (!vault.profile || !vault.key) return;
    setSaving(row.key);
    const text = edited[row.key] ?? row.answer;
    await supabase.from("avatar_answers").upsert(
      {
        user_id: vault.profile.user_id,
        dimension_number: row.factor,
        question_key: row.key,
        answer_text: await encryptText(vault.key, text),
      },
      { onConflict: "user_id,question_key" },
    );
    setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, answer: text } : r)));
    setEdited((prev) => {
      const next = { ...prev };
      delete next[row.key];
      return next;
    });
    setSaving(null);
    setNote("Saved.");
    setTimeout(() => setNote(null), 2500);
  }

  async function download() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 56;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    const line = (text: string, size: number, style: "normal" | "bold" | "italic", gap = 6) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      const parts = doc.splitTextToSize(text, width) as string[];
      for (const part of parts) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(part, margin, y);
        y += size + 3;
      }
      y += gap;
    };

    line("Your Self Record", 22, "bold", 4);
    line(`InwardWise · ${new Date().toLocaleDateString()}`, 10, "normal", 18);

    let current = 0;
    for (const r of rows) {
      const text = (edited[r.key] ?? r.answer).trim();
      if (!text) continue;
      if (r.factor !== current) {
        current = r.factor;
        line(`Factor ${r.factor}`, 15, "bold", 6);
      }
      line(r.question, 11, "italic", 3);
      line(text, 11, "normal", 12);
    }
    doc.save("inwardwise-self-record.pdf");
  }

  return (
    <div className="mx-auto w-[min(1000px,calc(100%-2rem))] py-14 sm:py-20">
      <Link
        to="/avatar"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← Back
      </Link>

      <header className="mt-8 max-w-3xl">
        <h1 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] tracking-tight">
          Your <span className="italic text-[color:var(--royal)]"><ProductName id="self" /></span> record
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[color:var(--muted-foreground)]">
          Everything you have written, in one place. Search it, change any answer at any time, and
          download a copy for yourself. It is unlocked only with your PIN and stays on this device.
        </p>
      </header>

      {vault.status === "needs-setup" || vault.status === "locked" ? (
        <section className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-[color:var(--rule)] p-8">
            <PinKeypad
              mode={vault.status === "needs-setup" ? "setup" : "enter"}
              busy={vault.busy}
              error={vault.error}
              onSubmit={(pin) =>
                vault.status === "needs-setup" ? vault.setupPin(pin) : vault.unlock(pin)
              }
            />
          </div>
          <Caution>
            Your answers are readable only with this PIN. Nobody else, including us, can open them.
          </Caution>
        </section>
      ) : null}

      {vault.status === "unlocked" ? (
        <>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-[color:var(--rule)] px-4 py-2">
              <Search className="h-4 w-4 text-[color:var(--muted-foreground)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your own words"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button
              onClick={download}
              disabled={answered === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-4 py-2 text-sm text-[color:var(--paper)] disabled:opacity-40"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>

          <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
            {loaded ? `${answered} of ${rows.length} questions answered.` : "Opening your record…"}
            {note ? ` ${note}` : ""}
          </p>

          <ul className="mt-8 space-y-4">
            {results.map((r) => (
              <li key={r.key} className="rounded-lg border border-[color:var(--rule)] p-5">
                <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                  Factor {r.factor}
                </div>
                <p className="mt-2 text-sm font-medium">{r.question}</p>
                <textarea
                  value={r.answer}
                  onChange={(e) => setEdited((p) => ({ ...p, [r.key]: e.target.value }))}
                  rows={Math.min(10, Math.max(3, Math.ceil(r.answer.length / 90)))}
                  placeholder="Not answered yet."
                  className="mt-3 w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent p-3 text-sm leading-relaxed outline-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => save(r)}
                    disabled={edited[r.key] === undefined || saving === r.key}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving === r.key ? "Saving…" : "Save change"}
                  </button>
                </div>
              </li>
            ))}
            {loaded && results.length === 0 ? (
              <li className="rounded-lg border border-[color:var(--rule)] p-8 text-sm text-[color:var(--muted-foreground)]">
                Nothing matches that search.
              </li>
            ) : null}
          </ul>
        </>
      ) : null}
    </div>
  );
}
