import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  buildSystemPrompt,
  loadProfile,
  type StoredProfile,
} from "@/lib/avatar-storage";
import { chatWithAvatar } from "@/lib/avatar.functions";
import { getPrivateDimensions } from "@/lib/private-dimensions.functions";

export const Route = createFileRoute("/_authenticated/avatar/consult")({
  head: () => ({
    meta: [
      { title: "Consult your Avatar — Decision Philosophy" },
      {
        name: "description",
        content:
          "Speak with your inner self avatar. It responds through your five dimensions — always in service of your evolution.",
      },
      { property: "og:title", content: "Consult your Avatar — Decision Philosophy" },
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

function ConsultAvatar() {
  const chatFn = useServerFn(chatWithAvatar);
  const getPrivate = useServerFn(getPrivateDimensions);
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [privateDims, setPrivateDims] = useState<{
    shadow: string;
    enemy: string;
  } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
    (async () => {
      try {
        const priv = await getPrivate();
        setPrivateDims(priv);
      } catch {
        /* ignore */
      }
    })();
  }, [getPrivate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || !profile || sending) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const systemPrompt = buildSystemPrompt(profile, privateDims);
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

  if (!hydrated) {
    return <div className="min-h-[60vh]" />;
  }

  if (!profile || !profile.name) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono-cap text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span aria-hidden="true">←</span> Home
        </Link>
        <p className="mt-8 font-mono-cap text-xs text-muted-foreground">Not yet born</p>
        <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight">
          Your avatar hasn't been born yet.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Describe your five dimensions first. Even a rough sketch is enough to begin.
        </p>
        <Link
          to="/avatar"
          className="ink-btn mt-8 inline-block rounded-full px-6 py-3 text-sm font-medium hover:ink-btn-hover"
        >
          Build your avatar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-6 sm:px-8 pt-12 pb-8" style={{ minHeight: "calc(100vh - 120px)" }}>
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-mono-cap text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span aria-hidden="true">←</span> Home
      </Link>
      <header className="mt-6 mb-6">
        <p className="font-mono-cap text-xs text-muted-foreground">
          Consulting your inner mirror
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight">
          Hello, {profile.name}.
        </h1>
      </header>

      <div
        ref={scrollRef}
        className="paper-card flex-1 space-y-4 overflow-y-auto rounded-lg p-6"
      >
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="mb-3">Ask your avatar anything about you. Try:</p>
            <ul className="space-y-2">
              {[
                "What am I avoiding right now that I shouldn't be?",
                "What in Dimension 1 could I turn into a strength this month?",
                "Suggest one small new experience that would stretch me.",
              ].map((s) => (
                <li key={s}>
                  <button
                    onClick={() => setInput(s)}
                    className="text-left text-foreground/80 hover:text-royal"
                  >
                    → {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-secondary px-4 py-3 text-sm"
                : "mr-auto max-w-[90%] rounded-lg border border-[var(--rule)] bg-white px-4 py-3 text-sm leading-relaxed"
            }
          >
            {m.role === "assistant" && (
              <div className="font-mono-cap mb-1 text-[10px] text-royal">Avatar</div>
            )}
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {sending && (
          <div className="mr-auto max-w-[90%] rounded-lg border border-[var(--rule)] bg-white px-4 py-3 text-sm text-muted-foreground">
            <span className="animate-pulse">Your avatar is reflecting…</span>
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
          aria-label="Message to your avatar"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Speak to your inner self…"
          className="flex-1 resize-none rounded-md border border-[var(--rule)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="ink-btn self-end rounded-full px-6 py-2.5 text-sm font-medium hover:ink-btn-hover disabled:opacity-50"
        >
          Send
        </button>
      </div>

      <div className="mt-6 text-sm">
        <Link to="/avatar" className="text-muted-foreground hover:text-foreground">
          ← Back to Avatar
        </Link>
        <span className="mx-3 text-muted-foreground">·</span>
        <Link to="/avatar" className="text-muted-foreground hover:text-foreground">
          Edit dimensions
        </Link>
      </div>
    </div>
  );
}
