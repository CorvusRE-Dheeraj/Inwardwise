import { describe, expect, it } from "vitest";
import { detectCrisis, detectCrisisInMessages } from "@/lib/crisis-detect";

describe("deterministic crisis detection", () => {
  it("flags the assault + unsafe opening from a real session", () => {
    const c = detectCrisis("Someone assaulted me and I'm not safe right now.");
    expect(c).toContain("imminent_danger");
  });

  it("flags sexual assault", () => {
    expect(detectCrisis("I was sexually assaulted at school")).toContain("sexual_assault");
  });

  it("flags domestic violence", () => {
    expect(detectCrisis("My partner hits me and I am scared")).toContain("domestic_violence");
  });

  it("flags suicide with plan as imminent danger too", () => {
    const c = detectCrisis("I have a plan to end my life tonight");
    expect(c).toEqual(expect.arrayContaining(["suicide", "imminent_danger"]));
  });

  it("does not flag an ordinary decision", () => {
    expect(detectCrisis("Should I take a pay cut for a job I love?")).toEqual([]);
  });

  it("does not treat an identity mention alone as a crisis", () => {
    expect(detectCrisis("I am gay and deciding whether to move cities")).toEqual([]);
  });

  it("accumulates across a transcript", () => {
    const c = detectCrisisInMessages([
      "Someone assaulted me",
      "person is nearby",
      "I need medical aid too",
    ]);
    expect(c).toContain("imminent_danger");
  });
});
