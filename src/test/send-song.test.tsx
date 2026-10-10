import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/connect-music-data", () => ({
  sendChannels: async () => ({ email: false, text: false }),
  sendSongToSomeone: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: null } }) } },
}));

const { SendSong, shareOrigin, whatsappUrl, PUBLIC_SITE_URL } =
  await import("@/components/connect/music/SendSong");

describe("shareOrigin", () => {
  it("points links at the public site when testing on localhost", () => {
    expect(shareOrigin({ hostname: "localhost", origin: "http://localhost:8080" })).toBe(
      PUBLIC_SITE_URL,
    );
    expect(shareOrigin({ hostname: "127.0.0.1", origin: "http://127.0.0.1:8080" })).toBe(
      PUBLIC_SITE_URL,
    );
  });

  it("uses the live site's own address in production", () => {
    expect(shareOrigin({ hostname: "inwardwise.com", origin: "https://inwardwise.com" })).toBe(
      "https://inwardwise.com",
    );
  });
});

describe("whatsappUrl", () => {
  it("encodes the message and link for WhatsApp", () => {
    const url = whatsappUrl("A song for you: Fix You\nhttps://inwardwise.com/song?s=abc");
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1]!)).toBe(
      "A song for you: Fix You\nhttps://inwardwise.com/song?s=abc",
    );
  });
});

describe("SendSong WhatsApp button", () => {
  it("is a real link to WhatsApp with a public song link, opening in a new tab", () => {
    render(<SendSong song={{ title: "Fix You", artist: "Coldplay" }} onClose={() => {}} />);
    const a = screen.getByRole("link", { name: /Share on WhatsApp/ });
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
    const text = decodeURIComponent(a.getAttribute("href")!.split("text=")[1]!);
    expect(text).toContain("A song for you: Fix You by Coldplay");
    // jsdom runs on localhost, so the link must still point at the public site.
    expect(text).toContain(`${PUBLIC_SITE_URL}/song?s=`);
    expect(text).not.toContain("localhost");
  });
});
