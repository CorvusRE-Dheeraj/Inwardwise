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

describe("everyday phrases do not trigger the crisis banner", () => {
  const benign = [
    "I get a panic attack before every board meeting",
    "My father had a heart attack last year",
    "He attacked my proposal in front of the whole team",
    "The company is bleeding money and I must decide",
    "My job is in danger if I speak up",
    "This deal is in danger of falling apart",
  ];
  for (const t of benign) {
    it(`stays quiet for: ${t}`, () => {
      expect(detectCrisis(t)).toEqual([]);
    });
  }
});
