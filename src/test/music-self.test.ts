import { describe, expect, it } from "vitest";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import {
  MUSIC_SELF_ANSWER_MAX,
  MUSIC_SELF_STAGES,
  MUSIC_SELF_TOTAL_MAX,
  buildMusicSelfProfile,
} from "@/lib/music-self";
import { buildSongMessages } from "@/lib/connect-music.server";

/** A made-up member, "Ravi". Not a real person's answers. */
function keysOf(n: number): string[] {
  return AVATAR_DIMENSIONS.find((d) => d.n === n)!.questions.map((q) => q.key);
}
const RAVI: Record<string, string> = {
  [keysOf(5)[0]!]:
    "My father worked abroad for most of my childhood. We rarely talk now, and I miss him more than I say.",
  [keysOf(4)[0]!]:
    "Old Telugu film songs on Sunday mornings, temple bhajans with my mother, cricket with friends.",
  [keysOf(3)[0]!]: "I taught myself guitar at fourteen and play every evening.",
  [keysOf(2)[0]!]: "SECRET-HABIT: I procrastinate and scroll late into the night.",
  [keysOf(1)[0]!]: "Growing up in Vijayawada in the 90s, I was afraid of letting my family down.",
};

describe("buildMusicSelfProfile", () => {
  it("uses Getting Started, Exploring, Understanding and Bringing It Together, in journey order", () => {
    const profile = buildMusicSelfProfile(RAVI)!;
    expect(profile.stages).toEqual([
      "Getting Started",
      "Exploring",
      "Understanding",
      "Bringing It Together",
    ]);
    expect(profile.text).toContain("My father worked abroad");
    expect(profile.text).toContain("Old Telugu film songs");
  });

  it("never includes the private Reflecting stage", () => {
    const profile = buildMusicSelfProfile(RAVI)!;
    expect(profile.stages).not.toContain("Reflecting");
    expect(profile.text).not.toContain("SECRET-HABIT");
    expect(MUSIC_SELF_STAGES).not.toContain("Reflecting");
  });

  it("returns nothing when only Reflecting is answered, or nothing at all", () => {
    expect(buildMusicSelfProfile({})).toBeNull();
    expect(buildMusicSelfProfile({ [keysOf(2)[0]!]: "only private habits" })).toBeNull();
  });

  it("never shows internal factor names", () => {
    const text = buildMusicSelfProfile(RAVI)!.text;
    expect(text).not.toMatch(/Factor|Shadow|Enemy/);
  });

  it("trims long answers and the whole profile", () => {
    const long = Object.fromEntries(
      [1, 3, 4, 5].flatMap((n) => keysOf(n).map((k) => [k, "word ".repeat(400)])),
    );
    const profile = buildMusicSelfProfile(long)!;
    expect(profile.text.length).toBeLessThanOrEqual(MUSIC_SELF_TOTAL_MAX);
    for (const line of profile.text.split("\n").filter((l) => l.startsWith("A: "))) {
      expect(line.length).toBeLessThanOrEqual(MUSIC_SELF_ANSWER_MAX + 3);
    }
  });
});

describe("buildSongMessages", () => {
  it("adds the Self and its privacy rules only when the member shares it", () => {
    const plain = buildSongMessages("express", "Sad", "I've been thinking about my father.");
    expect(plain[0]!.content).not.toContain("Self Journey");
    expect(plain[1]!.content).not.toContain("WHO THEY ARE");

    const profile = buildMusicSelfProfile(RAVI)!;
    const tuned = buildSongMessages(
      "express",
      "Sad",
      "I've been thinking about my father.",
      profile.text,
    );
    expect(tuned[0]!.content).toContain("Self Journey");
    expect(tuned[0]!.content).toContain("never quote their answers");
    expect(tuned[1]!.content).toContain("WHO THEY ARE");
    expect(tuned[1]!.content).toContain("Old Telugu film songs");
    expect(tuned[1]!.content).not.toContain("SECRET-HABIT");
  });
});

describe("suggestions with the Self but no note", () => {
  it("asks the AI to rely on the feeling and the Self", () => {
    const profile = buildMusicSelfProfile(RAVI)!;
    const msgs = buildSongMessages("discover", "Sad", "", profile.text);
    expect(msgs[1]!.content).toContain("not written — rely on their feeling and who they are");
    expect(msgs[1]!.content).toContain("WHO THEY ARE");
  });
});

describe("songs from the Self alone (no feeling, no note)", () => {
  it("asks the AI to choose purely from who they are", () => {
    const profile = buildMusicSelfProfile(RAVI)!;
    const msgs = buildSongMessages("discover", null, "", profile.text);
    expect(msgs[0]!.content).toContain(
      "choose songs purely from who they are".replace("choose", "Choose"),
    );
    expect(msgs[0]!.content).not.toContain("The feeling is one of");
    expect(msgs[1]!.content).toContain("Feeling: (not given — choose from who they are)");
    expect(msgs[1]!.content).toContain("WHO THEY ARE");
  });

  it("falls back to a gentle general mix without the AI", async () => {
    const { suggestSongsFor } = await import("@/lib/connect-music.server");
    const saved = process.env["LOVABLE_API_KEY"];
    delete process.env["LOVABLE_API_KEY"];
    try {
      const res = await suggestSongsFor("discover", null, "", buildMusicSelfProfile(RAVI)!.text);
      expect(res.source).toBe("picks");
      expect(res.songs).toHaveLength(4);
      for (const s of res.songs) expect(s.title && s.artist && s.why).toBeTruthy();
    } finally {
      if (saved !== undefined) process.env["LOVABLE_API_KEY"] = saved;
    }
  });
});
