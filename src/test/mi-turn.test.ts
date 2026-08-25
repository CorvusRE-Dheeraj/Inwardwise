import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MiTurnInputSchema, runMiTurn, type MiTurnInput } from "@/lib/mi-turn";
import { MI_MAX_ROUNDS } from "@/lib/mi-filter";

type GatewayCall = { system: string; messages: Array<{ role: string; content: string }> };

const calls: GatewayCall[] = [];

function mockGateway(payload: Record<string, unknown>, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: { body: string }) => {
      const body = JSON.parse(init.body) as { messages: Array<{ role: string; content: string }> };
      calls.push({ system: body.messages[0]!.content, messages: body.messages });
      return {
        ok: status === 200,
        status,
        json: async () => ({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
        text: async () => JSON.stringify(payload),
      } as unknown as Response;
    }),
  );
}

const turn = (over: Partial<MiTurnInput> = {}) =>
  runMiTurn(
    MiTurnInputSchema.parse({
      targetQuestion: "Growing up, what were your real fears?",
      context: "Factor One",
      round: 1,
      transcript: [{ role: "user", content: "I was scared of my father's temper." }],
      ...over,
    }),
    "test-key",
  );

beforeEach(() => {
  calls.length = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});


describe("MI interview turn — filters reach the model", () => {
  it("sends the ten supporting filters and the eight-step loop in the system prompt", async () => {
    mockGateway({ reply: "That took strength to say. What did that fear make you do?", satisfied: false, captured_answer: "", resistance: "none", crisis: false });
    await turn();
    const system = calls[0]!.system;
    for (const marker of [
      "no criticism, condemnation or blame",
      "label likely emotions",
      "separate facts, emotions, needs",
      "separate observation from judgement",
      "never fabricate scarcity",
      "If confusion rises, simplify",
      "examine assumptions",
      "Never announce a bias",
      "Never win the argument while losing the person",
      "cultivate change talk",
    ]) {
      expect(system).toContain(marker);
    }
    for (const step of ["1. LISTEN", "2. INFER", "3. OBJECTIVE", "4. RESISTANCE", "5. CHOOSE TECHNIQUE", "6. PROTECT AUTONOMY", "7. RESPOND", "8. LEARN"]) {
      expect(system).toContain(step);
    }
  });
});

describe("MI interview turn — common user inputs", () => {
  it("keeps a substantive answer and reports it as captured", async () => {
    mockGateway({
      reply: "It sounds like the house never felt predictable — is that right?",
      satisfied: true,
      captured_answer: "I was most afraid of my father's unpredictable temper.",
      resistance: "none",
      crisis: false,
    });
    const res = await turn();
    expect(res.satisfied).toBe(true);
    expect(res.capturedAnswer).toContain("temper");
    expect(res.crisis).toBe(false);
    expect(res.roundsLeft).toBe(MI_MAX_ROUNDS - 1);
  });

  it("flags ambivalence without treating it as an answer", async () => {
    mockGateway({
      reply: "Part of you wants to say it and part of you would rather not. What feels risky about it?",
      satisfied: false,
      captured_answer: "",
      resistance: "ambivalent",
      crisis: false,
    });
    const res = await turn({ round: 2, transcript: [{ role: "user", content: "I don't know, maybe nothing." }] });
    expect(res.resistance).toBe("ambivalent");
    expect(res.satisfied).toBe(false);
    expect(res.capturedAnswer).toBe("");
  });

  it("normalises an unrecognised resistance value to none", async () => {
    mockGateway({ reply: "Tell me more about that.", satisfied: false, captured_answer: "", resistance: "hostile", crisis: false });
    const res = await turn();
    expect(res.resistance).toBe("none");
  });

  it("raises the crisis flag when the person signals danger", async () => {
    mockGateway({
      reply: "Thank you for telling me. Are you safe right now?",
      satisfied: false,
      captured_answer: "",
      resistance: "none",
      crisis: true,
    });
    const res = await turn({ transcript: [{ role: "user", content: "Honestly I have thought about ending it." }] });
    expect(res.crisis).toBe(true);
  });

  it("closes out on the final round even if the model does not say satisfied", async () => {
    mockGateway({ reply: "Here is what I heard from you today.", satisfied: false, captured_answer: "Some of it.", resistance: "none", crisis: false });
    const res = await turn({ round: MI_MAX_ROUNDS });
    expect(res.satisfied).toBe(true);
    expect(res.roundsLeft).toBe(0);
    const closing = calls[0]!.messages.at(-1)!.content;
    expect(closing).toMatch(/final round/i);
  });

  it("falls back to an open question when the model returns unusable content", async () => {
    mockGateway({});
    const res = await turn();
    expect(res.reply).toMatch(/\?$/);
    expect(res.reply.length).toBeGreaterThan(10);
  });

  it("rejects a closed-question-only transcript shape that is empty", async () => {
    mockGateway({ reply: "ok" });
    await expect(turn({ transcript: [] })).rejects.toThrow();
  });

  it("surfaces a clear message when the workspace has no AI credits", async () => {
    mockGateway({ error: "no credits" }, 402);
    await expect(turn()).rejects.toThrow(/credits/i);
  });

  it("surfaces a clear message when rate limited", async () => {
    mockGateway({ error: "slow down" }, 429);
    await expect(turn()).rejects.toThrow(/Too many requests/i);
  });
});
