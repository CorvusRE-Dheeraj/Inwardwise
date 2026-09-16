import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { classifyPrompt } from "@/lib/connect-matching";
import { keywordsOf, pickNextSection, type ConnectOnlySectionRow } from "@/lib/connect-only";
import {
  researchLocalEvents,
  sendConnectEmail,
  sendConnectSms,
  speakToStorage,
} from "@/lib/connect-only.server";

const E164 = /^\+[1-9]\d{7,14}$/;

export type ConnectOnlyState = {
  sessionId: string | null;
  category: string | null;
  hasEmail: boolean;
  hasPhone: boolean;
  location: string | null;
  availability: string | null;
  interests: string | null;
  libraryEmpty: boolean;
  finished: boolean;
  delivered: number;
  total: number;
  /** Metadata only. The material itself is never returned to the page. */
  pending: {
    id: string;
    sequence: number;
    channels: string[];
    sendCount: number;
    lastSentAt: string;
    minutes: number;
  } | null;
  notes: string[];
};

type DeliveryRow = {
  id: string;
  section_id: string | null;
  sequence: number;
  channels: string[];
  send_count: number;
  last_sent_at: string;
  state: string;
  payload: Record<string, unknown>;
};

const EMPTY: ConnectOnlyState = {
  sessionId: null,
  category: null,
  hasEmail: false,
  hasPhone: false,
  location: null,
  availability: null,
  interests: null,
  libraryEmpty: false,
  finished: false,
  delivered: 0,
  total: 0,
  pending: null,
  notes: [],
};

type Db = { supabase: any; userId: string };

async function loadSections(db: any): Promise<ConnectOnlySectionRow[]> {
  const { data } = await db
    .from("journey_sections")
    .select("id, title, content, topic, theme, tags, sequence, estimated_minutes")
    .eq("is_approved", true)
    .order("sequence", { ascending: true })
    .limit(500);
  return (data ?? []) as ConnectOnlySectionRow[];
}

/** Sends the next unseen piece. Only ever one piece is outstanding at a time. */
async function deliverNext(
  ctx: Db,
  session: {
    id: string;
    prompt_text: string;
    health_notes: string | null;
    contact_email: string | null;
    phone_number: string | null;
  },
): Promise<string[]> {
  const notes: string[] = [];
  const sections = await loadSections(ctx.supabase);
  if (sections.length === 0) {
    notes.push("Nothing is available to send yet. Nothing has been made up in its place.");
    return notes;
  }

  const { data: past } = await ctx.supabase
    .from("connect_only_deliveries")
    .select("section_id, sequence")
    .eq("session_id", session.id)
    .eq("kind", "reading");
  const deliveredIds = ((past ?? []) as Array<{ section_id: string | null }>)
    .map((d) => d.section_id)
    .filter((id): id is string => Boolean(id));
  const nextSequence = (past ?? []).length + 1;

  const words = keywordsOf(`${session.prompt_text} ${session.health_notes ?? ""}`);
  const section = pickNextSection(sections, words, deliveredIds);
  if (!section) {
    await ctx.supabase.from("connect_only_sessions").update({ status: "completed" }).eq("id", session.id);
    notes.push("You have been through everything matched to what you wrote.");
    return notes;
  }

  const body =
    `Here is your next short piece to read.\n\n${section.title}\n\n${section.content}\n\n` +
    `When you have read it, open Connect and confirm. Nothing further is sent until you do.`;

  const channels: string[] = [];
  if (session.contact_email) {
    const r = await sendConnectEmail(session.contact_email, `A short read for you, part ${nextSequence}`, body);
    if (r.ok) channels.push("email");
    else if (r.note) notes.push(r.note);
  }
  if (session.phone_number) {
    const r = await sendConnectSms(
      session.phone_number,
      `InwardWise Connect, part ${nextSequence}:\n\n${section.title}\n\n${section.content.slice(0, 900)}\n\nReply in the app once you have read it.`,
    );
    if (r.ok) channels.push("sms");
    else if (r.note) notes.push(r.note);
  }
  if (channels.length === 0) {
    notes.push("Add an email address or phone number above so the reading can reach you.");
    return notes;
  }

  await ctx.supabase.from("connect_only_deliveries").insert({
    session_id: session.id,
    user_id: ctx.userId,
    kind: "reading",
    section_id: section.id,
    sequence: nextSequence,
    channels,
    state: "sent",
    payload: { minutes: section.estimated_minutes },
  });

  return notes;
}

