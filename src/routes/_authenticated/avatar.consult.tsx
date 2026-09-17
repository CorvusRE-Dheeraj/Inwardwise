import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { chatWithAvatar } from "@/lib/avatar.functions";
import { useAvatarVault } from "@/lib/avatar-vault";
import { decryptText } from "@/lib/avatar-crypto";
import { buildAvatarSystemPrompt, type AvatarAnswers } from "@/lib/avatar-prompt";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { ProductName, ProductText } from "@/components/products/ProductChrome";

export const Route = createFileRoute("/_authenticated/avatar/consult")({
  head: () => ({
    meta: [
      { title: "Consult your InwardWise Self, InwardWise" },
      {
        name: "description",
        content:
          "Speak with your inner InwardWise Self. It responds through the five factors you answered yourself.",
      },
      { property: "og:title", content: "Consult your InwardWise Self, InwardWise" },
      {
        property: "og:description",
        content: "A private mirror that speaks in your interest, and no one else's.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConsultAvatar,
});

type ChatMessage = { role: "user" | "assistant"; content: string };

const LEGAL_DISCLAIMER =
  "This InwardWise Self consultation is an AI-assisted reflection tool, not a substitute for professional medical, mental health, legal, financial, or other qualified advice. It does not diagnose, treat, or create a professional relationship. If you are in crisis or need urgent help, contact a licensed professional or emergency service near you. Use your own judgment and seek qualified support for decisions that affect your health, safety, rights, or wellbeing.";

function ConsultAvatar() {
  const chatFn = useServerFn(chatWithAvatar);
  const vault = useAvatarVault();

  const [answers, setAnswers] = useState<AvatarAnswers | null>(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load and decrypt the user's own factor answers.
  useEffect(() => {
    if (vault.status !== "unlocked" || !vault.key || !vault.profile) return;
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const meta = auth.user?.user_metadata as { full_name?: string; name?: string } | undefined;
      const { data } = await supabase
        .from("avatar_answers")
        .select("question_key, answer_text")
        .eq("user_id", vault.profile!.user_id);
      const out: AvatarAnswers = {};
      for (const row of data ?? []) {
        out[row.question_key] = await decryptText(vault.key!, row.answer_text);
      }
      if (!cancelled) {
        setName(meta?.full_name || meta?.name || "");
        setAnswers(out);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vault.status, vault.key, vault.profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || sending || !answers) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const systemPrompt = buildAvatarSystemPrompt(answers, name);
      const res = await chatFn({ data: { systemPrompt, messages: next } });
      setMessages([...next, { role: "assistant", content: res.reply || "…" }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages(next);
    } finally {
      setSending(false);
    }
  }

  if (vault.status === "loading") return <div className="min-h-[60vh]" />;

  if (vault.status !== "unlocked") {
    return (
      <div className="mx-auto grid w-[min(900px,calc(100%-2rem))] gap-8 py-20 md:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--rule)] p-8">
          <PinKeypad
            mode={vault.status === "needs-setup" ? "setup" : "enter"}
            busy={vault.busy}
            error={vault.error}
            onSubmit={(pin) =>
              vault.status === "needs-setup" ? vault.setupPin(pin) : vault.unlock(pin)
            }
          />
        </div>
        <Caution>
          Your <ProductName id="self" /> can only speak once your PIN unlocks the answers you wrote. They are decrypted
          in your browser and never readable by anyone else.
        </Caution>
      </div>
    );
  }

  const answeredCount = answers
    ? AVATAR_DIMENSIONS.filter((d) =>
        d.questions.some((q) => (answers[q.key] ?? "").trim()),
      ).length
    : 0;

  return (
    <div
      className="mx-auto flex max-w-3xl flex-col px-6 sm:px-8 pt-12 pb-8"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      <SiteHeader />
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-mono-cap text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span aria-hidden="true">←</span> Home
      </Link>
      <header className="mt-6 mb-6">
        <p className="font-mono-cap text-xs text-muted-foreground">
          Speaking from your own answers · {answeredCount} of {AVATAR_DIMENSIONS.length} factors
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight">
          Hello{name ? `, ${name}` : ""}.
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--rule)] bg-secondary/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Prefer to speak instead of type? Book a spoken consultation and your{" "}
            <ProductName id="self" /> will call you.
          </span>
          <Link
            to="/avatar/consult-schedule"
            className="ink-btn rounded-full px-4 py-2 text-xs font-medium hover:ink-btn-hover"
          >
            Schedule a call
          </Link>
        </div>
        <div className="mt-3 rounded-md border border-[var(--rule)] bg-white px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Your factor answers are classified for internal use. When you begin this consultation,
          they are decrypted in your browser and securely processed by the AI service only to
          generate your response. They are not approved for external sharing.
        </div>
      </header>

      {answers && answeredCount === 0 && (
        <div className="mb-4 rounded-md border border-[var(--rule)] bg-white px-4 py-3 text-sm">
          You haven&apos;t answered any factor questions yet.{" "}
          <Link to="/avatar" className="underline">
            Answer them first
          </Link>{" "}
          so your <ProductName id="self" /> can speak from you, not about people in general.
        </div>
      )}

      <div ref={scrollRef} className="paper-card flex-1 space-y-4 overflow-y-auto rounded-lg p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
          <p className="font-medium">Important legal disclaimer</p>
           <p className="mt-1 leading-relaxed"><ProductText>{LEGAL_DISCLAIMER}</ProductText></p>
          {!disclaimerAcknowledged && (
            <button
              onClick={() => setDisclaimerAcknowledged(true)}
              className="mt-3 inline-flex items-center rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-90"
            >
              I understand, begin consultation
            </button>
          )}
        </div>

        {disclaimerAcknowledged && messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
             <p className="mb-3">Ask your <ProductName id="self" /> anything about you. Try:</p>
            <ul className="space-y-2">
              {[
                "What am I avoiding right now that I shouldn't be?",
                "What in Factor 1 could I turn into a strength this month?",
                "Suggest one small new experience that would stretch me.",
              ].map((s) => (
                <li key={s}>
                  <button
                    onClick={() => setInput(s)}
                    className="text-left text-foreground hover:text-royal"
                  >
                    → {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {disclaimerAcknowledged &&
          messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-lg bg-secondary px-4 py-3 text-sm"
                  : "mr-auto max-w-[90%] rounded-lg border border-[var(--rule)] bg-white px-4 py-3 text-sm leading-relaxed"
              }
            >
              {m.role === "assistant" && (
                <div className="font-mono-cap mb-1 text-[10px] text-royal"><ProductName id="self" /></div>
              )}
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        {disclaimerAcknowledged && sending && (
          <div className="mr-auto max-w-[90%] rounded-lg border border-[var(--rule)] bg-white px-4 py-3 text-sm text-muted-foreground">
            <span className="animate-pulse">Your <ProductName id="self" /> is reflecting…</span>
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <textarea
          aria-label="Message to your InwardWise Self"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder={
            disclaimerAcknowledged
              ? "Speak to your inner self…"
              : "Please read and acknowledge the disclaimer above to begin."
          }
          disabled={!disclaimerAcknowledged}
          className="flex-1 resize-none rounded-md border border-[var(--rule)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40 disabled:bg-muted/40 disabled:text-muted-foreground"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim() || !answers || !disclaimerAcknowledged}
          className="ink-btn self-end rounded-full px-6 py-2.5 text-sm font-medium hover:ink-btn-hover disabled:opacity-50"
        >
          Send
        </button>
      </div>

      <div className="mt-6 text-sm">
        <Link to="/avatar" className="text-muted-foreground hover:text-foreground">
          ← Back to <ProductName id="self" />
        </Link>
        <span className="mx-3 text-muted-foreground">·</span>
        <Link to="/avatar" className="text-muted-foreground hover:text-foreground">
          Edit factors
        </Link>
      </div>
    </div>
  );
}
