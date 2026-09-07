// Server-only delivery helpers for the Connect only path: email, text message,
// spoken audio and local suggestion research. Never called from the browser.

const EMAIL_DOMAIN = "decisionphilosophy.com";
const EMAIL_FROM = `InwardWise Connect <connect@${EMAIL_DOMAIN}>`;

export type DeliveryChannelResult = { channel: string; ok: boolean; note?: string };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendConnectEmail(
  to: string,
  subject: string,
  bodyText: string,
): Promise<DeliveryChannelResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { channel: "email", ok: false, note: "Email is not configured yet." };
  try {
    const { sendLovableEmail } = await import("@lovable.dev/email-js");
    const paragraphs = bodyText
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 16px;line-height:1.65;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
      .join("");
    await sendLovableEmail(
      {
        to,
        from: EMAIL_FROM,
        sender_domain: EMAIL_DOMAIN,
        subject,
        text: bodyText,
        html: `<div style="font-family:Georgia,serif;font-size:16px;color:#1a1a1a;max-width:620px;">${paragraphs}</div>`,
        purpose: "transactional",
        label: "connect_only_reading",
      },
      { apiKey, sendUrl: process.env["LOVABLE_SEND_URL"] },
    );
    return { channel: "email", ok: true };
  } catch (err) {
    console.error("[connect-only] email failed", err);
    return { channel: "email", ok: false, note: "The email could not be sent just now." };
  }
}

export async function sendConnectSms(
  to: string,
  body: string,
  mediaUrl?: string,
): Promise<DeliveryChannelResult> {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const from = process.env["TWILIO_FROM_NUMBER"];
  if (!sid || !token || !from) {
    return { channel: "sms", ok: false, note: "Text messaging is not configured yet." };
  }
  try {
    const params = new URLSearchParams({ To: to, From: from, Body: body.slice(0, 1500) });
    if (mediaUrl) params.append("MediaUrl", mediaUrl);
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      console.error("[connect-only] sms failed", res.status, await res.text().catch(() => ""));
      return { channel: "sms", ok: false, note: "The text message could not be sent just now." };
    }
    return { channel: "sms", ok: true };
  } catch (err) {
    console.error("[connect-only] sms error", err);
    return { channel: "sms", ok: false, note: "The text message could not be sent just now." };
  }
}

/** Speaks a story aloud and stores it, returning a temporary listening link. */
export async function speakToStorage(text: string, path: string): Promise<string | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text.slice(0, 3500),
        voice: "alloy",
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      console.error("[connect-only] tts failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const up = await supabaseAdmin.storage
      .from("connect-audio")
      .upload(path, bytes, { contentType: "audio/mpeg", upsert: true });
    if (up.error) {
      console.error("[connect-only] upload failed", up.error.message);
      return null;
    }
    const signed = await supabaseAdmin.storage
      .from("connect-audio")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    return signed.data?.signedUrl ?? null;
  } catch (err) {
    console.error("[connect-only] audio error", err);
    return null;
  }
}

/**
 * Suggests the kinds of local gatherings worth looking for. It is explicitly
 * told not to invent named events, dates or venues.
 */
export async function researchLocalEvents(input: {
  prompt: string;
  location: string;
  availability: string;
  interests: string;
  selfBuilt: boolean;
}): Promise<string | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You help someone find real, recurring community gatherings near them that they could join in person. " +
              "Rules: suggest 3 to 5 concrete kinds of gathering that genuinely exist in most towns of this type, name the kind of host or venue to look for, say roughly when they usually meet, and give one short line on why it fits this person. " +
              "Never invent a specific event name, organiser, address, date or price. Where a search would help, give the exact words to search or the type of place to ask. " +
              "Plain prose with short bullet lines. No headings. Under 220 words. Not therapy, medical care, or emergency support.",
          },
          {
            role: "user",
            content:
              `What is on their mind: ${input.prompt}\n` +
              `Town or city: ${input.location}\n` +
              `Usually free: ${input.availability || "not stated"}\n` +
              `Enjoys or would try: ${input.interests || "not stated"}\n` +
              `They have completed their own Self build: ${input.selfBuilt ? "yes" : "no"}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}
