// Self Build reflection games (Phases 1–3). Content only, no scoring, no right answers.
import { LANGUAGE_GAME_POINTS, recordPlayed, rewardId } from "@/lib/stage-rewards";
export type GameKey = "word_lens" | "evidence_sort" | "protective_reframe" | "word_pair" | "life_dots" | "word_garden";
export type GameStatus = "not_started" | "in_progress" | "completed";

export type GameMeta = {
  key: GameKey;
  slug: string;
  title: string;
  description: string;
  /** Neutral, public stage label (never internal factor names). */
  explores: string;
  minutes: string;
  /** Self Build factor numbers this game relates to (for "Try a quick activity"). */
  factors: number[];
};

export const GAMES: GameMeta[] = [
  {
    key: "word_lens",
    slug: "word-lens",
    title: "Word Lens",
    description: "Find words that feel close to what you experienced. Pick, add your own, or skip.",
    explores: "Feelings and experiences",
    minutes: "1–3 min",
    factors: [1, 2, 5],
  },
  {
    key: "evidence_sort",
    slug: "evidence-sort",
    title: "Evidence Sort",
    description: "Sort activities into what you enjoy, what you're learning, and what comes naturally.",
    explores: "Interests, skills and talents",
    minutes: "2–3 min",
    factors: [3, 4],
  },
  {
    key: "protective_reframe",
    slug: "protective-reframe",
    title: "Protective Reframe",
    description: "Look at one behavior from two sides: what it may protect, and what it may cost.",
    explores: "Patterns you notice in yourself",
    minutes: "2–3 min",
    factors: [1, 2],
  },
  {
    key: "word_pair",
    slug: "word-pair",
    title: "Word Pair",
    description: "Two close words, one example. Decide which feels nearer to you, in your own language.",
    explores: "Understanding the difference",
    minutes: "2–3 min",
    factors: [2, 3],
  },
  {
    key: "life_dots",
    slug: "life-dots",
    title: "Life Dots",
    description: "Place experiences you choose as dots, group them into your own themes, and look for patterns.",
    explores: "Connecting life experiences",
    minutes: "3–5 min",
    factors: [5, 4],
  },
  {
    key: "word_garden",
    slug: "garden",
    title: "Word Garden",
    description: "Revisit the words you kept, with a gentle recall at a pace you choose.",
    explores: "Revisiting useful words",
    minutes: "2–4 min",
    factors: [1, 5],
  },
];

export const gameBySlug = (slug: string) => GAMES.find((g) => g.slug === slug);
export const gamesForFactor = (n: number) => GAMES.filter((g) => g.factors.includes(n));

export const WORD_PAIRS = [
  { a: "Interest", b: "Skill", example: "Spending weekends sketching, though the drawings still feel rough." },
  { a: "Caution", b: "Avoidance", example: "Putting off a phone call until you feel ready to have it." },
  { a: "Persistence", b: "Stubbornness", example: "Trying the same approach a fifth time after others suggested a change." },
  { a: "Confidence", b: "Certainty", example: "Speaking up in a meeting without knowing if the idea will work." },
  { a: "Independence", b: "Isolation", example: "Preferring to work through a hard week without telling anyone." },
];

export const LIFE_DOT_THEMES = ["Times I adapted", "What I keep returning to", "People and activities that mattered"];

export const GARDEN_INTERVALS = [
  { label: "In 3 days", days: 3 },
  { label: "In a week", days: 7 },
  { label: "In two weeks", days: 14 },
  { label: "In a month", days: 30 },
  { label: "Only when I choose", days: 0 },
];

/** Gentle, optional milestones. Never removed, never tied to streaks. */
export const MILESTONES = [
  { at: 1, label: "First reflection kept" },
  { at: 3, label: "Three reflections explored" },
  { at: 5, label: "Five words in your garden" },
  { at: 10, label: "A growing vocabulary" },
  { at: 20, label: "A garden in full bloom" },
];

