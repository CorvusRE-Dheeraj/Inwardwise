// The 7 stages of OOOI — used by the UI stage rail and to parse
// the [STAGE: n — Name] tag the model emits at the start of each reply.

export interface Stage {
  n: number;
  id: string;
  name: string;
  short: string;
  purpose: string;
}

export const STAGES: Stage[] = [
  { n: 1, id: "situation",  name: "Situation",           short: "Facts, no interpretation",                      purpose: "Collect situation, timeline, people, constraints, emotions, unknowns." },
  { n: 2, id: "objective",  name: "Objective",           short: "What you truly want",                           purpose: "Separate problem from objective. Challenge why, and why now." },
  { n: 3, id: "solution",   name: "Solution Space",      short: "All realistic paths",                           purpose: "Verify completeness of solution categories. No ranking, no comparison." },
  { n: 4, id: "refined",    name: "Refined Objective",   short: "Remove bias & fear",                            purpose: "Name biases and fears. Stress-test the objective." },
  { n: 5, id: "abstracted", name: "Abstracted Objective", short: "Self-reflection",                               purpose: "Abstract the objective until it becomes timeless." },
  { n: 6, id: "boundary",   name: "Boundary",            short: "Cast a wider net to capture the right solution", purpose: "Define a 1–3 sentence boundary with numbered sub-objectives." },
  { n: 7, id: "outin",      name: "Out-In",              short: "Move inwards to get to the solution",           purpose: "Take each part of the boundary and answer it. Then recommend." },
];

const STAGE_REGEX = /\[STAGE:\s*(\d)\s*[—\-–:]\s*([^\]]+)\]/i;

export function parseStageTag(text: string): number | null {
  const m = text.match(STAGE_REGEX);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n >= 1 && n <= 7 ? n : null;
}

export function stripStageTag(text: string): string {
  return text.replace(STAGE_REGEX, "").replace(/^\s*\n+/, "");
}
