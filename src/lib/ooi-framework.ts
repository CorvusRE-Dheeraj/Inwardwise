// OOOI Framework — Objective Oriented Out-In
// Faithful to the 7-step model in OOOI_model.pdf:
//   1. Situation       — raw event / question / pseudo objective
//   2. Objective       — concrete "what I want" (still low-level)
//   3. Solution        — the final outcomes on offer (A / B / C / D paths)
//   4. Refine          — strip bias & fear; face negative outcomes honestly
//   5. Abstracted Obj  — one level higher; measurable, time-bound
//   6. Boundary        — 1–3 sentence net that CONTAINS the answer
//   7. Out-In          — split the boundary word-by-word, answer each piece,
//                        combine into the final solution
//
// All AI text here is deterministic mock content. Replace with a real
// streaming AI call when the backend lands — the shape stays the same.

export type StepId =
  | "situation"
  | "objective"
  | "solutions"
  | "refine"
  | "abstracted"
  | "boundary"
  | "outin";

export interface Step {
  id: StepId;
  index: number;
  label: string;
  short: string;
  eyebrow: string;
}

export const STEPS: Step[] = [
  { id: "situation",  index: 1, label: "Situation",           short: "Declare the event",           eyebrow: "Step 1 · Declare your need" },
  { id: "objective",  index: 2, label: "Objective",           short: "What you want",               eyebrow: "Step 2 · Define your objective" },
  { id: "solutions",  index: 3, label: "Solutions",           short: "Outcomes on offer",           eyebrow: "Step 3 · Define the solutions" },
  { id: "refine",     index: 4, label: "Refine (Bias & Fear)", short: "Face what you avoid",         eyebrow: "Step 4 · Remove bias & fear" },
  { id: "abstracted", index: 5, label: "Abstracted Objective", short: "One level higher",           eyebrow: "Step 5 · Abstract your objective" },
  { id: "boundary",   index: 6, label: "Boundary",             short: "The net that holds the answer", eyebrow: "Step 6 · Define the boundary" },
  { id: "outin",      index: 7, label: "Out-In Approach",      short: "Answer each piece, combine",   eyebrow: "Step 7 · Work inwards" },
];

export const CATEGORIES = [
  "Relationship", "Marriage", "Parenting", "Career", "Business", "Finance",
  "Investment", "Education", "Medical", "Legal", "Lifestyle", "Friendship",
  "Retirement", "Entrepreneurship", "AI Decisions", "Ethics", "Personal Growth",
  "Mental Health", "Leadership", "Real Estate", "Technology",
];

// ─── Data model ────────────────────────────────────────────────────────────

export interface SolutionPath {
  label: string;      // A / B / C / D
  title: string;
  detail: string;     // one-line consequence
  desirable: boolean; // is this an outcome you'd accept?
}

export interface BiasCard {
  name: string;
  reason: string;
  weight: number; // 0..1
}

export interface RefineState {
  negativeOutcomes: string;     // what you don't want to think about
  fearsFaced: string;           // what you'll do if the bad outcome happens
  biases: BiasCard[];
  egoCheck: string;             // is this ego-driven?
}

export interface OutInPiece {
  fragment: string;   // a phrase pulled from the boundary
  answer: string;     // how you'll answer it inwards
}

export interface DecisionState {
  id: string;
  category: string;

  // step 1
  situation: string;
  // step 2
  objective: string;
  // step 3
  solutions: SolutionPath[];
  chosenSolutionOutcome: number | null; // index of the outcome the user is aiming for
  // step 4
  refine: RefineState;
  // step 5
  abstracted: string;
  timeframe: string;   // e.g. "6 months"
  // step 6
  boundary: string;
  // step 7
  pieces: OutInPiece[];
  combinedSolution: string;

  createdAt: number;
  updatedAt: number;
  step: StepId;
  title?: string; // display title for lists
}

// ─── Mock AI generators (deterministic, instant) ───────────────────────────

const has = (s: string, ...kw: string[]) => kw.some((k) => s.toLowerCase().includes(k));

export function extractObjective(situation: string): string {
  const t = situation.toLowerCase();
  if (!t.trim()) return "";
  if (has(t, "divorce", "spouse", "marriage", "partner"))
    return "Decide whether to stay married or separate.";
  if (has(t, "job", "career", "quit", "promotion"))
    return "Move my career onto a path I actually want.";
  if (has(t, "startup", "business", "launch", "company"))
    return "Start the business full-time.";
  if (has(t, "invest", "stock", "crypto", "property", "real estate"))
    return "Make this investment.";
  if (has(t, "friend", "stingy", "toxic", "argument"))
    return "Stop letting this person's behavior affect me.";
  if (has(t, "kid", "child", "parenting", "school"))
    return "Choose the right path for my child.";
  const first = situation.split(/[.!?]/)[0].trim();
  return `Resolve: ${first}`;
}

