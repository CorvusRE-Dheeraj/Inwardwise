// Games unlocked as a reward after each Self Build stage (stage position 1..5).
// Each game appears in exactly one stage so nothing repeats.
import type { GameKey } from "@/lib/self-games";

export type RewardCategory = "psychology" | "language";

export const STAGE_REWARDS: Record<number, { psychology: string[]; language: GameKey[] }> = {
  1: { psychology: ["quiet-colleague", "friend-cancels"], language: ["word_lens"] },
  2: { psychology: ["between-lines", "missing-info"], language: ["evidence_sort"] },
  3: { psychology: ["what-matters", "two-good-choices"], language: ["protective_reframe"] },
  4: { psychology: ["next-move", "three-messages"], language: ["word_pair"] },
  5: { psychology: ["new-evidence", "pressure-mode"], language: ["life_dots", "word_garden"] },
};

export const LANGUAGE_GAME_POINTS = 20;

export type PlayRecord = { score: number; at: string };
export const rewardId = (cat: RewardCategory, key: string) => `${cat}:${key}`;

// Non-sensitive: only which games were played and their points, kept on this device.
const key = (uid: string) => `iw.rewards.played.${uid}`;
export function loadPlayed(uid: string): Record<string, PlayRecord> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(key(uid)) ?? "{}");
  } catch {
    return {};
  }
}
export function recordPlayed(uid: string, id: string, score: number) {
  const cur = loadPlayed(uid);
  if (cur[id]) return;
  localStorage.setItem(key(uid), JSON.stringify({ ...cur, [id]: { score, at: new Date().toISOString() } }));
}
export const totalScore = (played: Record<string, PlayRecord>) =>
  Object.values(played).reduce((s, r) => s + r.score, 0);
