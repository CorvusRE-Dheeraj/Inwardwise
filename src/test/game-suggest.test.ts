import { describe, expect, it } from "vitest";
import {
  buildSuggestMessages,
  parseSuggestions,
} from "../../supabase/functions/_shared/game-suggest.ts";

describe("parseSuggestions", () => {
  it("reads a JSON array, even inside a code fence", () => {
    expect(parseSuggestions("words", '```json\n["calm", "tired"]\n```')).toEqual(["calm", "tired"]);
  });

  it("falls back to a plain list and strips bullets and quotes", () => {
    expect(parseSuggestions("themes", '- "Finding my feet"\n- Starting over')).toEqual([
      "Finding my feet",
      "Starting over",
    ]);
  });

  it("caps words at 5 and themes at 4", () => {
    const many = JSON.stringify(["a", "b", "c", "d", "e", "f"]);
    expect(parseSuggestions("words", many)).toHaveLength(5);
    expect(parseSuggestions("themes", many)).toHaveLength(4);
  });

  it("drops empty items and clips long ones", () => {
    const out = parseSuggestions("words", JSON.stringify(["", "x".repeat(80)]));
    expect(out).toEqual(["x".repeat(60)]);
  });
});

describe("buildSuggestMessages", () => {
  it("asks for a JSON array and clips the member's text", () => {
    const [system, user] = buildSuggestMessages("words", "y".repeat(4000));
    expect(system.content).toContain("JSON array");
    expect(user.content).toHaveLength(3000);
  });
});
