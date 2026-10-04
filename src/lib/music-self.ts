// Turns a member's decrypted Self Journey answers into a short music profile
// that Connect Music can send with one suggestion request. Runs in the
// browser, after the member unlocks their Self with their PIN.
//
// Privacy rules:
// - The "Reflecting" stage (private habits) is never used for music.
// - Only the neutral stage labels are used, never internal factor names.
// - Answers are trimmed, and nothing here is stored.

import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import type { AvatarAnswers } from "@/lib/avatar-prompt";
import { SELF_JOURNEY } from "@/lib/self-journey";

/** Internal factor numbers that are never used for music. */
export const MUSIC_EXCLUDED_FACTORS = [2] as const;

/** What each stage can tell Connect about the songs that will land. */
const STAGE_HINT: Record<number, string> = {
  5: "Life moments and themes that shaped them — the strongest guide to what songs will mean to them.",
  4: "How they meet the world — hints at taste, culture, language, faith and the music around them.",
  3: "What they do well — e.g. a musician may value instrumentals, a writer may value lyrics.",
  1: "Their early years (ages 5 to 15) — the era and memories that nostalgic songs can reach.",
};

export const MUSIC_SELF_ANSWER_MAX = 500;
export const MUSIC_SELF_TOTAL_MAX = 3000;

export type MusicSelfProfile = {
  /** Stage labels whose answers were used, in Self Journey order. */
  stages: string[];
  /** The text sent with a suggestion request. */
  text: string;
};

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/**
 * Builds the music profile, or null when no usable stage has answers yet.
 * Stages follow the Self Journey order the member sees.
 */
export function buildMusicSelfProfile(answers: AvatarAnswers): MusicSelfProfile | null {
  const stages: string[] = [];
  const blocks: string[] = [];

  for (const stage of SELF_JOURNEY) {
    if ((MUSIC_EXCLUDED_FACTORS as readonly number[]).includes(stage.n)) continue;
    const dim = AVATAR_DIMENSIONS.find((d) => d.n === stage.n);
    if (!dim) continue;
    const qa = dim.questions
      .map((q) => {
        const a = clip(answers[q.key] ?? "", MUSIC_SELF_ANSWER_MAX);
        return a ? `Q: ${q.prompt}\nA: ${a}` : null;
      })
      .filter((x): x is string => !!x);
    if (qa.length === 0) continue;
    stages.push(stage.label);
    blocks.push(`${stage.label.toUpperCase()} — ${STAGE_HINT[stage.n] ?? ""}\n${qa.join("\n")}`);
  }

  if (blocks.length === 0) return null;
  let text = blocks.join("\n\n");
  if (text.length > MUSIC_SELF_TOTAL_MAX) text = `${text.slice(0, MUSIC_SELF_TOTAL_MAX - 1)}…`;
  return { stages, text };
}

/** Stage labels a member can complete to personalise music (excludes Reflecting). */
export const MUSIC_SELF_STAGES = SELF_JOURNEY.filter(
  (s) => !(MUSIC_EXCLUDED_FACTORS as readonly number[]).includes(s.n),
).map((s) => s.label);