export function generateSolutions(situation: string, objective: string): SolutionPath[] {
  const t = (situation + " " + objective).toLowerCase();

  if (has(t, "divorce", "spouse", "marriage")) return [
    { label: "A", title: "Stay happily married", detail: "Real commitment renewed from both sides.",                       desirable: true },
    { label: "B", title: "Stay unhappily married", detail: "Family, kids' health and safety compromised.",                  desirable: false },
    { label: "C", title: "Separate on good terms", detail: "Cooperative co-parenting, financially prepared.",               desirable: true },
    { label: "D", title: "Separate on bad terms", detail: "Legal fight, financial strain, risk to children while dating.",  desirable: false },
  ];
  if (has(t, "career", "job")) return [
    { label: "A", title: "Stay and grow inside", detail: "Advance within current company or field.",     desirable: true  },
    { label: "B", title: "Switch to a growth field", detail: "Retrain into a fast-growing discipline.",  desirable: true  },
    { label: "C", title: "Go independent / found",   detail: "Build a business, accept the risk.",       desirable: true  },
    { label: "D", title: "Drift — no clear move",    detail: "Coast, salary stagnates, options narrow.", desirable: false },
  ];
  if (has(t, "friend")) return [
    { label: "A", title: "Accept them as they are", detail: "Understand their past; stop reacting.",   desirable: true  },
    { label: "B", title: "Talk it out",             detail: "Ask them to change; may not last.",       desirable: false },
    { label: "C", title: "Quietly step away",       detail: "Reduce contact without confrontation.",   desirable: true  },
    { label: "D", title: "Cut them off dramatically", detail: "Ego-driven ending, no closure.",         desirable: false },
  ];
  // generic
  return [
    { label: "A", title: "Hold steady, gather signal", detail: "Lowest disruption; buys time.",              desirable: true  },
    { label: "B", title: "Reform from inside",         detail: "Reversible change while keeping structure.", desirable: true  },
    { label: "C", title: "Clean exit and rebuild",     detail: "Direct path; high short-term cost.",         desirable: true  },
    { label: "D", title: "Do nothing indefinitely",    detail: "Anxiety accumulates; options narrow.",       desirable: false },
  ];
}

const BIAS_LIBRARY: { name: string; reason: string }[] = [
  { name: "Confirmation Bias", reason: "You may be filtering evidence to support a decision you've already made." },
  { name: "Loss Aversion",     reason: "Fear of losing what you have is outweighing potential upside." },
  { name: "Sunk Cost",         reason: "Past time, money, or emotion is anchoring today's choice." },
  { name: "Social Pressure",   reason: "The objective is shaped by how others will judge the outcome." },
  { name: "Status Quo Bias",   reason: "Inertia toward the current state is disguised as preference." },
  { name: "Optimism Bias",     reason: "Best-case outcomes feel more likely than the base rate says." },
  { name: "Ego Protection",    reason: "Self-image is bound to the outcome — admitting error feels costly." },
  { name: "Fear Framing",      reason: "The objective is stated as an escape, not a destination." },
];

export function detectBiases(state: Partial<DecisionState>): BiasCard[] {
  const text = `${state.situation ?? ""} ${state.objective ?? ""} ${state.refine?.negativeOutcomes ?? ""}`.toLowerCase();
  const picks = BIAS_LIBRARY.filter((b) => {
    if (b.name === "Loss Aversion")   return /lose|losing|risk|afraid|scared/.test(text);
    if (b.name === "Sunk Cost")       return /year|invested|spent|gave|already/.test(text);
    if (b.name === "Social Pressure") return /family|friend|people|society|judge/.test(text);
    if (b.name === "Fear Framing")    return /hate|escape|leave|away|stuck/.test(text);
    if (b.name === "Status Quo Bias") return /stay|same|usual|always/.test(text);
    if (b.name === "Optimism Bias")   return /sure|definitely|certain|will work/.test(text);
    if (b.name === "Ego Protection")  return /prove|show|admit|wrong|right/.test(text);
    return true;
  });
  const chosen = (picks.length >= 3 ? picks : BIAS_LIBRARY).slice(0, 5);
  return chosen.map((b, i) => ({ ...b, weight: 0.55 + ((i * 11) % 40) / 100 }));
}