async function buildState(ctx: Db, notes: string[] = []): Promise<ConnectOnlyState> {
  const { data: session } = await ctx.supabase
    .from("connect_only_sessions")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) return { ...EMPTY, notes };

  const sections = await loadSections(ctx.supabase);
  const { data: deliveries } = await ctx.supabase
    .from("connect_only_deliveries")
    .select("id, section_id, sequence, channels, send_count, last_sent_at, state, payload")
    .eq("session_id", session.id)
    .eq("kind", "reading")
    .order("sequence", { ascending: true });

  const rows = (deliveries ?? []) as DeliveryRow[];
  const pendingRow = rows.find((d) => d.state !== "read");
  const delivered = rows.filter((d) => d.state === "read").length;

  return {
    sessionId: session.id,
    category: session.category,
    hasEmail: Boolean(session.contact_email),
    hasPhone: Boolean(session.phone_number),
    location: session.location,
    availability: session.availability,
    interests: session.interests,
    libraryEmpty: sections.length === 0,
    finished: rows.length > 0 && !pendingRow && delivered >= sections.length,
    delivered,
    total: sections.length,
    pending: pendingRow
      ? {
          id: pendingRow.id,
          sequence: pendingRow.sequence,
          channels: pendingRow.channels ?? [],
          sendCount: pendingRow.send_count ?? 1,
          lastSentAt: pendingRow.last_sent_at,
          minutes: Number((pendingRow.payload as { minutes?: number })?.minutes ?? 3),
        }
      : null,
    notes,
  };
}

export const getConnectOnlyState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConnectOnlyState> =>
    buildState({ supabase: context.supabase, userId: context.userId }),
  );

const StartSchema = z.object({
  prompt: z.string().trim().min(8).max(4000),
  healthNotes: z.string().trim().max(1000).optional(),
  contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  phoneNumber: z.string().trim().max(20).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional(),
  availability: z.string().trim().max(160).optional(),
  interests: z.string().trim().max(300).optional(),
});

export const startConnectOnly = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StartSchema.parse(d))
  .handler(async ({ context, data }): Promise<ConnectOnlyState> => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const phone = (data.phoneNumber ?? "").replace(/[\s()-]/g, "");
    if (phone && !E164.test(phone)) {
      throw new Error("Enter the phone number in international format, e.g. +44 7700 900123.");
    }

    await ctx.supabase
      .from("connect_only_sessions")
      .update({ status: "closed" })
      .eq("user_id", ctx.userId)
      .eq("status", "active");

    const { data: session, error } = await ctx.supabase
      .from("connect_only_sessions")
      .insert({
        user_id: ctx.userId,
        prompt_text: data.prompt,
        category: classifyPrompt(data.prompt),
        health_notes: data.healthNotes || null,
        contact_email: data.contactEmail || null,
        phone_number: phone || null,
        location: data.location || null,
        availability: data.availability || null,
        interests: data.interests || null,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const notes = await deliverNext(ctx, session);
    return buildState(ctx, notes);
  });

export const confirmConnectOnlyRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ deliveryId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }): Promise<ConnectOnlyState> => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { data: delivery, error } = await ctx.supabase
      .from("connect_only_deliveries")
      .update({ state: "read", confirmed_at: new Date().toISOString() })
      .eq("id", data.deliveryId)
      .eq("user_id", ctx.userId)
      .select("session_id")
      .single();
    if (error) throw new Error(error.message);

    const { data: session } = await ctx.supabase
      .from("connect_only_sessions")
      .select("*")
      .eq("id", delivery.session_id)
      .single();

    const notes = session ? await deliverNext(ctx, session) : [];
    return buildState(ctx, notes);
  });

/** Nothing new is released until the outstanding piece is read; it is resent. */
export const resendConnectOnlyUnread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConnectOnlyState> => {
    const ctx = { supabase: context.supabase, userId: context.userId };
    const { data: session } = await ctx.supabase
      .from("connect_only_sessions")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!session) return buildState(ctx, ["Start by telling Connect what is on your mind."]);

    const { data: pending } = await ctx.supabase
      .from("connect_only_deliveries")
      .select("id, section_id, sequence, send_count")
      .eq("session_id", session.id)
      .eq("kind", "reading")
      .neq("state", "read")
      .order("sequence", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!pending) {
      const notes = await deliverNext(ctx, session);
      return buildState(ctx, notes);
    }

    const { data: section } = await ctx.supabase
      .from("journey_sections")
      .select("title, content")
      .eq("id", pending.section_id ?? "")
      .maybeSingle();
    if (!section) return buildState(ctx, ["That piece is no longer available."]);

    const notes: string[] = [];
    const body = `Sending this again so you do not lose your place.\n\n${section.title}\n\n${section.content}\n\nConfirm in Connect once you have read it.`;
    const channels: string[] = [];
    if (session.contact_email) {
      const r = await sendConnectEmail(session.contact_email, `Still waiting for you, part ${pending.sequence}`, body);
      if (r.ok) channels.push("email");
      else if (r.note) notes.push(r.note);
    }
    if (session.phone_number) {
      const r = await sendConnectSms(
        session.phone_number,
        `InwardWise Connect, part ${pending.sequence} again:\n\n${section.title}\n\n${section.content.slice(0, 900)}`,
      );
      if (r.ok) channels.push("sms");
      else if (r.note) notes.push(r.note);
    }
    if (channels.length === 0) notes.push("It could not be sent again just now.");
    else {
      await ctx.supabase
        .from("connect_only_deliveries")
        .update({
          send_count: (pending.send_count ?? 1) + 1,
          last_sent_at: new Date().toISOString(),
          channels,
        })
        .eq("id", pending.id);
      notes.push("Sent again.");
    }
    return buildState(ctx, notes);
  });

