// Mock AI engine for the OOOI (Objective-Oriented Out-In) framework.
// Replace these pure functions with real streaming AI calls later.

export type StageId =
  | "situation"
  | "pseudo"
  | "challenge"
  | "biases"
  | "higher"
  | "boundary"
  | "goals"
  | "options"
  | "simulation"
  | "commit";

export const STAGES: { id: StageId; index: number; label: string; short: string }[] = [
  { id: "situation", index: 1, label: "Situation", short: "What happened" },
  { id: "pseudo", index: 2, label: "Pseudo Objective", short: "Surface intent" },
  { id: "challenge", index: 3, label: "Challenge", short: "Question it" },
  { id: "biases", index: 4, label: "Biases", short: "Hidden forces" },
  { id: "higher", index: 5, label: "Higher Objective", short: "Reframe" },
  { id: "boundary", index: 6, label: "Boundary", short: "Scope" },
  { id: "goals", index: 7, label: "Goals", short: "Break down" },
  { id: "options", index: 8, label: "Paths", short: "Branches" },
  { id: "simulation", index: 9, label: "Simulation", short: "Project forward" },
  { id: "commit", index: 10, label: "Commit", short: "Opt-in" },
];

export const CATEGORIES = [
  "Relationship", "Marriage", "Parenting", "Career", "Business", "Finance",
  "Investment", "Education", "Medical", "Legal", "Lifestyle", "Friendship",
  "Retirement", "Entrepreneurship", "AI Decisions", "Ethics", "Personal Growth",
  "Mental Health", "Leadership", "Real Estate", "Technology",
];

export interface BiasCard {
  name: string;
  reason: string;
  weight: number; // 0..1
}

export interface Goal {
  title: string;
  purpose: string;
  criteria: string;
  measurement: string;
  timeframe: string;
}

export interface Option {
  label: string;
  title: string;
  advantages: string[];
  disadvantages: string[];
  risks: string[];
  probability: number;
  stakeholders: string[];
}

export interface Simulation {
  horizon: "1 month" | "1 year" | "5 years";
  emotion: string;
  financial: string;
  relationships: string;
  career: string;
  health: string;
}

export interface DecisionState {
  id: string;
  category: string;
  situation: string;
  pseudoObjective: string;
  challengeAnswers: Record<string, string>;
  biases: BiasCard[];
  higherObjective: string;
  boundary: string;
  goals: Goal[];
  options: Option[];
  chosenOption: number | null;
  simulations: Simulation[];
  regret: number;
  confidence: number;
  commitment: string;
  createdAt: number;
  updatedAt: number;
  stage: StageId;
}

export const CHALLENGE_QUESTIONS = [
  "Why this objective — and why now?",
  "Would your 60-year-old self choose the same?",
  "Is this driven by fear, ego, or social pressure?",
  "What assumptions are hidden inside this objective?",
  "Could a better objective exist that you haven't named?",
];

const BIAS_LIBRARY: { name: string; reason: string }[] = [
  { name: "Confirmation Bias", reason: "You may be filtering for evidence that supports a decision already made." },
  { name: "Loss Aversion", reason: "The fear of losing what you have is likely outweighing potential upside." },
  { name: "Sunk Cost", reason: "Past investment of time, money, or emotion is anchoring the current choice." },
  { name: "Social Pressure", reason: "The objective seems shaped by how others will perceive the outcome." },
  { name: "Status Quo Bias", reason: "Inertia toward the current state may be disguised as preference." },
  { name: "Optimism Bias", reason: "Best-case outcomes feel more likely than the base rate suggests." },
  { name: "Ego Protection", reason: "Self-image is bound up in the outcome — admitting error feels costly." },
  { name: "Fear Framing", reason: "The objective is described as an escape, not a destination." },
];

// --- Pseudo "AI" transforms (deterministic, instant) -----------------------

export function extractPseudoObjective(situation: string): string {
  const t = situation.toLowerCase();
  if (!t.trim()) return "I want to make a clear decision.";
  if (/(hate|miser|stuck).*(job|work|career)/.test(t)) return "I want to leave my current job.";
  if (/(divorce|marriage|spouse|partner)/.test(t)) return "I want to leave my marriage.";
  if (/(start|launch|build).*(business|company|startup)/.test(t)) return "I want to start a business.";
  if (/(invest|stock|crypto|real estate)/.test(t)) return "I want to make this investment.";
  if (/(move|relocate|country|city)/.test(t)) return "I want to relocate.";
  // Fallback: first sentence framed as intent.
  const first = situation.split(/[.!?]/)[0].trim();
  return `I want to resolve: ${first}`;
}

export function detectBiases(state: Partial<DecisionState>): BiasCard[] {
  const text = `${state.situation ?? ""} ${state.pseudoObjective ?? ""} ${Object.values(state.challengeAnswers ?? {}).join(" ")}`.toLowerCase();
  const picks = BIAS_LIBRARY.filter((b) => {
    if (b.name === "Loss Aversion") return /lose|losing|risk|afraid|scared/.test(text);
    if (b.name === "Sunk Cost") return /years|invested|spent|gave|already/.test(text);
    if (b.name === "Social Pressure") return /family|friends|people|society|judge/.test(text);
    if (b.name === "Fear Framing") return /hate|escape|leave|away|stuck/.test(text);
    if (b.name === "Status Quo Bias") return /stay|same|usual|always/.test(text);
    if (b.name === "Optimism Bias") return /sure|definitely|certain|will work/.test(text);
    if (b.name === "Ego Protection") return /prove|show|admit|wrong/.test(text);
    return true; // Confirmation bias — almost always present
  });
  const chosen = (picks.length >= 4 ? picks : BIAS_LIBRARY).slice(0, 6);
  return chosen.map((b, i) => ({ ...b, weight: 0.55 + ((i * 7) % 35) / 100 }));
}

