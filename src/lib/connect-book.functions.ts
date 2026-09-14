import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { keywordsOf, pickNextSection, type ConnectOnlySectionRow } from "@/lib/connect-only";

const E164 = /^\+[1-9]\d{7,14}$/;

export type BookRead = {
  id: string;
  sectionTitle: string;
  createdAt: string;
  channels: string[];
  sendCount: number;
  lastSentAt: string | null;
  openedAt: string | null;
  readAt: string | null;
  minutes: number;
};

export type BookSection = {
  id: string;
  title: string;
  content: string;
  minutes: number;
  readAt: string | null;
};

function rowToRead(r: any): BookRead {
  return {
    id: r.id,
    sectionTitle: r.section_title,
    createdAt: r.created_at,
    channels: r.channels ?? [],
    sendCount: r.send_count ?? 0,
    lastSentAt: r.last_sent_at ?? null,
    openedAt: r.opened_at ?? null,
    readAt: r.read_at ?? null,
    minutes: 4,
  };
}

async function loadSections(db: any): Promise<ConnectOnlySectionRow[]> {
  const { data } = await db
    .from("journey_sections")
    .select("id, title, content, topic, theme, tags, sequence, estimated_minutes")
    .eq("is_approved", true)
    .order("sequence", { ascending: true })
    .limit(500);
  return (data ?? []) as ConnectOnlySectionRow[];
}

/** Matches a section of the book to what the person wrote and records it. */
export const matchBookSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ prompt: z.string().trim().min(8).max(4000) }).parse(d),
  )
  .handler(async ({ context, data }): Promise<{ read: BookRead | null; note: string | null }> => {
    const db = context.supabase as any;
    const sections = await loadSections(db);
    if (sections.length === 0) {
      return {
        read: null,
        note: "No section of the book is available yet, and nothing has been invented in its place.",
      };
    }

    const { data: past } = await db
      .from("connect_book_reads")
      .select("section_id")
      .eq("user_id", context.userId);
    const seen = ((past ?? []) as Array<{ section_id: string | null }>)
      .map((p) => p.section_id)
      .filter((id): id is string => Boolean(id));

    const words = keywordsOf(data.prompt);
    const section = pickNextSection(sections, words, seen) ?? pickNextSection(sections, words, []);
    if (!section) return { read: null, note: "No matching section could be found." };

    const { data: row, error } = await db
      .from("connect_book_reads")
      .insert({
        user_id: context.userId,
        prompt_text: data.prompt,
        section_id: section.id,
        section_title: section.title,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const read = rowToRead(row);
    read.minutes = section.estimated_minutes ?? 4;
    return { read, note: null };
  });

/** Returns the section itself for the separate reading screen. */
export const getBookSection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ readId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }): Promise<BookSection | null> => {
    const db = context.supabase as any;
    const { data: row } = await db
      .from("connect_book_reads")
      .select("id, section_id, section_title, read_at, opened_at")
      .eq("id", data.readId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!row?.section_id) return null;

    const { data: section } = await db
      .from("journey_sections")
      .select("id, title, content, estimated_minutes")
      .eq("id", row.section_id)
      .maybeSingle();
    if (!section) return null;

    if (!row.opened_at) {
      await db
        .from("connect_book_reads")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", row.id);
    }

    return {
      id: row.id,
      title: section.title,
      content: section.content,
      minutes: section.estimated_minutes ?? 4,
      readAt: row.read_at ?? null,
    };
  });

export const markBookSectionRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ readId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }): Promise<{ readAt: string }> => {
    const readAt = new Date().toISOString();
    const db = context.supabase as any;
    const { error } = await db
      .from("connect_book_reads")
      .update({ read_at: readAt })
      .eq("id", data.readId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { readAt };
  });

const SendSchema = z.object({
  readId: z.string().uuid(),
  contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  phoneNumber: z.string().trim().max(20).optional().or(z.literal("")),
});

/** Sends the matched section by email or text. Also used to send it again. */
export const sendBookSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SendSchema.parse(d))
  .handler(async ({ context, data }): Promise<{ read: BookRead | null; note: string }> => {
    const db = context.supabase as any;
    const phone = (data.phoneNumber ?? "").replace(/[\s()-]/g, "");
    if (phone && !E164.test(phone)) {
      throw new Error("Enter the phone number in international format, e.g. +14155550123.");
    }
    if (!data.contactEmail && !phone) {
      throw new Error("Add an email address or a phone number so it can reach you.");
    }

    const { data: row } = await db
      .from("connect_book_reads")
      .select("id, section_id, section_title, send_count")
      .eq("id", data.readId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!row?.section_id) return { read: null, note: "That section is no longer available." };

    const { data: section } = await db
      .from("journey_sections")
      .select("title, content")
      .eq("id", row.section_id)
      .maybeSingle();
    if (!section) return { read: null, note: "That section is no longer available." };

    const { sendConnectEmail, sendConnectSms } = await import("@/lib/connect-only.server");
    const body =
      `A section of Mind It! For Health and Happiness, matched to what you wrote.\n\n` +
      `${section.title}\n\n${section.content}\n\n` +
      `Open Connect Book and confirm once you have read it. Nothing further is sent until you do.`;

    const notes: string[] = [];
    const channels: string[] = [];
    if (data.contactEmail) {
      const r = await sendConnectEmail(data.contactEmail, `Your reading: ${section.title}`, body);
      if (r.ok) channels.push("email");
      else if (r.note) notes.push(r.note);
    }
    if (phone) {
      const r = await sendConnectSms(
        phone,
        `Mind It! — ${section.title}\n\n${section.content.slice(0, 900)}`,
      );
      if (r.ok) channels.push("sms");
      else if (r.note) notes.push(r.note);
    }
    if (channels.length === 0) {
      return { read: null, note: notes.join(" ") || "It could not be sent just now." };
    }

    const { data: updated } = await db
      .from("connect_book_reads")
      .update({
        channels,
        send_count: (row.send_count ?? 0) + 1,
        last_sent_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .select("*")
      .single();

    return {
      read: updated ? rowToRead(updated) : null,
      note: channels.includes("email") && channels.includes("sms")
        ? "Sent to your email and your phone."
        : channels.includes("email")
          ? "Sent to your email."
          : "Sent to your phone.",
    };
  });

/** Everything sent, opened and read, so nothing is lost track of. */
export const listBookReads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BookRead[]> => {
    const db = context.supabase as any;
    const { data } = await db
      .from("connect_book_reads")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    return ((data ?? []) as any[]).map(rowToRead);
  });

const ReflectionSchema = z.object({
  body: z.string().trim().min(2).max(8000),
  source: z.enum(["written", "spoken"]).default("written"),
  readId: z.string().uuid().optional(),
});

/** Keeps what someone writes or says afterwards, as their own private memory. */
export const saveConnectReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ReflectionSchema.parse(d))
  .handler(async ({ context, data }): Promise<{ id: string; createdAt: string }> => {
    const db = context.supabase as any;
    const { data: row, error } = await db
      .from("connect_reflections")
      .insert({
        user_id: context.userId,
        read_id: data.readId ?? null,
        source: data.source,
        body: data.body,
        context: { pathway: "book" },
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, createdAt: row.created_at };
  });

export type StoredReflection = {
  id: string;
  body: string;
  source: string;
  createdAt: string;
};

export const listConnectReflections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StoredReflection[]> => {
    const db = context.supabase as any;
    const { data } = await db
      .from("connect_reflections")
      .select("id, body, source, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    return ((data ?? []) as any[]).map((r) => ({
      id: r.id,
      body: r.body,
      source: r.source,
      createdAt: r.created_at,
    }));
  });
