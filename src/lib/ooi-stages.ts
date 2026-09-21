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
  { n: 7, id: "outin",      name: "Out-In",              short: "Move inwards to get to the solution",           purpose: "Take each part of the boundary and answer it." },
  { n: 8, id: "solutions",  name: "Solution Synthesis",  short: "Concrete solutions per sub-objective",          purpose: "For each boundary sentence, propose concrete solutions, then combine into the final recommendation." },
];

// Global: a single reply can carry more than one tag (e.g. the model delivers
// Stage 7 and the Action Stage in the same message, emitting "[STAGE: 8 — …]"
// mid-reply after the leading "[STAGE: 7 — …]"). The LAST tag wins — that is
// where the reply actually ends.
const STAGE_REGEX_GLOBAL = /\[STAGE:\s*(\d)\s*[—\-–:]\s*([^\]]+)\]/gi;

export function parseStageTag(text: string): number | null {
  let n: number | null = null;
  for (const m of text.matchAll(STAGE_REGEX_GLOBAL)) {
    const v = parseInt(m[1], 10);
    if (v >= 1 && v <= 8) n = v;
  }
  return n;
}

export function stripStageTag(text: string): string {
  return text.replace(STAGE_REGEX_GLOBAL, "").replace(/^\s*\n+/, "");
}
