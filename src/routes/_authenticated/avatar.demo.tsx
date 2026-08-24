import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import { DEMO_PEOPLE, demoProgress, type DemoPerson } from "@/lib/avatar-demo";
import { chatWithAvatar } from "@/lib/avatar.functions";
import { buildAvatarSystemPrompt } from "@/lib/avatar-prompt";

export const Route = createFileRoute("/_authenticated/avatar/demo")({
  head: () => ({
    meta: [
      { title: "Test drive with Alex or Mary — InwardWise" },
      {
        name: "description",
        content:
          "Try an InwardWise Self before you build your own, using two fictitious people, Alex and Mary.",
      },
      { property: "og:title", content: "Test drive with Alex or Mary — InwardWise" },
      { property: "og:description", content: "See how a built self answers before you build yours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [person, setPerson] = useState<DemoPerson>(DEMO_PEOPLE[0]);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = demoProgress(person);

  async function ask() {
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setReply(null);
    try {
      const res = await chatWithAvatar({
        data: {
          systemPrompt: buildAvatarSystemPrompt(person.answers, person.name),
          messages: [{ role: "user", content: text }],
        },
      });
      setReply(res.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-[min(1000px,calc(100%-2rem))] py-14 sm:py-20">
      <Link
        to="/avatar"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← InwardWise Self Design
      </Link>

      <header className="mt-8 max-w-3xl">
        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          Test drive · fictitious people
        </div>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] tracking-tight">
          Try it as <span className="italic text-[color:var(--royal)]">Alex</span> or{" "}
          <span className="italic text-[color:var(--royal)]">Mary</span>
        </h1>
        <p className="mt-5 text-justify text-base leading-relaxed text-[color:var(--muted-foreground)]">
          Alex and Mary are invented. Their answers are written by us so you can see what an
          InwardWise Self sounds like before you write a single word of your own. Nothing here is
          connected to your account.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {DEMO_PEOPLE.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPerson(p);
              setReply(null);
            }}
            className={`rounded-lg border p-6 text-left transition ${
              person.id === p.id
                ? "border-[color:var(--ink)]"
                : "border-[color:var(--rule)] hover:border-[color:var(--ink)]/40"
            }`}
          >
            <div className="font-display text-2xl">{p.name}</div>
            <p className="mt-2 text-justify text-sm text-[color:var(--muted-foreground)]">
              {p.line}
            </p>
            <div className="mt-4 space-y-2">
              {AVATAR_DIMENSIONS.map((d) => (
                <div key={d.n} className="flex items-center gap-3">
                  <span className="font-mono-cap w-16 text-[10px] text-[color:var(--muted-foreground)]">
                    Factor {d.n}
                  </span>
                  <span className="h-px flex-1 bg-[color:var(--rule)]">
                    <span
                      className="block h-px bg-[color:var(--ink)]"
                      style={{ width: `${progress[d.n]}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <section className="mt-12">
        <label className="block text-sm">
          <span className="mb-2 block text-[color:var(--muted-foreground)]">
            Ask {person.name}&rsquo;s InwardWise Self something
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`I have been offered a job in another city. What should ${person.name} weigh?`}
            className="min-h-[120px] w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
          />
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={ask}
            disabled={busy || !prompt.trim()}
            className="rounded-full bg-[color:var(--ink)] px-6 py-2 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
          >
            {busy ? "Thinking…" : "Ask"}
          </button>
          <Link
            to="/avatar"
            className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px]"
          >
            Build my own self
          </Link>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
        {reply && (
          <div className="mt-8 rounded-lg border border-[color:var(--rule)] p-6">
            <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              {person.name}&rsquo;s InwardWise Self
            </div>
            <p className="mt-3 whitespace-pre-wrap text-justify text-[15px] leading-relaxed">
              {reply}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
