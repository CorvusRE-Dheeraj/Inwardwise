import { describe, expect, it } from "vitest";
import { STAGE_REWARDS } from "@/lib/stage-rewards";
import { psychGameById } from "@/lib/psych-games";
import { GAMES } from "@/lib/self-games";

describe("stage rewards", () => {
  it("every stage 1-5 offers both psychology and language games", () => {
    for (const s of [1, 2, 3, 4, 5]) {
      expect(STAGE_REWARDS[s].psychology.length).toBeGreaterThan(0);
      expect(STAGE_REWARDS[s].language.length).toBeGreaterThan(0);
    }
  });
  it("no game repeats across stages", () => {
    const all = Object.values(STAGE_REWARDS).flatMap((r) => [...r.psychology, ...r.language]);
    expect(new Set(all).size).toBe(all.length);
  });
  it("all mapped games exist", () => {
    for (const r of Object.values(STAGE_REWARDS)) {
      r.psychology.forEach((id) => expect(psychGameById(id)).toBeDefined());
      r.language.forEach((k) => expect(GAMES.some((g) => g.key === k)).toBe(true));
    }
  });
});
