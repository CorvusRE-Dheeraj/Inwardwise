import { createFileRoute } from "@tanstack/react-router";

type Line = { set: string; text: string };

const SET_TITLES: Record<string, string> = {
  sorry: "I am sorry.",
  forgive: "Please forgive me.",
  thank: "Thank you.",
  love: "I love you.",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTwiml(lines: Line[], minutes: number): string {
  const order = ["sorry", "forgive", "thank", "love"];
  const total = Math.max(1, lines.length);
  // Reserve ~20% of the session for pauses between prayers and the opening.
  const perLinePause = Math.min(
    12,
    Math.max(3, Math.round(((minutes * 60) * 0.6) / total)),
  );

  const parts: string[] = [
    `<Pause length="2"/>`,
    `<Say voice="Polly.Joanna">Welcome to your meditation. Find a quiet place, and breathe slowly.</Say>`,
    `<Pause length="5"/>`,
  ];

  for (const key of order) {
    const items = lines.filter((l) => l.set === key);
    if (items.length === 0) continue;
    parts.push(`<Say voice="Polly.Joanna">${escapeXml(SET_TITLES[key] ?? "")}</Say>`);
    parts.push(`<Pause length="3"/>`);
    for (const l of items) {
      parts.push(`<Say voice="Polly.Joanna">${escapeXml(l.text)}</Say>`);
      parts.push(`<Pause length="${perLinePause}"/>`);
    }
    parts.push(`<Pause length="6"/>`);
  }

  parts.push(
    `<Say voice="Polly.Joanna">Rest now. Your meditation is complete.</Say>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?><Response>${parts.join("")}</Response>`;
}

async function handler({ request, params }: { request: Request; params: { id: string } }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token) return new Response("Forbidden", { status: 403 });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("meditation_settings")
    .select("script, duration_minutes, call_token")
    .eq("id", params.id)
    .maybeSingle();

  if (!data || data.call_token !== token) {
    return new Response("Forbidden", { status: 403 });
  }

  const lines = Array.isArray(data.script) ? (data.script as unknown as Line[]) : [];
  const xml = lines.length
    ? buildTwiml(lines, data.duration_minutes ?? 10)
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Your meditation is not prepared yet. Please open the dashboard and save your settings again.</Say></Response>`;

  return new Response(xml, {
    headers: { "content-type": "text/xml; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/meditation-twiml/$id")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});