export function abstractObjective(objective: string, situation: string): string {
  const t = (objective + " " + situation).toLowerCase();
  if (has(t, "divorce", "spouse", "marriage"))
    return "For marriage to work, both partners must be compatible, committed, and think about the whole family — not just themselves.";
  if (has(t, "career", "job"))
    return "Track where the field is going, use a strong platform to enter it, and keep the option to build something of your own.";
  if (has(t, "friend"))
    return "Understand what in me reacts, and what in them shaped this behavior — then judge the friendship against the positives that started it.";
  if (has(t, "investment", "invest"))
    return "Long-term financial security that lets me decide from strength, not pressure — matched to my risk tolerance and horizon.";
  return "Reach an outcome I will still endorse five years from now, judged against the life I actually want to live.";
}

export function suggestTimeframe(situation: string): string {
  const t = situation.toLowerCase();
  if (has(t, "divorce", "marriage", "career", "job")) return "6 months";
  if (has(t, "invest", "business")) return "12 months";
  return "3 months";
}

export function generateBoundary(abstracted: string, timeframe: string): string {
  const stem = abstracted.replace(/\.$/, "");
  return `${stem}. Monitor for the next ${timeframe} for signals, and prepare yourself emotionally and financially if signals turn negative.`;
}

// Split boundary into 3–6 "pieces" (fragments) the user answers inwards.
export function splitBoundary(boundary: string): OutInPiece[] {
  // Break on commas and coordinating conjunctions after a comma, keep 3–6 pieces.
  const raw = boundary
    .replace(/\s+/g, " ")
    .split(/,(?=\s)|\.(?=\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pieces = raw.length >= 3 ? raw : boundary.split(/\band\b|\bor\b/i).map((s) => s.trim()).filter(Boolean);
  return pieces.slice(0, 6).map((fragment) => ({ fragment, answer: "" }));
}

export function suggestPieceAnswer(fragment: string): string {
  const f = fragment.toLowerCase();
  if (f.includes("compatible") || f.includes("committed"))
    return "Sit together weekly. Write what each of you needs and would give up. Measure by whether both feel free, not policed.";
  if (f.includes("monitor") || f.includes("signal"))
    return "Define 3 concrete signals (frequency of fights, kids' mood, willingness to try). Rate monthly.";
  if (f.includes("prepare") || f.includes("financially") || f.includes("emotion"))
    return "Build the emotional and financial base you'd need if the answer turns out to be exit: savings, support network, therapy.";
  if (f.includes("growth") || f.includes("industry") || f.includes("field"))
    return "Study the top 5 companies emerging in the space. Follow their hiring, their tooling, their customers.";
  if (f.includes("university") || f.includes("school"))
    return "Identify programs with placement into that field. Talk to 3 alumni before applying.";
  if (f.includes("entrepreneur"))
    return "Study one founder story per week. Run one small revenue experiment before quitting anything.";
  return "Break this fragment into a concrete action, a way to measure it, and a date. Nothing outside that.";
}

export function combineAnswers(pieces: OutInPiece[]): string {
  const filled = pieces.filter((p) => p.answer.trim());
  if (!filled.length) return "";
  return filled.map((p, i) => `${i + 1}. ${p.answer.trim()}`).join("\n");
}

// ─── Persistence ───────────────────────────────────────────────────────────

const KEY = "ooi.decisions.v2";

export function loadDecisions(): DecisionState[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function saveDecision(d: DecisionState) {
  const all = loadDecisions().filter((x) => x.id !== d.id);
  all.unshift({ ...d, updatedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
}

export function newDecision(category = "Personal Growth"): DecisionState {
  return {
    id: `dec_${Date.now().toString(36)}`,
    category,
    situation: "",
    objective: "",
    solutions: [],
    chosenSolutionOutcome: null,
    refine: { negativeOutcomes: "", fearsFaced: "", biases: [], egoCheck: "" },
    abstracted: "",
    timeframe: "6 months",
    boundary: "",
    pieces: [],
    combinedSolution: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    step: "situation",
  };
}

export function decisionTitle(d: DecisionState): string {
  return d.title || d.abstracted || d.objective || d.situation.slice(0, 90) || "Untitled decision";
}

export function isComplete(d: DecisionState): boolean {
  return d.step === "outin" && d.combinedSolution.trim().length > 0;
}
