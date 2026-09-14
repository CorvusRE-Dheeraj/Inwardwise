import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MapPin } from "lucide-react";
import { PathwayShell, PathwayCard, PathwaySection } from "@/components/connect/PathwayShell";
import {
  getConnectOnlyState,
  startConnectOnly,
  suggestConnectOnlyEvents,
  type ConnectOnlyState,
} from "@/lib/connect-only.functions";

export const Route = createFileRoute("/_authenticated/connect/events")({
  head: () => ({
    meta: [
      { title: "Connect Events | InwardWise" },
      {
        name: "description",
        content:
          "Local and online gatherings matched to what you describe, so you can take part rather than read alone.",
      },
      { property: "og:title", content: "Connect Events | InwardWise" },
      { property: "og:description", content: "Something to go to, near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EventsPathway,
});

const field =
  "w-full rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[13px] text-[color:var(--muted-foreground)]">{children}</span>
  );
}

function EventsPanel() {
  const getState = useServerFn(getConnectOnlyState);
  const start = useServerFn(startConnectOnly);
  const suggest = useServerFn(suggestConnectOnlyEvents);

  const [state, setState] = useState<ConnectOnlyState | null>(null);
  const [prompt, setPrompt] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [interests, setInterests] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  useEffect(() => {
    getState({})
      .then((s) => {
        setState(s);
        setLocation(s.location ?? "");
        setAvailability(s.availability ?? "");
        setInterests(s.interests ?? "");
      })
      .catch(() => undefined);
  }, [getState]);

  const hasSession = Boolean(state?.sessionId);

  async function findEvents() {
    if (prompt.trim().length < 8 && !hasSession) {
      setError("Please write a sentence or two about what is going on first.");
      return;
    }
    if (location.trim().length < 2) {
      setError("Please tell Connect the town or city you are in.");
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      if (!hasSession) {
        const s = await start({
          data: {
            prompt: prompt.trim(),
            location: location.trim(),
            availability: availability.trim() || undefined,
            interests: interests.trim() || undefined,
          },
        });
        setState(s);
      }
      const r = await suggest({
        data: {
          location: location.trim(),
          availability: availability.trim() || undefined,
          interests: interests.trim() || undefined,
        },
      });
      setSuggestions(r.suggestions);
      setNote(r.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PathwayCard>
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        Tell Connect where you are
      </div>

      {!hasSession && (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="What is going on for you at the moment?"
          className={`${field} mt-4 resize-y`}
        />
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Town or city</Label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
        </div>
        <div>
          <Label>When are you free?</Label>
          <input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="weekday evenings"
            className={field}
          />
        </div>
        <div>
          <Label>What do you enjoy?</Label>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="walking, books, music"
            className={field}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <button
        onClick={findEvents}
        disabled={busy}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] disabled:opacity-60"
      >
        <MapPin className="h-4 w-4" /> {busy ? "Looking…" : "Find something near me"}
      </button>

      {note && <p className="mt-4 text-[13px] text-[color:var(--royal)]">{note}</p>}
      {suggestions && (
        <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">
          {suggestions}
        </p>
      )}
    </PathwayCard>
  );
}

function EventsPathway() {
  return (
    <PathwayShell
      eyebrow="Connect AI · pathway"
      title={<>Connect <em className="italic text-[color:var(--royal)]">Events</em></>}
      tagline="Somewhere to go, not just something to read."
      intro="Write what is going on, tell Connect where you are and when you are free, and it looks for gatherings you could take part in. If nothing suitable is found, you are told so rather than given something invented."
    >
      <PathwaySection>
        <EventsPanel />
      </PathwaySection>
    </PathwayShell>
  );
}
