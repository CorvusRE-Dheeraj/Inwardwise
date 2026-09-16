import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ACTIVE_STATES,
  MAX_REMINDERS,
  REMINDER_AFTER_HOURS,
  isCompletionPhrase,
  type JourneyItemState,
} from "@/lib/journey";
import { rankSections, type SectionRow, type SignalRow } from "@/lib/journey-recommend";

export interface JourneyStateResult {
  preferences: {
    personalization_enabled: boolean;
    frequency: string;
    channels: Record<string, boolean>;
    topics: string[];
    paused: boolean;
  };
  libraryEmpty: boolean;
  topics: string[];
  progress: { completed: number; total: number };
  active: {
    itemId: string;
    state: JourneyItemState;
    relevanceNote: string | null;
    reminderDue: boolean;
    remindersLeft: number;
    section: {
      id: string;
      title: string;
      content: string;
      estimated_minutes: number;
      number: number;
      topic: string | null;
      source_locator: string | null;
      bookTitle: string;
      chapterNumber: number;
      chapterTitle: string;
    };
  } | null;
  recommendation: {
    sectionId: string;
    title: string;
    bookTitle: string;
    chapterNumber: number;
    chapterTitle: string;
    sectionNumber: number;
    sourceLocator: string | null;
    estimatedMinutes: number;
    relevanceNote: string;
    confidence: number;
  } | null;
}

const SECTION_SELECT =
  "id, book_id, chapter_id, number, title, content, estimated_minutes, topic, theme, tags, sequence, source_locator, journey_books(title), journey_chapters(number, title)";

type RawSection = {
  id: string;
  book_id: string;
  chapter_id: string;
  number: number;
  title: string;
  content: string;
  estimated_minutes: number;
  topic: string | null;
  theme: string | null;
  tags: string[] | null;
  sequence: number;
  source_locator: string | null;
  journey_books: { title: string } | null;
  journey_chapters: { number: number; title: string } | null;
};

function toSectionRow(r: RawSection): SectionRow {
  return {
    id: r.id,
    book_id: r.book_id,
    chapter_id: r.chapter_id,
    number: r.number,
    title: r.title,
    content: r.content,
    estimated_minutes: r.estimated_minutes,
    topic: r.topic,
    theme: r.theme,
    tags: r.tags ?? [],
    sequence: r.sequence,
    source_locator: r.source_locator,
    book_title: r.journey_books?.title ?? "",
    chapter_number: r.journey_chapters?.number ?? 0,
    chapter_title: r.journey_chapters?.title ?? "",
  };
}

