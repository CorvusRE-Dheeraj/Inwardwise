import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { APPROVED_COPY_REQUIRED, type ProductId } from "@/lib/products";

export type InwardWiseProductId = ProductId | "calm" | "mantra";

const PRODUCT_SECOND_WORD: Record<InwardWiseProductId, string> = {
  decision: "Decision",
  self: "Self",
  connect: "Connect",
  calm: "Calm",
  mantra: "Mantra",
};

/** Two-tone product title used consistently across the site. */
export function ProductName({
  id,
  className = "",
}: {
  id: InwardWiseProductId;
  className?: string;
}) {
  return (
    <span className={className}>
      <span className="text-[color:var(--ink)]">InwardWise</span>{" "}
      <span className="text-[color:var(--royal)]">{PRODUCT_SECOND_WORD[id]}</span>
    </span>
  );
}

/**
 * Visible marker for long-form sections that still need the approved
 * "Website Edits" copy. Structure ships now; wording is swapped in later.
 */
export function ApprovedCopyPlaceholder({ section }: { section: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--rule)] bg-[color:var(--ink)]/[0.02] p-6">
      <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">
        {APPROVED_COPY_REQUIRED}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
        {section}
      </p>
    </div>
  );
}

/** Italics are reserved for disclaimers and legal or medical qualification text. */
export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 max-w-2xl text-sm italic leading-relaxed text-[color:var(--muted-foreground)]">
      {children}
    </p>
  );
}

export function ProductHeader({
  eyebrow,
  name,
  tagline,
}: {
  eyebrow: string;
  name: ReactNode;
  tagline: ReactNode;
}) {
  return (
    <header className="max-w-4xl">
      <Link
        to="/products"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← All products
      </Link>
      <div className="font-mono-cap mt-8 text-[10px] text-[color:var(--muted-foreground)]">
        {eyebrow}
      </div>
      <h1 className="font-display mt-4 text-[clamp(2.4rem,7vw,5rem)] leading-[1.0] tracking-tight">
        {name}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--muted-foreground)]">
        {tagline}
      </p>
    </header>
  );
}

export function CtaRow({
  actions,
}: {
  actions: { label: ReactNode; to: string; primary?: boolean }[];
}) {
  return (
    <div className="mt-10 flex flex-wrap gap-4">
      {actions.map((a, i) => (
        <Link
          key={i}
          to={a.to}
          className={
            a.primary
              ? "inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--royal)]"
              : "inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--royal)]"
          }
        >
          {a.label} <span aria-hidden>→</span>
        </Link>
      ))}
    </div>
  );
}
