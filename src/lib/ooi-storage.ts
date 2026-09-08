// Local storage for OOOI decision conversations. Autosaved as user chats.
import type { UIMessage } from "ai";

/** How the decision turned out, as marked by the person themselves. */
export type DecisionOutcome = "successful" | "failed" | "not_attempted" | "unmarked";

export interface DecisionSession {
  id: string;
  title: string;
  category: string;
  stage: number;                 // 1..7 current stage detected from AI output
  /** Outcome the person marked after living with the decision. */
  outcome?: DecisionOutcome;
  /** Free note about what happened, kept with the session. */
  outcomeNote?: string;
  outcomeAt?: number;
  messages: UIMessage[];
  /** Unsent text the person had typed, so a resumed session looks untouched. */
  draft?: string;
  /** Whether the person moved past the orientation screen. */
  started?: boolean;
  createdAt: number;
  updatedAt: number;
}


const KEY = "ooi.sessions.v3";

export const CATEGORIES = [
  "Relationship", "Marriage", "Parenting", "Career", "Business", "Finance",
  "Investment", "Education", "Medical", "Legal", "Lifestyle", "Friendship",
  "Retirement", "Entrepreneurship", "AI Decisions", "Ethics", "Personal Growth",
  "Mental Health", "Leadership", "Real Estate", "Technology",
];

export function loadSessions(): DecisionSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getSession(id: string): DecisionSession | null {
  return loadSessions().find((s) => s.id === id) ?? null;
}

export function saveSession(s: DecisionSession) {
  const all = loadSessions().filter((x) => x.id !== s.id);
  all.unshift({ ...s, updatedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
}

export function deleteSession(id: string) {
  const all = loadSessions().filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function newSession(category = "Personal Growth"): DecisionSession {
  return {
    id: `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    title: "Untitled decision",
    category,
    stage: 1,
    messages: [],
    draft: "",
    started: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}


export function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Untitled decision";
  const text = extractText(first).trim();
  if (!text) return "Untitled decision";
  return text.slice(0, 80) + (text.length > 80 ? "…" : "");
}

export function extractText(m: UIMessage): string {
  const parts = (m.parts ?? []) as Array<{ type: string; text?: string }>;
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("");
}