export function generateHigherObjective(pseudo: string): string {
  const p = pseudo.toLowerCase();
  if (p.includes("leave my marriage") || p.includes("divorce"))
    return "I want a healthy, stable life where both adults and the children can thrive emotionally.";
  if (p.includes("leave my current job") || p.includes("job"))
    return "I want work that funds the life I value and uses what I'm good at — without trading my health for it.";
  if (p.includes("start a business"))
    return "I want meaningful, self-directed work that compounds into financial and creative freedom.";
  if (p.includes("investment"))
    return "I want long-term financial security that lets me make decisions from strength, not pressure.";
  if (p.includes("relocate"))
    return "I want a daily environment that supports the relationships, work and health I care about most.";
  return "I want an outcome that I'll still endorse five years from now, judged by the life I actually want to live.";
}

export function generateBoundary(higher: string): string {
  return `Identify whether the conditions exist to ${higher.replace(/^I want /i, "achieve ").replace(/\.$/, "")} — protecting wellbeing, key relationships, and financial stability while exploring it.`;
}

export function generateGoals(higher: string): Goal[] {
  const base = higher.replace(/^I want /i, "").replace(/\.$/, "");
  return [
    { title: "Clarify the real success criteria", purpose: `Define what "${base}" actually looks like in daily life.`, criteria: "A written list of 5 concrete observable signals.", measurement: "Pass / fail per signal monthly.", timeframe: "2 weeks" },
    { title: "Map current state honestly", purpose: "Document where you actually stand today on each criterion.", criteria: "Baseline scored 1–10 across all dimensions.", measurement: "Self-rating + one outside perspective.", timeframe: "1 week" },
    { title: "Identify non-negotiables", purpose: "Surface what must be preserved regardless of the path chosen.", criteria: "A list of 3–5 hard constraints.", measurement: "Each constraint testable as yes/no.", timeframe: "1 week" },
    { title: "Run a low-cost experiment", purpose: "Test the most uncertain assumption cheaply before committing.", criteria: "One reversible action taken with a defined success bar.", measurement: "Outcome vs. predicted outcome.", timeframe: "30 days" },
    { title: "Decide and document", purpose: "Convert insight into a committed choice with a written rationale.", criteria: "Signed decision log + 30-day review scheduled.", measurement: "Was the decision made on time and on principle.", timeframe: "60 days" },
  ];
}

export function generateOptions(higher: string): Option[] {
  return [
    { label: "A", title: "Hold steady & strengthen", advantages: ["Lowest disruption", "Preserves existing assets", "Time to gather information"], disadvantages: ["Slow progress on the higher objective", "Risk of avoidance disguised as patience"], risks: ["Status quo bias hardens into permanence"], probability: 0.6, stakeholders: ["You", "Immediate family"] },
    { label: "B", title: "Reform from inside", advantages: ["Keeps relationships intact", "Reversible", "Tests the system before exiting"], disadvantages: ["Slow", "Requires buy-in from others"], risks: ["Reform fatigue if no early wins"], probability: 0.45, stakeholders: ["You", "Partners / colleagues"] },
    { label: "C", title: "Clean exit & rebuild", advantages: ["Direct path", "Removes ambiguity", "Frees energy"], disadvantages: ["High short-term cost", "Difficult to reverse"], risks: ["Underestimating the rebuild phase"], probability: 0.3, stakeholders: ["You", "Family", "Dependents"] },
    { label: "D", title: "Postpone with a deadline", advantages: ["Buys decision quality", "Forces a date"], disadvantages: ["Costs accumulate", "Anxiety remains"], risks: ["Deadline silently slips"], probability: 0.5, stakeholders: ["You"] },
  ];
}

export function simulate(option: Option, higher: string): Simulation[] {
  const tone = option.label === "C" ? "intense" : option.label === "A" ? "muted" : "mixed";
  const make = (h: Simulation["horizon"]): Simulation => ({
    horizon: h,
    emotion: tone === "intense" ? (h === "1 month" ? "Relief mixed with grief" : "Steady, with periodic regret spikes") : tone === "muted" ? "Stable but quietly unresolved" : "Energized, with friction",
    financial: option.label === "C" ? (h === "5 years" ? "Recovered if rebuild executes" : "Short-term hit") : "Manageable",
    relationships: option.label === "B" ? "Strained then renegotiated" : option.label === "C" ? "Some bonds lost, others deepened" : "Largely unchanged",
    career: option.label === "C" || option.label === "B" ? "Resets toward the higher objective" : "Drifts",
    health: option.label === "A" ? "At risk of accumulated stress" : "Improves once direction is clear",
  });
  return [make("1 month"), make("1 year"), make("5 years")];
}

export function scoreRegret(option: Option | null): number {
  if (!option) return 0;
  // Lower probability paths → higher regret risk
  return Math.round((1 - option.probability) * 70 + 10);
}
export function scoreConfidence(option: Option | null): number {
  if (!option) return 0;
  return Math.round(option.probability * 80 + 15);
}

// --- Local persistence -----------------------------------------------------

const KEY = "ooi.decisions.v1";

export function loadDecisions(): DecisionState[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
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
    pseudoObjective: "",
    challengeAnswers: {},
    biases: [],
    higherObjective: "",
    boundary: "",
    goals: [],
    options: [],
    chosenOption: null,
    simulations: [],
    regret: 0,
    confidence: 0,
    commitment: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stage: "situation",
  };
}
