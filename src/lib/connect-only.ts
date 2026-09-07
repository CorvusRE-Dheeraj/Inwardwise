/**
 * Connect only path.
 *
 * For members who do not want to make a decision, do not want a Self
 * consultation, and are not using meditation or mantra. Nothing from the
 * library is ever displayed on the page: matched material is delivered to
 * them one small piece at a time, and the next piece is only released once
 * they confirm they read the previous one.
 */

export type ConnectOnlySectionRow = {
  id: string;
  title: string;
  content: string;
  topic: string | null;
  theme: string | null;
  tags: string[] | null;
  sequence: number;
  estimated_minutes: number;
};

const STOP_WORDS = new Set([
  "the", "and", "that", "with", "have", "this", "from", "they", "been", "when", "what", "your",
  "about", "which", "would", "there", "their", "will", "into", "them", "than", "then", "some",
  "just", "like", "feel", "feels", "very", "much", "cant", "dont", "want", "need", "know", "not",
  "for", "you", "was", "are", "but", "his", "her", "she", "him", "who", "how", "why", "all",
]);

export function keywordsOf(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w)),
    ),
  );
}

/** Deterministic scoring, no fabricated content and no private answers used. */
export function scoreSection(section: ConnectOnlySectionRow, words: string[]): number {
  const haystack = [
    section.title,
    section.topic ?? "",
    section.theme ?? "",
    (section.tags ?? []).join(" "),
    section.content.slice(0, 1200),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const w of words) {
    if (section.title.toLowerCase().includes(w)) score += 3;
    else if ((section.tags ?? []).some((t) => t.toLowerCase().includes(w))) score += 2;
    else if (haystack.includes(w)) score += 1;
  }
  return score;
}

/** Picks the next piece to send: best match first, otherwise the next in order. */
export function pickNextSection(
  sections: ConnectOnlySectionRow[],
  words: string[],
  deliveredIds: string[],
): ConnectOnlySectionRow | null {
  const remaining = sections.filter((s) => !deliveredIds.includes(s.id));
  if (remaining.length === 0) return null;
  let best = remaining[0];
  let bestScore = -1;
  for (const s of remaining) {
    const score = scoreSection(s, words);
    if (score > bestScore || (score === bestScore && s.sequence < best.sequence)) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}

/** Questions asked before local suggestions are researched. */
export const EVENT_QUESTIONS = [
  { key: "location", label: "Which town or city are you in?", placeholder: "e.g. Pune, or Austin, Texas" },
  { key: "availability", label: "When are you usually free?", placeholder: "e.g. weekday evenings, Sunday mornings" },
  { key: "interests", label: "What do you enjoy, or would like to try?", placeholder: "e.g. walking, books, music, volunteering" },
] as const;

export const CONNECT_ONLY_DISCLAIMER =
  "Connect is for reflection and belonging. It is not therapy, medical care, legal advice, or emergency support.";