/** Sends a recorded member story, spoken aloud, to their phone. */
export const sendConnectOnlyStoryAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ note: string; audioUrl: string | null }> => {
    const db = context.supabase as any;
    const { data: session } = await db
      .from("connect_only_sessions")
      .select("id, category, prompt_text, phone_number")
      .eq("user_id", context.userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!session) return { note: "Tell Connect what is on your mind first.", audioUrl: null };

    const { data: storyRows } = await db.rpc("get_published_stories").limit(40);
    const stories = (storyRows ?? []) as Array<{
      id: string;
      category: string;
      situation: string;
      lesson: string | null;
      advice: string | null;
      pseudonym: string;
    }>;
    const match = stories.find((s) => s.category === session.category) ?? stories[0];
    if (!match) return { note: "No reviewed member story is available for this yet.", audioUrl: null };

    const spoken = [
      "A story from another member, shared anonymously and reviewed before publication.",
      match.situation,
      match.lesson ?? "",
      match.advice ?? "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const url = await speakToStorage(spoken, `${context.userId}/story-${match.id}.mp3`);
    if (!url) return { note: "The recording could not be prepared just now.", audioUrl: null };

    await db.from("connect_only_deliveries").insert({
      session_id: session.id,
      user_id: context.userId,
      kind: "story_audio",
      story_id: match.id,
      sequence: 1,
      channels: session.phone_number ? ["sms"] : ["in_app"],
      state: "sent",
      payload: { audio_url: url },
    });

    if (session.phone_number) {
      const r = await sendConnectSms(
        session.phone_number,
        "A story from another InwardWise member, in their own words. Listen here (link expires in seven days): " + url,
      );
      if (r.ok) return { note: "Sent to your phone. You can also listen here.", audioUrl: url };
      return { note: r.note ?? "Ready to listen here.", audioUrl: url };
    }
    return { note: "Ready to listen here. Add a phone number to receive it as a message.", audioUrl: url };
  });

const EventsSchema = z.object({
  location: z.string().trim().min(2).max(160),
  availability: z.string().trim().max(160).optional(),
  interests: z.string().trim().max(300).optional(),
});

export const suggestConnectOnlyEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EventsSchema.parse(d))
  .handler(async ({ context, data }): Promise<{ suggestions: string | null; note: string | null }> => {
    const db = context.supabase as any;
    const { data: session } = await db
      .from("connect_only_sessions")
      .select("id, prompt_text")
      .eq("user_id", context.userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!session) return { suggestions: null, note: "Tell Connect what is on your mind first." };

    const { data: factorRows } = await db
      .from("avatar_dimensions")
      .select("progress_pct")
      .eq("user_id", context.userId);
    const selfBuilt =
      ((factorRows ?? []) as Array<{ progress_pct: number | null }>).filter(
        (f) => (f.progress_pct ?? 0) >= 100,
      ).length >= 5;

    await db
      .from("connect_only_sessions")
      .update({
        location: data.location,
        availability: data.availability || null,
        interests: data.interests || null,
      })
      .eq("id", session.id);

    const suggestions = await researchLocalEvents({
      prompt: session.prompt_text,
      location: data.location,
      availability: data.availability ?? "",
      interests: data.interests ?? "",
      selfBuilt,
    });
    if (!suggestions) return { suggestions: null, note: "Local suggestions could not be prepared just now." };

    await db.from("connect_only_deliveries").insert({
      session_id: session.id,
      user_id: context.userId,
      kind: "event",
      sequence: 1,
      channels: ["in_app"],
      state: "sent",
      payload: { location: data.location, suggestions },
    });

    return { suggestions, note: null };
  });