export const getJourneyState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<JourneyStateResult> => {
    const db = context.supabase;
    const userId = context.userId;

    let { data: prefs } = await db
      .from("journey_preferences")
      .select("personalization_enabled, frequency, channels, topics, paused")
      .eq("user_id", userId)
      .maybeSingle();

    if (!prefs) {
      const { data: created } = await db
        .from("journey_preferences")
        .insert({ user_id: userId })
        .select("personalization_enabled, frequency, channels, topics, paused")
        .single();
      prefs = created;
    }

    const preferences = {
      personalization_enabled: prefs?.personalization_enabled ?? true,
      frequency: prefs?.frequency ?? "every_few_days",
      channels: (prefs?.channels as Record<string, boolean>) ?? { in_app: true },
      topics: prefs?.topics ?? [],
      paused: prefs?.paused ?? false,
    };

    const { data: sectionsRaw } = await db
      .from("journey_sections")
      .select(SECTION_SELECT)
      .eq("is_approved", true)
      .order("sequence", { ascending: true })
      .limit(500);

    const sections = ((sectionsRaw ?? []) as unknown as RawSection[]).map(toSectionRow);

    const { data: items } = await db
      .from("journey_items")
      .select("id, section_id, state, relevance_note, sent_at, reminder_count, updated_at")
      .eq("user_id", userId);

    const itemRows = items ?? [];
    const completed = itemRows.filter((i) => i.state === "COMPLETED").length;
    const finishedIds = itemRows
      .filter((i) => i.state === "COMPLETED" || i.state === "SKIPPED")
      .map((i) => i.section_id);

    const activeRow = itemRows.find((i) =>
      (ACTIVE_STATES as string[]).includes(i.state) && i.state !== "PAUSED",
    );
    const pausedRow = itemRows.find((i) => i.state === "PAUSED");
    const current = activeRow ?? pausedRow ?? null;

    let active: JourneyStateResult["active"] = null;
    if (current) {
      const sec = sections.find((s) => s.id === current.section_id);
      if (sec) {
        const sentAt = current.sent_at ? new Date(current.sent_at).getTime() : Date.now();
        const hours = (Date.now() - sentAt) / 36e5;
        active = {
          itemId: current.id,
          state: current.state as JourneyItemState,
          relevanceNote: current.relevance_note,
          reminderDue:
            current.state !== "PAUSED" &&
            hours >= REMINDER_AFTER_HOURS &&
            (current.reminder_count ?? 0) < MAX_REMINDERS,
          remindersLeft: Math.max(0, MAX_REMINDERS - (current.reminder_count ?? 0)),
          section: {
            id: sec.id,
            title: sec.title,
            content: sec.content,
            estimated_minutes: sec.estimated_minutes,
            number: sec.number,
            topic: sec.topic,
            source_locator: sec.source_locator,
            bookTitle: sec.book_title,
            chapterNumber: sec.chapter_number,
            chapterTitle: sec.chapter_title,
          },
        };
      }
    }

    const { data: signals } = await db
      .from("journey_signals")
      .select("signal_type, signal_key, signal_value, confidence, frequency, status")
      .eq("user_id", userId);

    let recommendation: JourneyStateResult["recommendation"] = null;
    if (!active && !preferences.paused) {
      const rec = rankSections({
        sections,
        excludeSectionIds: finishedIds,
        signals: (signals ?? []) as SignalRow[],
        preferredTopics: preferences.topics,
        personalizationEnabled: preferences.personalization_enabled,
      });
      if (rec) {
        recommendation = {
          sectionId: rec.section.id,
          title: rec.section.title,
          bookTitle: rec.bookTitle,
          chapterNumber: rec.chapterNumber,
          chapterTitle: rec.chapterTitle,
          sectionNumber: rec.section.number,
          sourceLocator: rec.section.source_locator,
          estimatedMinutes: rec.section.estimated_minutes,
          relevanceNote: rec.relevanceNote,
          confidence: Number(rec.confidence.toFixed(2)),
        };
      }
    }

    const topics = Array.from(
      new Set(sections.map((s) => s.topic).filter((t): t is string => Boolean(t))),
    ).sort();

    return {
      preferences,
      libraryEmpty: sections.length === 0,
      topics,
      progress: { completed, total: sections.length },
      active,
      recommendation,
    };
  });

/** Opens a section: creates (or reopens) the single active journey item. */
export const startSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ sectionId: z.string().uuid(), relevanceNote: z.string().max(400).optional(), reasonCodes: z.array(z.string()).optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = context.supabase;
    const userId = context.userId;

    const { data: existingActive } = await db
      .from("journey_items")
      .select("id, section_id, state")
      .eq("user_id", userId)
      .in("state", ACTIVE_STATES)
      .maybeSingle();

    if (existingActive && existingActive.section_id !== data.sectionId) {
      throw new Error("Finish, pause or skip the current reading first.");
    }

    const { data: item, error } = await db
      .from("journey_items")
      .upsert(
        {
          user_id: userId,
          section_id: data.sectionId,
          state: "AWAITING_RESPONSE",
          relevance_note: data.relevanceNote ?? null,
          reason_codes: data.reasonCodes ?? [],
          sent_at: new Date().toISOString(),
        },
        { onConflict: "user_id,section_id" },
      )
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await db.from("journey_events").insert({
      user_id: userId,
      item_id: item.id,
      event_type: "section_opened",
      metadata: { section_id: data.sectionId },
    });

    return { itemId: item.id };
  });

