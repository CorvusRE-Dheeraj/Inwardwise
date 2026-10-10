import { useEffect, useState } from "react";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sendChannels, sendSongToSomeone, type SendChannels } from "@/lib/connect-music-data";
import { SHARE_FROM_MAX, SHARE_MESSAGE_MAX, songShareUrl, type Song } from "@/lib/music";
import { ACTION_BUTTON, SMALL_INPUT } from "./SongActions";

/** Where shared song links point. The music-send function uses the same address. */
export const PUBLIC_SITE_URL = "https://inwardwise.com";

/**
 * The address to put in a shared link: this site, except when running on a
 * developer's machine, where a localhost link would be useless to the person
 * receiving it.
 */
export function shareOrigin(loc: Pick<Location, "hostname" | "origin">): string {
  const local =
    /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(loc.hostname) ||
    loc.hostname.endsWith(".local");
  if (local) return PUBLIC_SITE_URL;
  return `${loc.origin}${import.meta.env.BASE_URL ?? "/"}`.replace(/\/+$/, "");
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Send a song with a short message. Copy link and WhatsApp work from the
 * member's own device; email and text go through the site's delivery services
 * and are offered only once those are set up.
 */
export function SendSong({ song, onClose }: { song: Song; onClose: () => void }) {
  const [channels, setChannels] = useState<SendChannels>({ email: false, text: false });
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [showDirect, setShowDirect] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as { full_name?: string; name?: string } | undefined;
      const first = (meta?.full_name || meta?.name || "").trim().split(/\s+/)[0] ?? "";
      if (first) setFrom((f) => f || first.slice(0, SHARE_FROM_MAX));
    });
    let live = true;
    void sendChannels().then((c) => {
      if (live) setChannels(c);
    });
    return () => {
      live = false;
    };
  }, []);

  function link(): string {
    return songShareUrl(shareOrigin(window.location), {
      title: song.title,
      artist: song.artist,
      url: song.url ?? null,
      message,
      from,
    });
  }

  function shareText(): string {
    const label = `${song.title}${song.artist ? ` by ${song.artist}` : ""}`;
    return `${message.trim() ? `${message.trim()}\n\n` : ""}A song for you: ${label}\n${link()}`;
  }

  async function copy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Copying is blocked in this browser. Select the link below and copy it.");
      setNote(link());
    }
  }

  async function direct() {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await sendSongToSomeone({
        song,
        message,
        from,
        email: channels.email ? email : "",
        phone: channels.text ? phone : "",
      });
      setNote(res.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be sent just now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-[color:var(--rule)] p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <label className="block">
          <span className="mb-1 block text-[12px] text-[color:var(--muted-foreground)]">
            Your first name
          </span>
          <input
            value={from}
            maxLength={SHARE_FROM_MAX}
            onChange={(e) => setFrom(e.target.value)}
            className={SMALL_INPUT}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] text-[color:var(--muted-foreground)]">
            A short message ({SHARE_MESSAGE_MAX - message.length} left)
          </span>
          <input
            value={message}
            maxLength={SHARE_MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="This made me think of you."
            className={SMALL_INPUT}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className={ACTION_BUTTON}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Link copied" : "Copy link"}
        </button>
        {/* A real link, not window.open: popup blockers and in-app browsers
            don't block it, and phones hand it straight to the WhatsApp app. */}
        <a
          href={whatsappUrl(shareText())}
          target="_blank"
          rel="noopener noreferrer"
          className={ACTION_BUTTON}
        >
          <MessageCircle className="h-3.5 w-3.5" /> Share on WhatsApp
        </a>
        {(channels.email || channels.text) && (
          <button type="button" onClick={() => setShowDirect((v) => !v)} className={ACTION_BUTTON}>
            <Mail className="h-3.5 w-3.5" />{" "}
            {channels.email && channels.text ? "Email or text" : channels.email ? "Email" : "Text"}
          </button>
        )}
        <button type="button" onClick={onClose} className={ACTION_BUTTON}>
          Close
        </button>
      </div>

      {showDirect && (
        <div
          className={`grid gap-3 sm:items-end ${
            channels.email && channels.text
              ? "sm:grid-cols-[1fr_1fr_auto]"
              : "sm:grid-cols-[1fr_auto]"
          }`}
        >
          {channels.email && (
            <label className="block">
              <span className="mb-1 block text-[12px] text-[color:var(--muted-foreground)]">
                Their email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={SMALL_INPUT}
              />
            </label>
          )}
          {channels.text && (
            <label className="block">
              <span className="mb-1 block text-[12px] text-[color:var(--muted-foreground)]">
                {channels.email ? "or their phone" : "Their phone"} (+country code)
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                inputMode="tel"
                className={SMALL_INPUT}
              />
            </label>
          )}
          <button
            type="button"
            onClick={() => void direct()}
            disabled={busy}
            className={`${ACTION_BUTTON} justify-center`}
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
      )}

      {note && <p className="break-all text-[12px] text-[color:var(--royal)]">{note}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