/** Invitations based on what the person has already done. Never blocks a game. */
export function recommendGames(input: {
  status: Record<GameKey, GameStatus>;
  reflectionGames: string[];
  wordCount: number;
}): { game: GameMeta; reason: string }[] {
  const out: { game: GameMeta; reason: string }[] = [];
  const g = (k: GameKey) => GAMES.find((x) => x.key === k)!;
  if (input.wordCount >= 3) out.push({ game: g("word_garden"), reason: "You've kept a few words. Would you like to revisit them?" });
  if (input.reflectionGames.length >= 2) out.push({ game: g("life_dots"), reason: "You've saved several reflections. Would you like to look for connections?" });
  if (input.status.evidence_sort !== "not_started" && input.status.word_pair === "not_started")
    out.push({ game: g("word_pair"), reason: "Would you like to explore the difference between an interest and a skill?" });
  if (input.status.protective_reframe !== "not_started" && input.status.word_lens === "not_started")
    out.push({ game: g("word_lens"), reason: "Would you like to find words for a moment you held back?" });
  if (input.status.evidence_sort === "not_started") out.push({ game: g("evidence_sort"), reason: "Would you like to explore what you enjoy and do well?" });
  return out.slice(0, 3);
}

export const WORD_LENS_PROMPTS = [
  {
    key: "held_back",
    question: "Think of a time you held back from saying something. Which word feels closest to what you experienced?",
    words: ["Uncertain", "Protective", "Overwhelmed", "Resentful", "Hesitant", "Careful"],
  },
  {
    key: "plans_changed",
    question: "Think of a time plans changed at the last minute. Which word feels closest?",
    words: ["Frustrated", "Relieved", "Unsettled", "Flexible", "Disappointed", "Curious"],
  },
  {
    key: "small_win",
    question: "Think of a small moment recently that went well. Which word fits how it felt?",
    words: ["Proud", "Calm", "Grateful", "Surprised", "Light", "Capable"],
  },
];

export const SORT_CATEGORIES = [
  { id: "interest", label: "An interest", hint: "Something I enjoy or want to explore" },
  { id: "developing", label: "A developing skill", hint: "Something I am learning or practicing" },
  { id: "strong", label: "A strong skill or talent", hint: "Something I do well or find relatively easy" },
  { id: "unsure", label: "Not sure yet", hint: "Something I am still exploring" },
] as const;

export const SORT_DEFAULT_ACTIVITIES = ["Cooking", "Listening to friends", "Organizing things", "Writing", "Fixing things", "Teaching someone"];

export const SORT_FOLLOWUPS = [
  "What have you practiced?",
  "What do you find easy to do?",
  "What have others recognized in you?",
];

export const REFRAME_PROTECT = ["Making a mistake", "Conflict", "Uncertainty", "Feeling unprepared"];
export const REFRAME_COST = ["A missed opportunity", "Additional stress", "Delayed progress", "A difficult conversation"];
export const REFRAME_EXAMPLE = "Waiting before acting";

export const ENCOURAGEMENTS = [
  "You explored a new way to describe your experience.",
  "You took a moment to understand your perspective.",
  "Your Self Build journey is progressing at your pace.",
  "You can return to this reflection whenever you choose.",
];

// Non-sensitive progress status only (no answers) kept on this device.
const statusKey = (uid: string) => `iw.games.status.${uid}`;
export function loadGameStatus(uid: string): Record<GameKey, GameStatus> {
  const base = Object.fromEntries(GAMES.map((g) => [g.key, "not_started"])) as Record<GameKey, GameStatus>;
  if (typeof window === "undefined") return base;
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(statusKey(uid)) ?? "{}") };
  } catch {
    return base;
  }
}
export function setGameStatus(uid: string, key: GameKey, status: GameStatus) {
  const cur = loadGameStatus(uid);
  if (cur[key] === "completed" && status === "in_progress") return;
  localStorage.setItem(statusKey(uid), JSON.stringify({ ...cur, [key]: status }));
  if (status === "completed") recordPlayed(uid, rewardId("language", key), LANGUAGE_GAME_POINTS);
}
