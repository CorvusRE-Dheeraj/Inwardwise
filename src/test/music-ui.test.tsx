import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SongLinks, SongHeading } from "@/components/connect/music/SongLinks";
import { suggestSongsFor } from "@/lib/connect-music.server";

describe("SongLinks", () => {
  it("shows the member's own link first, labelled by service, opening in a new tab", () => {
    render(
      <SongLinks
        song={{ title: "Fix You", artist: "Coldplay", url: "https://youtu.be/k4V3Mo61fJM" }}
      />,
    );
    const own = screen.getByRole("link", { name: /open in youtube/i });
    expect(own.getAttribute("href")).toBe("https://youtu.be/k4V3Mo61fJM");
    expect(own.getAttribute("target")).toBe("_blank");
    expect(own.getAttribute("rel")).toContain("noopener");
    // A YouTube link of their own replaces the YouTube search; Spotify search stays.
    expect(screen.queryByRole("link", { name: /find on youtube/i })).toBeNull();
    expect(screen.getByRole("link", { name: /find on spotify/i })).toBeTruthy();
  });

  it("offers Spotify and YouTube searches when there is no link", () => {
    render(<SongLinks song={{ title: "Holocene", artist: "Bon Iver" }} />);
    expect(screen.getByRole("link", { name: /find on spotify/i }).getAttribute("href")).toContain(
      "open.spotify.com/search/Holocene%20Bon%20Iver",
    );
    expect(screen.getByRole("link", { name: /find on youtube/i }).getAttribute("href")).toContain(
      "youtube.com/results?search_query=Holocene%20Bon%20Iver",
    );
  });

  it("never renders an unsafe stored link", () => {
    render(<SongLinks song={{ title: "X", artist: "Y", url: "javascript:alert(1)" }} />);
    for (const a of screen.getAllByRole("link")) {
      expect(a.getAttribute("href")?.startsWith("https://")).toBe(true);
    }
    expect(screen.queryByRole("link", { name: /open/i })).toBeNull();
  });
});

describe("SongHeading", () => {
  it("shows the song name and the artist", () => {
    render(<SongHeading song={{ title: "At Last", artist: "Etta James" }} />);
    expect(screen.getByText("At Last")).toBeTruthy();
    expect(screen.getByText("Etta James")).toBeTruthy();
  });
});

describe("suggestSongsFor without an AI key", () => {
  it("falls back to real picks for the feeling, each with a reason", async () => {
    const saved = process.env["LOVABLE_API_KEY"];
    delete process.env["LOVABLE_API_KEY"];
    try {
      const res = await suggestSongsFor("express", "Sad", "I've been thinking about my father.");
      expect(res.source).toBe("picks");
      expect(res.songs.length).toBeGreaterThanOrEqual(3);
      for (const s of res.songs) {
        expect(s.title && s.artist && s.why).toBeTruthy();
      }
    } finally {
      if (saved !== undefined) process.env["LOVABLE_API_KEY"] = saved;
    }
  });
});

describe("A Song for This Moment prompts", () => {
  it("fits each Connect page", async () => {
    const { MOMENT_PROMPTS } = await import("@/components/connect/music/SongForThisMoment");
    expect(MOMENT_PROMPTS).toEqual({
      journal: "Would you like to capture this thought with a song?",
      share: "Can't find the words? Send a song.",
      belonging: "Find music that reminds you that others have felt this too.",
      oneness: "Explore music that makes the world feel bigger.",
      membership: "Share a song that represents what you're going through.",
    });
    // The first import pulls in the Supabase client, which can be slow on a cold run.
  }, 30_000);
});
