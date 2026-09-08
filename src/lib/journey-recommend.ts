// Deterministic Phase 1 recommendation logic for My Journey READ.
// No content is invented here: it only ranks sections that already exist in
// the approved library.

import type { JourneySectionRef, Recommendation } from "./journey";

export interface SignalRow {
  signal_type: string;
  signal_key: string;
  signal_value: string | null;
  confidence: number;
  frequency: number;
  status: string;
}

export interface SectionRow extends JourneySectionRef {
  book_title: string;
  chapter_number: number;
  chapter_title: string;
}

export interface RankInput {
  sections: SectionRow[];
  /** Sections the member has already completed or skipped. */
  excludeSectionIds: string[];
  signals: SignalRow[];
  /** Topics the member chose explicitly. */
  preferredTopics: string[];
  personalizationEnabled: boolean;
}

const MIN_CONFIDENCE = 0.35;

function tokens(s: SectionRow): string[] {
  return [s.topic ?? "", s.theme ?? "", ...(s.tags ?? [])]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Returns the single best eligible section, or null when nothing clears the
 * confidence bar. A weak match is never forced.
 */
export function rankSections(input: RankInput): Recommendation | null {
  const excluded = new Set(input.excludeSectionIds);
  const eligible = input.sections.filter((s) => !excluded.has(s.id));
  if (eligible.length === 0) return null;

  const activeSignals = input.signals.filter((s) => s.status === "active");
  const negative = new Map<string, number>();
  const positive = new Map<string, number>();
  for (const sig of activeSignals) {
    const key = (sig.signal_value ?? sig.signal_key).toLowerCase();
    const weight = Math.min(1, sig.confidence) * Math.min(3, sig.frequency);
    if (sig.signal_key.startsWith("skipped_topic")) {
      negative.set(key, (negative.get(key) ?? 0) + weight);
    } else {
      positive.set(key, (positive.get(key) ?? 0) + weight);
    }
  }

  const preferred = input.preferredTopics.map((t) => t.toLowerCase());

  let best: { rec: Recommendation; score: number } | null = null;

  for (const section of eligible) {
    const toks = tokens(section);
    const reasonCodes: string[] = [];
    let score = 0;

    // Sequence continuity keeps the book readable in its own order.
    const seqBonus = Math.max(0, 0.35 - section.sequence * 0.002);
    score += seqBonus;
    if (seqBonus > 0.2) reasonCodes.push("SEQUENCE_START");

    if (input.personalizationEnabled) {
      for (const t of preferred) {
        if (toks.some((tok) => t.includes(tok) || tok.includes(t))) {
          score += 0.35;
          reasonCodes.push("EXPLICIT_TOPIC_MATCH");
          break;
        }
      }
      for (const [key, weight] of positive) {
        if (toks.some((tok) => key.includes(tok) || tok.includes(key))) {
          score += 0.15 * weight;
          reasonCodes.push("OBSERVED_INTEREST");
          break;
        }
      }
      for (const [key, weight] of negative) {
        if (toks.some((tok) => key.includes(tok) || tok.includes(key))) {
          score -= 0.3 * weight;
          reasonCodes.push("PREVIOUSLY_SKIPPED");
          break;
        }
      }
      // Short readings first for people who tend not to finish long ones.
      if (section.estimated_minutes <= 6) score += 0.08;
    }

    const confidence = Math.max(0, Math.min(1, score));
    if (!best || confidence > best.score) {
      best = {
        score: confidence,
        rec: {
          section,
          bookTitle: section.book_title,
          chapterNumber: section.chapter_number,
          chapterTitle: section.chapter_title,
          confidence,
          reasonCodes: Array.from(new Set(reasonCodes)),
          relevanceNote: relevanceNote(reasonCodes, section),
        },
      };
    }
  }

  if (best && best.score >= MIN_CONFIDENCE) return best.rec;

  // Nothing scored strongly: fall back to the next section in book order, so
  // the journey never dead-ends after the first reading.
  const next = [...eligible].sort((a, b) => a.sequence - b.sequence)[0];
  return {
    section: next,
    bookTitle: next.book_title,
    chapterNumber: next.chapter_number,
    chapterTitle: next.chapter_title,
    confidence: Math.max(0.35, best?.score ?? 0.35),
    reasonCodes: ["SEQUENCE_NEXT"],
    relevanceNote: "This is the next section in the reading order, and a natural place to continue.",
  };
}


function relevanceNote(codes: string[], section: SectionRow): string {
  const topic = section.topic ?? section.theme ?? "this area";
  if (codes.includes("EXPLICIT_TOPIC_MATCH")) {
    return `You chose ${topic.toLowerCase()} as something you want to read about.`;
  }
  if (codes.includes("OBSERVED_INTEREST")) {
    return `You have spent time on readings close to ${topic.toLowerCase()} before.`;
  }
  return "This is the next section in the reading order, and a natural place to begin.";
}
