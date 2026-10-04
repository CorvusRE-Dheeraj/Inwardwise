import { describe, expect, it } from "vitest";
import {
  MUSIC_MODES,
  cleanSong,
  decodeSongShare,
  encodeSongShare,
  musicLinkLabel,
  normalizeMusicUrl,
  sameSong,
  songShareUrl,
  spotifySearchUrl,
  youtubeSearchUrl,
} from "@/lib/music";

describe("normalizeMusicUrl", () => {
  it("keeps full https links", () => {
    expect(normalizeMusicUrl("https://open.spotify.com/track/abc")).toBe(
      "https://open.spotify.com/track/abc",
    );
  });

  it("completes a link pasted without https://", () => {
    expect(normalizeMusicUrl("youtu.be/xyz")).toBe("https://youtu.be/xyz");
  });

  it("upgrades http to https", () => {
    expect(normalizeMusicUrl("http://music.apple.com/in/album/1")).toBe(
      "https://music.apple.com/in/album/1",
    );
  });

  it("refuses unsafe or broken links", () => {
    expect(normalizeMusicUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeMusicUrl("data:text/html,hi")).toBeNull();
    expect(normalizeMusicUrl("not a link")).toBeNull();
    expect(normalizeMusicUrl("localhost")).toBeNull();
    expect(normalizeMusicUrl("")).toBeNull();
    expect(normalizeMusicUrl(null)).toBeNull();
    expect(normalizeMusicUrl(`https://a.com/${"x".repeat(600)}`)).toBeNull();
  });
});

describe("musicLinkLabel", () => {
  it("names the common services", () => {
    expect(musicLinkLabel("https://open.spotify.com/track/1")).toBe("Spotify");
    expect(musicLinkLabel("https://www.youtube.com/watch?v=1")).toBe("YouTube");
    expect(musicLinkLabel("https://music.youtube.com/watch?v=1")).toBe("YouTube");
    expect(musicLinkLabel("https://youtu.be/1")).toBe("YouTube");
    expect(musicLinkLabel("https://music.apple.com/in/album/1")).toBe("Apple Music");
    expect(musicLinkLabel("https://www.jiosaavn.com/song/x")).toBe("JioSaavn");
    expect(musicLinkLabel("https://example.com/song")).toBe("Link");
  });
});

describe("search links", () => {
  it("search Spotify and YouTube for the song name and artist", () => {
    const song = { title: "Fix You", artist: "Coldplay" };
    expect(spotifySearchUrl(song)).toBe("https://open.spotify.com/search/Fix%20You%20Coldplay");
    expect(youtubeSearchUrl(song)).toBe(
      "https://www.youtube.com/results?search_query=Fix%20You%20Coldplay",
    );
  });
});

describe("cleanSong", () => {
  it("needs a title and drops a bad link", () => {
    expect(cleanSong({ title: "  ", artist: "X" })).toBeNull();
    expect(cleanSong({ title: " Holocene ", artist: " Bon Iver ", url: "javascript:x" })).toEqual({
      title: "Holocene",
      artist: "Bon Iver",
      url: null,
      why: null,
    });
  });

  it("treats the same song in different case as one", () => {
    expect(
      sameSong({ title: "Fix You", artist: "Coldplay" }, { title: "fix you ", artist: "COLDPLAY" }),
    ).toBe(true);
    expect(
      sameSong({ title: "Fix You", artist: "Coldplay" }, { title: "Yellow", artist: "Coldplay" }),
    ).toBe(false);
  });
});

describe("song share links", () => {
  const share = {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    url: "https://open.spotify.com/track/abc",
    message: "Thinking of you, Appa ❤️ — call me?",
    from: "Narasimha",
  };

  it("round-trips a song, message and name, including emoji and non-English text", () => {
    expect(decodeSongShare(encodeSongShare(share))).toEqual(share);
  });

  it("builds a /song link on the given site", () => {
    const url = songShareUrl("https://inwardwise.com/", share);
    expect(url.startsWith("https://inwardwise.com/song?s=")).toBe(true);
    const s = new URL(url).searchParams.get("s");
    expect(decodeSongShare(s)?.title).toBe("Tum Hi Ho");
  });

  it("keeps the link URL-safe", () => {
    expect(encodeSongShare(share)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("rejects broken or tampered links", () => {
    expect(decodeSongShare("")).toBeNull();
    expect(decodeSongShare("not-base64!!")).toBeNull();
    expect(decodeSongShare(encodeSongShare(share).slice(0, 10))).toBeNull();
    const noTitle = btoa(JSON.stringify({ t: "", a: "x" })).replace(/=+$/, "");
    expect(decodeSongShare(noTitle)).toBeNull();
  });

  it("strips an unsafe link someone edited into the share", () => {
    const evil = btoa(JSON.stringify({ t: "Song", a: "A", u: "javascript:alert(1)", m: "", f: "" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(decodeSongShare(evil)).toMatchObject({ title: "Song", url: null });
  });

  it("caps the message length", () => {
    const long = decodeSongShare(encodeSongShare({ ...share, message: "a".repeat(1000) }));
    expect(long?.message.length).toBe(300);
  });
});

describe("modes", () => {
  it("offers Discover, Express, Share and Reflect", () => {
    expect(MUSIC_MODES.map((m) => m.name)).toEqual(["Discover", "Express", "Share", "Reflect"]);
  });
});
