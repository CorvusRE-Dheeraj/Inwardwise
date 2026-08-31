import { useMemo } from "react";

export function FormattedText({ text }: { text: string }) {
  const lastQuestion = useMemo(() => findLastQuestion(text), [text]);
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isBulleted = lines.every((l) => /^\s*[-•*]\s+/.test(l));
        const isNumbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (isBulleted) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•*]\s+/, ""), lastQuestion)}</li>
              ))}
            </ul>
          );
        }
        if (isNumbered) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""), lastQuestion)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {inline(block, lastQuestion)}
          </p>
        );
      })}
    </div>
  );
}

function findLastQuestion(text: string): string | null {
  const idx = text.lastIndexOf("?");
  if (idx === -1) return null;
  let start = idx;
  while (start > 0) {
    const prev = text[start - 1];
    if (prev === "." || prev === "!" || prev === "?" || prev === "\n") break;
    start--;
  }
  while (start < idx && /\s/.test(text[start])) start++;
  return text.slice(start, idx + 1).trim();
}

function inline(s: string, highlight: string | null = null): React.ReactNode {
  if (highlight && s.includes(highlight)) {
    const parts = s.split(highlight);
    return parts.map((part, i) => (
      <span key={i}>
        {inline(part, null)}
        {i < parts.length - 1 && (
          <span className="font-medium text-accent">{highlight}</span>
        )}
      </span>
    ));
  }
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
