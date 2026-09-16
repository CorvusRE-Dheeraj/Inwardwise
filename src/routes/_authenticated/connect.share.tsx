import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { PathwayShell, PathwayCard, PathwaySection } from "@/components/connect/PathwayShell";
import { VoiceExperience } from "@/components/connect/VoiceExperience";
import { CONNECT_CATEGORIES } from "@/lib/connect-matching";
import { submitConnectStory } from "@/lib/connect.functions";
import { scheduleStoryCall } from "@/lib/connect-story-call.functions";
import { ProductName } from "@/components/products/ProductChrome";

export const Route = createFileRoute("/_authenticated/connect/share")({
  head: () => ({
    meta: [
      { title: "Connect Share | InwardWise" },
      {
        name: "description",
        content:
          "Record or write your own experience anonymously for someone facing the same thing, reviewed before anyone hears it.",
      },
      { property: "og:title", content: "Connect Share | InwardWise" },
      { property: "og:description", content: "Your experience could help someone else." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SharePathway,
});

const FIELDS = [
  ["situation", "What were you facing?"],
  ["fear", "What were you afraid of?"],
  ["action_taken", "What did you decide or do?"],
  ["outcome", "What happened afterward?"],
  ["lesson", "What did you learn?"],
  ["advice", "What would you tell someone going through this now?"],
] as const;

function WrittenStory() {
  const submit = useServerFn(submitConnectStory);
  const [values, setValues] = useState<Record<string, string>>({});
  const [category, setCategory] = useState<string>(CONNECT_CATEGORIES[0]);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <PathwayCard>
        <p className="text-[15px] leading-relaxed">{done}</p>
      </PathwayCard>
    );
  }

  return (
    <PathwayCard>
      <h2 className="font-display text-2xl">Write it instead</h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
        Your story is submitted as “Anonymous Member” and is never published automatically. A
        moderator reads it first.
      </p>

      <label className="mt-5 block text-sm">
        <span className="mb-1 block text-[color:var(--muted-foreground)]">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-sm"
        >
          {CONNECT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {FIELDS.map(([key, label]) => (
        <label key={key} className="mt-4 block text-sm">
          <span className="mb-1 block text-[color:var(--muted-foreground)]">{label}</span>
          <textarea
            rows={3}
            value={values[key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-[15px]"
          />
        </label>
      ))}

      <label className="mt-5 flex items-start gap-3 text-[14px]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        I understand my submission will be reviewed before it can be shared.
      </label>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <button
        disabled={busy || !agreed || (values.situation ?? "").trim().length < 10}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await submit({
              data: {
                category,
                situation: values.situation!.trim(),
                fear: values.fear,
                action_taken: values.action_taken,
                outcome: values.outcome,
                lesson: values.lesson,
                advice: values.advice,
              },
            });
            setDone(
              "Thank you. Your story is with our reviewers and will only appear once it is approved.",
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not submit right now.");
          } finally {
            setBusy(false);
          }
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" /> {busy ? "Submitting…" : "Submit story"}
      </button>
    </PathwayCard>
  );
}

function StoryCall() {
  const scheduleCall = useServerFn(scheduleStoryCall);
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState("");
  const [category, setCategory] = useState<string>(CONNECT_CATEGORIES[0]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <PathwayCard>
      <h2 className="font-display text-2xl">Or speak it on a call</h2>
      {done ? (
        <p className="mt-3 text-[15px] leading-relaxed">{done}</p>
      ) : (
        <>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
            At the time you choose, <ProductName id="connect" /> calls you and walks you through the
            same questions out loud. What you say is written up anonymously and sent for review.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[color:var(--muted-foreground)]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-sm"
              >
                {CONNECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[color:var(--muted-foreground)]">Phone number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-[15px]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[color:var(--muted-foreground)]">
                When should we call?
              </span>
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-[15px]"
              />
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <button
            disabled={busy || phone.trim().length < 8 || !when}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const res = await scheduleCall({
                  data: {
                    phoneNumber: phone,
                    category,
                    scheduledAt: new Date(when).toISOString(),
                  },
                });
                setDone(
                  `Your story call is scheduled. We will call ${res.phone} at ${new Date(
                    res.scheduledAt,
                  ).toLocaleString()}. Nothing is published until a moderator reviews it.`,
                );
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not schedule the call.");
              } finally {
                setBusy(false);
              }
            }}
            className="mt-6 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
          >
            {busy ? "Scheduling…" : "Schedule my story call"}
          </button>
        </>
      )}
    </PathwayCard>
  );
}

function SharePathway() {
  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={<>Connect <em className="italic text-[color:var(--royal)]">Share</em></>}
      tagline="Your experience could carry someone else."
      intro="Record your experience in your own voice, write it, or speak it on a call. Nothing is shared until you agree to it and a reviewer has been through it, and your name is never attached."
    >
      <PathwaySection>
        <div className="space-y-6">
          <VoiceExperience />
          <WrittenStory />
          <StoryCall />
        </div>
      </PathwaySection>
    </PathwayShell>
  );
}