const RespondSchema = z.object({
  itemId: z.string().uuid(),
  action: z.enum(["complete", "skip", "pause", "resume", "not_now", "remind_later"]),
});

export const respondToSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RespondSchema.parse(d))
  .handler(async ({ context, data }) => {
    const db = context.supabase;
    const userId = context.userId;

    const { data: item, error: readErr } = await db
      .from("journey_items")
      .select("id, section_id, reminder_count")
      .eq("id", data.itemId)
      .eq("user_id", userId)
      .single();
    if (readErr) throw new Error(readErr.message);

    const patch: {
      state?: string;
      completed_at?: string;
      reminder_count?: number;
      last_reminder_at?: string;
    } = {};
    switch (data.action) {
      case "complete":
        patch.state = "COMPLETED";
        patch.completed_at = new Date().toISOString();
        break;
      case "skip":
        patch.state = "SKIPPED";
        break;
      case "pause":
        patch.state = "PAUSED";
        break;
      case "resume":
        patch.state = "AWAITING_RESPONSE";
        break;
      case "not_now":
        patch.state = "NOT_NOW";
        break;
      case "remind_later":
        patch.state = "AWAITING_RESPONSE";
        patch.reminder_count = (item.reminder_count ?? 0) + 1;
        patch.last_reminder_at = new Date().toISOString();
        break;
    }

    const { error } = await db.from("journey_items").update(patch).eq("id", item.id).eq("user_id", userId);
    if (error) throw new Error(error.message);

    await db.from("journey_events").insert({
      user_id: userId,
      item_id: item.id,
      event_type: `section_${data.action}`,
      metadata: { section_id: item.section_id },
    });

    // Learning loop: skipping a topic lowers its future priority.
    if (data.action === "skip" || data.action === "complete") {
      const { data: sec } = await db
        .from("journey_sections")
        .select("topic")
        .eq("id", item.section_id)
        .maybeSingle();
      const topic = sec?.topic;
      if (topic) {
        const key = data.action === "skip" ? `skipped_topic:${topic}` : `completed_topic:${topic}`;
        const { data: existing } = await db
          .from("journey_signals")
          .select("id, frequency, confidence")
          .eq("user_id", userId)
          .eq("signal_type", "BEHAVIORAL_OBSERVATION")
          .eq("signal_key", key)
          .maybeSingle();
        if (existing) {
          await db
            .from("journey_signals")
            .update({
              frequency: (existing.frequency ?? 1) + 1,
              confidence: Math.min(0.95, Number(existing.confidence ?? 0.5) + 0.1),
              last_observed_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          await db.from("journey_signals").insert({
            user_id: userId,
            signal_type: "BEHAVIORAL_OBSERVATION",
            signal_key: key,
            signal_value: topic,
            confidence: 0.5,
            evidence: [{ item_id: item.id, at: new Date().toISOString() }],
          });
        }
      }
    }

    return { ok: true };
  });

/**
 * A question keeps the current section open. The answer is grounded only in the
 * approved section text, never invented book content.
 */
export const askAboutSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ itemId: z.string().uuid(), question: z.string().min(2).max(1000) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = context.supabase;
    const userId = context.userId;

    const { data: item, error } = await db
      .from("journey_items")
      .select("id, section_id")
      .eq("id", data.itemId)
      .eq("user_id", userId)
      .single();
    if (error) throw new Error(error.message);

    if (isCompletionPhrase(data.question)) {
      return { completed: true, answer: null as string | null };
    }

    const { data: section } = await db
      .from("journey_sections")
      .select("title, content")
      .eq("id", item.section_id)
      .single();

    await db.from("journey_items").update({ state: "QUESTION" }).eq("id", item.id).eq("user_id", userId);
    await db.from("journey_events").insert({
      user_id: userId,
      item_id: item.id,
      event_type: "section_question",
      metadata: {},
    });

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey || !section) {
      return {
        completed: false,
        answer:
          "I can only explain what is written in this section, and I cannot reach the explanation service right now. Please try again shortly.",
      };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You explain one approved reading section to the person reading it. Rules: answer only from the section text provided. If the answer is not in the text, say so plainly. Never invent quotations, book content, diagnosis, or treatment advice. Keep it under 120 words, calm and plain.\n\nSECTION TITLE: ${section.title}\n\nSECTION TEXT:\n${section.content}`,
            },
            { role: "user", content: data.question },
          ],
        }),
      });
      if (!res.ok) throw new Error("gateway");
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const answer = json.choices?.[0]?.message?.content?.trim() ?? "";
      const { recordAiExchange } = await import("@/lib/ai-memory.server");
      void recordAiExchange({
        surface: "journey_section_question",
        userId,
        model: "google/gemini-2.5-flash",
        prompt: data.question,
        response: answer,
        metadata: { sectionTitle: section.title },
      });
      return {
        completed: false,
        answer: answer || "I could not find that in this section.",
      };
    } catch {
      return {
        completed: false,
        answer: "I could not reach the explanation service just now. The section stays open, so nothing is lost.",
      };
    }
  });

export const updateJourneyPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        personalization_enabled: z.boolean().optional(),
        frequency: z.enum(["daily", "every_few_days", "weekly", "paused"]).optional(),
        channels: z.record(z.string(), z.boolean()).optional(),
        topics: z.array(z.string().max(60)).max(20).optional(),
        paused: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("journey_preferences")
      .upsert({ user_id: context.userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin only. Ingests approved book content exactly as supplied. */
const IngestSchema = z.object({
  bookTitle: z.string().min(1).max(300),
  source: z.string().max(300).optional(),
  licenseStatus: z.string().max(120).optional(),
  chapters: z
    .array(
      z.object({
        number: z.number().int().min(0),
        title: z.string().min(1).max(300),
        sections: z
          .array(
            z.object({
              number: z.number().int().min(0),
              title: z.string().min(1).max(300),
              content: z.string().min(1),
              estimatedMinutes: z.number().int().min(1).max(120).optional(),
              topic: z.string().max(120).optional(),
              theme: z.string().max(120).optional(),
              tags: z.array(z.string().max(60)).max(20).optional(),
              sourceLocator: z.string().max(120).optional(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export const ingestJourneyBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IngestSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (isAdmin !== true) throw new Error("Forbidden");

    const db = context.supabase;
    const { data: book, error: bookErr } = await db
      .from("journey_books")
      .insert({
        title: data.bookTitle,
        source: data.source ?? null,
        license_status: data.licenseStatus ?? "approved",
        is_approved: true,
      })
      .select("id")
      .single();
    if (bookErr) throw new Error(bookErr.message);

    let sequence = 0;
    let sectionCount = 0;
    for (const [ci, ch] of data.chapters.entries()) {
      const { data: chapter, error: chErr } = await db
        .from("journey_chapters")
        .insert({ book_id: book.id, number: ch.number, title: ch.title, sequence: ci })
        .select("id")
        .single();
      if (chErr) throw new Error(chErr.message);

      const rows = ch.sections.map((s) => ({
        book_id: book.id,
        chapter_id: chapter.id,
        number: s.number,
        title: s.title,
        content: s.content,
        estimated_minutes: s.estimatedMinutes ?? Math.max(1, Math.round(s.content.split(/\s+/).length / 200)),
        topic: s.topic ?? null,
        theme: s.theme ?? null,
        tags: s.tags ?? [],
        sequence: sequence++,
        source_locator: s.sourceLocator ?? null,
        is_approved: true,
      }));
      const { error: secErr } = await db.from("journey_sections").insert(rows);
      if (secErr) throw new Error(secErr.message);
      sectionCount += rows.length;
    }

    return { bookId: book.id, sections: sectionCount };
  });
