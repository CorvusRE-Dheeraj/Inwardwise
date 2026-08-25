import { describe, expect, it } from "vitest";
import {
  buildMiOpening,
  buildMiSystemPrompt,
  MI_FILTER,
  MI_MAX_ROUNDS,
  MI_PRIVACY_NOTICE,
  MI_SAFETY,
} from "@/lib/mi-filter";
import { OOOI_SYSTEM_PROMPT } from "@/lib/ooi-system-prompt";

const prompt = buildMiSystemPrompt({
  targetQuestion: "Growing up, between the ages of five and fifteen, what were your real fears?",
  context: "Factor One — what the person suppresses or hides.",
});

/** The ten supporting filters, each keyed by phrases that must survive any prompt edit. */
const TEN_FILTERS: Array<[string, RegExp[]]> = [
  ["Rapport (Carnegie)", [/no criticism, condemnation or blame/i, /never say "you are wrong"/i]],
  ["Motivational interviewing core (QARS/OARS)", [/QARS \/ OARS/i, /cultivate change talk/i]],
  ["Tactical empathy", [/label likely emotions/i, /calibrated what\/how\s+questions/i]],
  ["Active listening", [/separate facts, emotions, needs/i, /still explaining/i]],
  ["Non-violent communication", [/separate observation from judgement/i, /requests not demands/i]],
  ["Ethical influence (Cialdini)", [/never fabricate scarcity, social proof/i]],
  ["Emotional intelligence", [/open↔defensive/i, /If confusion rises, simplify/i]],
  ["Socratic", [/examine assumptions/i, /without turning it into an interrogation/i]],
  ["Bias detection", [/sunk cost/i, /Never announce a bias/i]],
  ["Face and autonomy", [/Never win the argument while losing the person/i, /graceful way/i]],
];

/** The master filter loop, in order. */
const MASTER_LOOP = [
  "1. LISTEN",
  "2. INFER",
  "3. OBJECTIVE",
  "4. RESISTANCE",
  "5. CHOOSE TECHNIQUE",
  "6. PROTECT AUTONOMY",
  "7. RESPOND",
  "8. LEARN",
];

describe("MI filter — ten supporting filters", () => {
  it.each(TEN_FILTERS)("%s is present in the filter", (_name, patterns) => {
    for (const p of patterns) expect(MI_FILTER).toMatch(p);
  });

  it("reaches the interviewer system prompt", () => {
    for (const [, patterns] of TEN_FILTERS) {
      for (const p of patterns) expect(prompt).toMatch(p);
    }
  });

  it("reaches the decision facilitator system prompt", () => {
    for (const [, patterns] of TEN_FILTERS) {
      for (const p of patterns) expect(OOOI_SYSTEM_PROMPT).toMatch(p);
    }
  });
});

describe("MI filter — eight-step master loop", () => {
  it("contains all eight steps", () => {
    for (const step of MASTER_LOOP) expect(MI_FILTER).toContain(step);
  });

  it("keeps the steps in order", () => {
    const positions = MASTER_LOOP.map((s) => MI_FILTER.indexOf(s));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("is carried into both agent prompts", () => {
    for (const step of MASTER_LOOP) {
      expect(prompt).toContain(step);
      expect(OOOI_SYSTEM_PROMPT).toContain(step);
    }
  });
});

describe("MI filter — hard rules and safety", () => {
  it("forbids advising, lecturing, diagnosis, moralising and emojis", () => {
    for (const rule of ["No advising", "no lecturing", "no diagnosis", "no moralising", "no emojis"]) {
      expect(MI_FILTER).toContain(rule);
    }
  });

  it("caps reply length and requires exactly one question", () => {
    expect(MI_FILTER).toMatch(/at most 2-4 sentences, ending in ONE question/i);
  });

  it("never reveals the framework or the internal target question", () => {
    expect(MI_FILTER).toMatch(/Never reveal the underlying framework/i);
  });

  it("embeds the target question and context without exposing them verbatim", () => {
    expect(prompt).toContain("what were your real fears?");
    expect(prompt).toMatch(/never quote it verbatim/i);
    expect(prompt).toContain("Factor One");
  });

  it("carries the crisis protocol with 988 and emergency escalation", () => {
    expect(MI_SAFETY).toContain("988");
    expect(MI_SAFETY).toContain("911");
    expect(MI_SAFETY).toMatch(/set crisis to true/i);
    expect(prompt).toContain(MI_SAFETY);
  });

  it("asks for the structured JSON contract the UI consumes", () => {
    for (const field of ["reply", "satisfied", "captured_answer", "resistance", "crisis"]) {
      expect(prompt).toContain(`"${field}"`);
    }
  });

  it("offers a privacy notice that promises confidentiality with a safety exception", () => {
    expect(MI_PRIVACY_NOTICE).toMatch(/as much or as little as you choose/i);
    expect(MI_PRIVACY_NOTICE).toMatch(/safety/i);
  });

  it("bounds the interview length", () => {
    expect(MI_MAX_ROUNDS).toBeGreaterThan(1);
    expect(MI_MAX_ROUNDS).toBeLessThanOrEqual(20);
  });
});

describe("MI filter — openings for common user inputs", () => {
  it("uses the gentle opening when one is supplied", () => {
    const opening = buildMiOpening({
      targetQuestion: "What were your real fears?",
      openingQuestion: "Tell me what you liked and did not like growing up.",
    });
    expect(opening).toBe("Tell me what you liked and did not like growing up.");
  });

  it("falls back to an open, non-closed question", () => {
    const opening = buildMiOpening({ targetQuestion: "What are your vices?" });
    expect(opening).not.toMatch(/^(do|did|are|is|was|were|have|has|can|would|will) /i);
    expect(opening.length).toBeGreaterThan(30);
  });
});
