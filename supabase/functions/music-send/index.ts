// Connect Music: email or text a song link to someone.
//
// The link is built here from the site's own address, so these channels can
// never carry other links. Email goes through Resend, text through Twilio.
// { "action": "capabilities" } reports which channels are configured, so the
// page can hide the ones that aren't.
//
// Secrets: RESEND_API_KEY (email); TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// TWILIO_FROM_NUMBER (text). Optional: SONG_EMAIL_FROM (default
// "InwardWise <no-reply@inwardwise.com>"), SITE_URL (default https://inwardwise.com).
import {
  SHARE_FROM_MAX,
  SHARE_MESSAGE_MAX,
  SONG_ARTIST_MAX,
  SONG_TITLE_MAX,
  SONG_URL_MAX,
  cleanSong,
  normalizeMusicUrl,
  songShareUrl,
} from "../_shared/music.ts";
import { cors, json, requestUser, str } from "../_shared/http.ts";

const E164 = /^\+[1-9]\d{7,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM = Deno.env.get("SONG_EMAIL_FROM") ?? "InwardWise <no-reply@inwardwise.com>";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "https://inwardwise.com").replace(/\/$/, "");

/** A secret with stray spaces or wrapping quotes from pasting removed. */
function secret(name: string): string {
  return (Deno.env.get(name) ?? "").trim().replace(/^["']|["']$/g, "");
}

function channels() {
  return {
    email: !!secret("RESEND_API_KEY"),
    text:
      !!Deno.env.get("TWILIO_ACCOUNT_SID") &&
      !!Deno.env.get("TWILIO_AUTH_TOKEN") &&
      !!Deno.env.get("TWILIO_FROM_NUMBER"),
  };
}

/** The provider's error message from a failed response (Resend: { message }, Twilio: { message }). */
async function providerMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const body = JSON.parse(text) as { message?: string; error?: { message?: string } };
    return (body.message ?? body.error?.message ?? text).slice(0, 300);
  } catch {
    return text.slice(0, 300);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const html = text
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;line-height:1.65;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      text,
      html: `<div style="font-family:Georgia,serif;font-size:16px;color:#1a1a1a;max-width:620px;">${html}</div>`,
    }),
  });
  // Resend's own reason (e.g. "domain is not verified"); never the recipient or message.
  if (!res.ok) console.error("[music-send] email failed", res.status, await providerMessage(res));
  return res.ok;
}

async function sendText(to: string, body: string): Promise<boolean> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const token = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const params = new URLSearchParams({
    To: to,
    From: Deno.env.get("TWILIO_FROM_NUMBER")!,
    Body: body.slice(0, 1500),
  });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!res.ok) console.error("[music-send] text failed", res.status, await providerMessage(res));
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await requestUser(req);
  if (!user) return json({ error: "Please sign in to send a song." }, 401);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid request." }, 400);
  if (body.action === "capabilities") return json(channels());

  const raw = (body.song ?? {}) as Record<string, unknown>;
  const rawUrl = str(raw.url, SONG_URL_MAX) || null;
  if (rawUrl && !normalizeMusicUrl(rawUrl)) {
    return json(
      {
        error: "That link does not look right. Paste a full link, e.g. https://open.spotify.com/…",
      },
      400,
    );
  }
  const song = cleanSong({
    title: str(raw.title, SONG_TITLE_MAX),
    artist: str(raw.artist, SONG_ARTIST_MAX),
    url: rawUrl,
  });
  if (!song) return json({ error: "Add the song name first." }, 400);

  const message = str(body.message, SHARE_MESSAGE_MAX);
  const from = str(body.from, SHARE_FROM_MAX);
  const email = str(body.email, 200);
  const phone = str(body.phone, 20).replace(/[\s()-]/g, "");
  if (email && !EMAIL.test(email))
    return json({ error: "That email address does not look right." }, 400);
  if (phone && !E164.test(phone)) {
    return json(
      { error: "Enter the phone number in international format, e.g. +44 7700 900123." },
      400,
    );
  }
  if (!email && !phone) return json({ error: "Add their email address or phone number." }, 400);

  const link = songShareUrl(SITE_URL, {
    title: song.title,
    artist: song.artist,
    url: song.url ?? null,
    message,
    from,
  });
  const who = from || "Someone";
  const label = `${song.title}${song.artist ? ` by ${song.artist}` : ""}`;
  const text =
    `${who} sent you a song through InwardWise: ${label}.` +
    (message ? `\n\n"${message}"` : "") +
    `\n\nListen here: ${link}`;

  const can = channels();
  const sent: string[] = [];
  const notes: string[] = [];
  if (email) {
    if (!can.email) notes.push("Email is not available yet.");
    else if (await sendEmail(email, `${who} sent you a song`, text)) sent.push("email");
    else notes.push("The email could not be sent just now.");
  }
  if (phone) {
    if (!can.text) notes.push("Text messages are not available yet.");
    else if (await sendText(phone, text)) sent.push("text");
    else notes.push("The text message could not be sent just now.");
  }
  if (sent.length === 0) {
    return json(
      { error: `${notes.join(" ")} You can still copy the link or share it on WhatsApp.` },
      502,
    );
  }
  return json({ sent, note: `Sent by ${sent.join(" and ")}.` });
});
