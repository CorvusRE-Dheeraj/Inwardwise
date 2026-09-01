import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Flag,
  Headphones,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { CONNECT_CATEGORIES } from "@/lib/connect-matching";
import {
  analyzeConnectPrompt,
  joinConnectGroupWaitlist,
  reportConnectContent,
  submitConnectStory,
} from "@/lib/connect.functions";
import { scheduleStoryCall } from "@/lib/connect-story-call.functions";
import { ProductName } from "@/components/products/ProductChrome";

export const Route = createFileRoute("/_authenticated/connect")({
  head: () => ({
    meta: [
      { title: "Connect — Be Yourself and Belong | InwardWise" },
      {
        name: "description",
        content:
          "Share what is on your mind and find relevant perspectives, anonymous experiences and constructive ways to connect — while your private Self stays private.",
      },
      { property: "og:title", content: "Connect — Be Yourself and Belong | InwardWise" },
      {
        property: "og:description",
        content: "A private, AI-mediated way to discover that you are not alone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConnectPage,
});

type Analysis = Awaited<ReturnType<typeof analyzeConnectPrompt>>;
type Story = Analysis["stories"][number];

const CHIPS = [
  "I feel lonely even when I am around people",
  "I'm thinking about changing careers",
  "I feel stuck and don't know what to do next",
  "I'm having difficulty in a relationship",
  "I feel like everyone else is doing better than me",
  "I recently went through a major life change",
];

const ANALYSIS_STEPS = [
  "Looking at your Self context…",
  "Finding relevant experiences…",
  "Finding people facing similar situations…",
  "Preparing constructive options…",
];

const DISCLAIMER =
  "InwardWise is designed for reflection, belonging and constructive peer connection. It is not therapy, medical care, legal advice, or emergency support.";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">{children}</div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[color:var(--rule)] p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function ConnectPage() {
  const analyze = useServerFn(analyzeConnectPrompt);
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"input" | "analyzing" | "results">("input");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [openStory, setOpenStory] = useState<Story | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportFor, setReportFor] = useState<Story | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "analyzing") return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1)), 900);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "results") resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  async function onSubmit() {
    if (prompt.trim().length < 8) {
      setError("Tell InwardWise a little more — a sentence or two is enough.");
      return;
    }
    setError(null);
    setPhase("analyzing");
    const started = Date.now();
    try {
      const data = await analyze({ data: { prompt: prompt.trim() } });
      const wait = Math.max(0, 3200 - (Date.now() - started));
      setTimeout(() => {
        setResult(data);
        setPhase("results");
      }, wait);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPhase("input");
    }
  }

  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="decision-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="mx-auto w-[min(1100px,calc(100%-2rem))] pt-12 md:pt-20">
          <div className="flex items-center justify-between">
            <span className="font-mono-cap"><ProductName id="connect" /></span>
            <span className="hidden font-mono-cap md:inline">Be Yourself and Belong</span>
          </div>
          <div className="hairline mt-4" />

          <h1 className="font-display mt-12 max-w-3xl text-[clamp(2.6rem,8vw,5.2rem)] leading-[0.98] tracking-tight">
            Connect
          </h1>
          <p className="mt-6 max-w-2xl font-display text-[clamp(1.3rem,3vw,2rem)] italic leading-snug text-[color:var(--royal)]">
            Be yourself. Discover that you are not alone.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--muted-foreground)]">
            Share what’s on your mind. <ProductName id="connect" /> can help you. Type your prompt below. If you think
            you need to make a decision based on your prompt, then click that button. If you want to
            become self aware and have already completed your <ProductName id="self" /> build, then use the Self Aware
            button below to get responses specific to your <ProductName id="self" />.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/decision"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3 text-sm text-[color:var(--paper)] transition hover:opacity-90"
            >
              Make Decision <span aria-hidden>→</span>
            </Link>
            <Link
              to="/avatar/ask"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--ink)] px-6 py-3 text-sm transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
            >
              Self Aware <span aria-hidden>→</span>
            </Link>
          </div>

        </div>
      </section>

      {/* SAUP */}
      <section className="mx-auto mt-14 w-[min(1100px,calc(100%-2rem))]">
        <Card>
          <Eyebrow>§ 01 · Self Aware User Prompt</Eyebrow>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl">What’s going on with you?</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            disabled={phase === "analyzing"}
            placeholder="Tell InwardWise what you are experiencing, thinking about, deciding, or struggling with…"
            className="mt-5 w-full resize-y rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setPrompt(c)}
                className="rounded-full border border-[color:var(--rule)] px-4 py-1.5 text-[13px] text-[color:var(--muted-foreground)] transition hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
              >
                {c}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              onClick={onSubmit}
              disabled={phase === "analyzing"}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[color:var(--ink)] px-6 py-3.5 text-sm text-[color:var(--paper)] transition-transform duration-500 hover:-translate-y-0.5 disabled:opacity-60"
            >
              Find Perspective &amp; Connection <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[13px] text-[color:var(--muted-foreground)]">
              Your private Self profile is never shown to other members.
            </p>
          </div>
        </Card>
      </section>

      {/* Analysis state */}
      <AnimatePresence>
        {phase === "analyzing" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-10 w-[min(1100px,calc(100%-2rem))]"
          >
            <Card>
              <Eyebrow>Understanding your situation…</Eyebrow>
              <div className="mt-5 space-y-3">
                {ANALYSIS_STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`flex items-center gap-3 text-[15px] transition-opacity duration-500 ${
                      i <= step ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        i <= step ? "bg-[color:var(--royal)]" : "bg-[color:var(--rule)]"
                      }`}
                    />
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-6 h-px w-full overflow-hidden bg-[color:var(--rule)]">
                <motion.div
                  className="h-px bg-[color:var(--ink)]"
                  initial={{ width: "5%" }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 3.4, ease: "easeInOut" }}
                />
              </div>
            </Card>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Results */}
      <div ref={resultsRef} />
      {phase === "results" && result && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
          className="mx-auto mt-12 w-[min(1100px,calc(100%-2rem))] space-y-6"
        >
          {result.riskFlag && (
            <Card className="border-destructive/40">
              <Eyebrow>Please read</Eyebrow>
              <p className="mt-3 text-sm leading-relaxed">
                Some of what you wrote suggests you may be in real distress. InwardWise is not
                emergency support. If you are in danger or thinking about harming yourself, please
                contact your local emergency number or a crisis line in your country right away.
              </p>
            </Card>
          )}

          {/* Path banner: personal (Self built) vs collective */}
          <Card className="border-[color:var(--royal)]/30">
            <Eyebrow>§ 01 · {result.selfBuilt ? "Personal path" : "Collective path"}</Eyebrow>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-justify">
              {result.selfBuilt
                ? <>Because you have completed your <ProductName id="self" />, this reading is written for someone who has already done that work. Alongside it you will find what others in the same situation have found, <ProductName id="connect" /> book content, and reviewed stories from other members. Your answers stay encrypted and private.</>
                : <>You have not finished building your <ProductName id="self" /> yet, so this reading draws on what many people in the same situation have found, together with <ProductName id="connect" /> book content and reviewed stories from other members.</>}
            </p>
            {!result.selfBuilt && (
              <Link
                to="/avatar"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
              >
                Build your <ProductName id="self" /> <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </Card>

          {/* A. You are not alone */}
          <Card className="bg-[color:var(--royal)]/[0.04]">
            <Eyebrow>§ 02 · {result.category}</Eyebrow>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              You’re <em className="italic text-[color:var(--royal)]">not alone</em>
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
              {result.aggregate
                ? result.aggregate
                : "We’re still building this community. InwardWise can still help you explore relevant stories and perspectives."}
            </p>
          </Card>

          {/* B. Perspective */}
          <Card>
            <Eyebrow>§ 03 · Private to you</Eyebrow>
            <h2 className="font-display mt-3 text-2xl sm:text-3xl">A perspective for you</h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed">{result.reflection}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/decision"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)]"
              >
                Explore this privately <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {result.selfBuilt && (
                <Link
                  to="/avatar/ask"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-5 py-2.5 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                >
                  Ask <ProductName id="self" />
                </Link>
              )}
            </div>
          </Card>

          {/* C. Reading */}
          <ReadingCard reading={result.reading} />

          {result.book && (
            <Card>
              <Eyebrow>§ 04b · From the <ProductName id="connect" /> book</Eyebrow>
              <h3 className="font-display mt-3 text-2xl italic text-[color:var(--royal)]">
                {result.book.chapter} · {result.book.title}
              </h3>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-justify">
                {result.book.excerpt}
              </p>
              <ul className="mt-5 space-y-2">
                {result.book.takeaways.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--royal)]" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* D. Stories */}
          <section>
            <Eyebrow>§ 05 · From people who have been there</Eyebrow>
            <h2 className="font-display mt-3 text-2xl sm:text-3xl">
              What others have lived through
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              Written and recorded stories from other members, reviewed before publication.
            </p>
            {result.stories.length === 0 ? (
              <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
                No reviewed stories are available yet. You can be the first to share one below.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {result.stories.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col rounded-lg border border-[color:var(--rule)] p-6"
                  >
                    <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                      {s.pseudonym} · {s.category}
                    </div>
                    <p className="mt-3 flex-1 text-[15px] leading-relaxed">{s.situation}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setOpenStory(s)}
                        className="rounded-full border border-[color:var(--rule)] px-4 py-2 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                      >
                        Read Story
                      </button>
                      {s.audio_url && (
                        <a
                          href={s.audio_url}
                          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-4 py-2 text-[13px]"
                        >
                          <Headphones className="h-3.5 w-3.5" /> Listen to Story
                        </a>
                      )}
                      <button
                        onClick={() => setReportFor(s)}
                        className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-[color:var(--muted-foreground)] hover:text-destructive"
                      >
                        <Flag className="h-3 w-3" /> Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* How would you like to connect */}
          <ConnectChoices category={result.category} support={result.support} activities={result.activities} />

          {/* Contribute */}
          <Card>
            <Eyebrow>§ 07 · Contribute</Eyebrow>
            <h2 className="font-display mt-3 text-2xl sm:text-3xl">
              Your experience could help someone else
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
              If you have been through something that others may be facing now, you can share your
              story anonymously for review.
            </p>
            <button
              onClick={() => setShareOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)]"
            >
              Share My Story <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Card>

          <p className="pb-8 text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
            <ShieldCheck className="mr-2 inline h-3.5 w-3.5" />
            {DISCLAIMER} Peer responses are shared experience, not professional advice.
          </p>
        </motion.div>
      )}

      {openStory && <StoryModal story={openStory} onClose={() => setOpenStory(null)} />}
      {shareOpen && <ShareStoryModal onClose={() => setShareOpen(false)} />}
      {reportFor && <ReportModal story={reportFor} onClose={() => setReportFor(null)} />}
    </AppShell>
  );
}

function ReadingCard({ reading }: { reading: Analysis["reading"] }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  return (
    <Card>
      <Eyebrow>§ 04 · {reading.eyebrow}</Eyebrow>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">From <ProductName id="connect" /></h2>
      <h3 className="mt-4 font-display text-xl italic text-[color:var(--royal)]">{reading.title}</h3>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--muted-foreground)]">
        {reading.summary}
      </p>
      {expanded && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed">{reading.body}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full border border-[color:var(--rule)] px-4 py-2 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
        >
          {expanded ? "Hide Summary" : "Read Summary"}
        </button>
        <button
          onClick={() => setNote("An audio reading of this piece is being recorded — it will appear here soon.")}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-4 py-2 text-[13px]"
        >
          <Headphones className="h-3.5 w-3.5" /> Listen
        </button>
        <button
          onClick={() => setNote("Email delivery for InwardWise readings is coming shortly.")}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rule)] px-4 py-2 text-[13px]"
        >
          <Mail className="h-3.5 w-3.5" /> Send to Email
        </button>
        {note && <span className="text-[13px] text-[color:var(--royal)]">{note}</span>}
      </div>
    </Card>
  );
}

function ConnectChoices({
  category,
  support,
  activities,
}: {
  category: string;
  support: Analysis["support"];
  activities: Analysis["activities"];
}) {
  const joinWaitlist = useServerFn(joinConnectGroupWaitlist);
  const [open, setOpen] = useState<null | "groups" | "support" | "activities">(null);
  const [groupNote, setGroupNote] = useState<string | null>(null);

  async function seeGroups() {
    setOpen("groups");
    try {
      const res = await joinWaitlist({ data: { category } });
      setGroupNote(
        res.waitlisted
          ? "You’re on the waitlist. Several members are working through a similar situation; you’ll be notified when a moderated conversation opens."
          : "No conversation is open for this situation yet. We’ll let you know when one forms.",
      );
    } catch {
      setGroupNote("We couldn’t reach the waitlist just now. Please try again shortly.");
    }
  }

  const cards = [
    {
      key: "private",
      icon: Lock,
      title: "Continue with InwardWise",
      desc: "Explore this privately with your InwardWise Self and decision tools.",
      cta: "Continue Privately",
      to: "/avatar/ask" as const,
    },
    {
      key: "stories",
      icon: MessageCircle,
      title: "Read Similar Stories",
      desc: "See anonymous experiences from people who have faced something similar.",
      cta: "View Stories",
      action: () => document.getElementById("connect-stories-anchor")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      key: "group",
      icon: Users,
      title: "Join a Small Conversation",
      desc: "Join a temporary, moderated conversation with a small number of members discussing a similar situation.",
      cta: "See Available Groups",
      action: seeGroups,
    },
    {
      key: "support",
      icon: ShieldCheck,
      title: "Talk to Someone",
      desc: "Explore available trained listeners, volunteers, support-team members, or appropriate professional resources.",
      cta: "Explore Support Options",
      action: () => setOpen("support"),
    },
    {
      key: "activities",
      icon: Sparkles,
      title: "Find Something to Do",
      desc: "Discover constructive activities or events related to your interests and situation.",
      cta: "Explore Activities",
      action: () => setOpen("activities"),
    },
  ];

  return (
    <section>
      <span id="connect-stories-anchor" />
      <Eyebrow>§ 06 · Your choice</Eyebrow>
      <h2 className="font-display mt-3 text-2xl sm:text-3xl">How would you like to connect?</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          const inner = (
            <>
              <Icon className="h-4 w-4 text-[color:var(--royal)]" />
              <div className="mt-4 font-display text-xl">{c.title}</div>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
                {c.desc}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[13px] text-[color:var(--ink)]">
                {c.cta} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </>
          );
          return c.to ? (
            <Link
              key={c.key}
              to={c.to}
              className="flex flex-col rounded-lg border border-[color:var(--rule)] p-6 text-left transition hover:bg-[color:var(--ink)]/[0.02]"
            >
              {inner}
            </Link>
          ) : (
            <button
              key={c.key}
              onClick={c.action}
              className="flex flex-col rounded-lg border border-[color:var(--rule)] p-6 text-left transition hover:bg-[color:var(--ink)]/[0.02]"
            >
              {inner}
            </button>
          );
        })}
      </div>

      {open === "groups" && (
        <Card className="mt-4">
          <Eyebrow>Small conversations</Eyebrow>
          <p className="mt-3 text-[15px] leading-relaxed">
            {groupNote ?? "Checking for a moderated conversation on this situation…"}
          </p>
          <ul className="mt-4 space-y-1.5 text-[13px] text-[color:var(--muted-foreground)]">
            <li>· One topic, four to eight members, pseudonymous throughout.</li>
            <li>· Guided prompts, a moderator, and a defined start and end.</li>
            <li>· Report, block and leave controls in every conversation.</li>
          </ul>
        </Card>
      )}

      {open === "support" && (
        <Card className="mt-4">
          <Eyebrow>Support options</Eyebrow>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {support.map((s) => (
              <div key={s.title} className="rounded-md border border-[color:var(--rule)] p-4">
                <div className="text-[15px]">{s.title}</div>
                <p className="mt-1.5 text-[13px] text-[color:var(--muted-foreground)]">{s.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-[color:var(--muted-foreground)]">{DISCLAIMER}</p>
        </Card>
      )}

      {open === "activities" && (
        <Card className="mt-4">
          <Eyebrow>Activities</Eyebrow>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {activities.map((a) => (
              <div key={a.title} className="rounded-md border border-[color:var(--rule)] p-4">
                <div className="text-[15px]">{a.title}</div>
                <p className="mt-1.5 text-[13px] text-[color:var(--muted-foreground)]">{a.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-[color:var(--muted-foreground)]">
            Nearby suggestions can be added later — <ProductName id="connect" /> does not ask for your location.
          </p>
        </Card>
      )}
    </section>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[color:var(--rule)] bg-[color:var(--paper)] p-6 sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--rule)]"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function StoryModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const rows: [string, string | null][] = [
    ["Situation", story.situation],
    ["What I was afraid of", story.fear],
    ["What I chose", story.action_taken],
    ["What happened afterward", story.outcome],
    ["What I learned", story.lesson],
    ["What I would tell someone in the same situation", story.advice],
  ];
  return (
    <Modal onClose={onClose}>
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        {story.pseudonym} · {story.category}
      </div>
      <div className="mt-5 space-y-5">
        {rows
          .filter(([, v]) => !!v)
          .map(([label, value]) => (
            <div key={label}>
              <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                {label}
              </div>
              <p className="mt-1.5 text-[15px] leading-relaxed">{value}</p>
            </div>
          ))}
      </div>
      <p className="mt-6 text-[12px] text-[color:var(--muted-foreground)]">{DISCLAIMER}</p>
    </Modal>
  );
}

function ReportModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const report = useServerFn(reportConnectContent);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <Modal onClose={onClose}>
      <h3 className="font-display text-2xl">Report this story</h3>
      {done ? (
        <p className="mt-4 text-[15px]">
          Thank you. A moderator will review this. You can also block this content from your view.
        </p>
      ) : (
        <>
          <p className="mt-3 text-[14px] text-[color:var(--muted-foreground)]">
            Tell us what is wrong with “{story.category}” — {story.pseudonym}.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="mt-4 w-full rounded-md border border-[color:var(--rule)] bg-transparent px-4 py-3 text-[15px]"
          />
          <button
            disabled={busy || reason.trim().length < 4}
            onClick={async () => {
              setBusy(true);
              try {
                await report({ data: { target_type: "story", target_id: story.id, reason: reason.trim() } });
                setDone(true);
              } finally {
                setBusy(false);
              }
            }}
            className="mt-5 rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
          >
            {busy ? "Sending…" : "Submit report"}
          </button>
        </>
      )}
    </Modal>
  );
}

const STORY_FIELDS = [
  ["situation", "What were you facing?"],
  ["fear", "What were you afraid of?"],
  ["action_taken", "What did you decide or do?"],
  ["outcome", "What happened afterward?"],
  ["lesson", "What did you learn?"],
  ["advice", "What would you tell someone going through this now?"],
] as const;

function ShareStoryModal({ onClose }: { onClose: () => void }) {
  const submit = useServerFn(submitConnectStory);
  const scheduleCall = useServerFn(scheduleStoryCall);
  const [mode, setMode] = useState<"write" | "call">("write");
  const [values, setValues] = useState<Record<string, string>>({});
  const [category, setCategory] = useState<string>(CONNECT_CATEGORIES[0]);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState("");

  return (
    <Modal onClose={onClose}>
      <h3 className="font-display text-2xl">Share your story</h3>
      {done ? (
        <p className="mt-4 text-[15px] leading-relaxed">{done}</p>
      ) : (
        <>
          <p className="mt-3 text-[14px] text-[color:var(--muted-foreground)]">
            Your story is submitted anonymously as “Anonymous Member” and is never published
            automatically, a moderator reviews it first.
          </p>

          <div className="mt-5 inline-flex rounded-full border border-[color:var(--rule)] p-1">
            {([
              ["write", "Write it"],
              ["call", "Speak it on a call"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setMode(key);
                  setError(null);
                }}
                className={`rounded-full px-4 py-1.5 text-[12px] transition ${
                  mode === key
                    ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
                    : "text-[color:var(--muted-foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

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

          {mode === "write" ? (
            STORY_FIELDS.map(([key, label]) => (
              <label key={key} className="mt-4 block text-sm">
                <span className="mb-1 block text-[color:var(--muted-foreground)]">{label}</span>
                <textarea
                  rows={3}
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-[15px]"
                />
              </label>
            ))
          ) : (
            <>
              <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
                At the time you choose, <ProductName id="connect" /> calls you and walks you through the same six
                questions out loud. What you say is written up as an anonymous story and sent for
                review, exactly like a written one.
              </p>
              <label className="mt-4 block text-sm">
                <span className="mb-1 block text-[color:var(--muted-foreground)]">
                  Phone number (international format)
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+14155550123"
                  className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-[15px]"
                />
              </label>
              <label className="mt-4 block text-sm">
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
            </>
          )}

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

          <div className="mt-6 flex flex-wrap gap-3">
            {mode === "write" ? (
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
                    setDone("Thank you. Your story has been submitted for review and will only appear once a moderator approves it.");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not submit right now.");
                  } finally {
                    setBusy(false);
                  }
                }}
                className="rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit Story"}
              </button>
            ) : (
              <button
                disabled={busy || !agreed || phone.trim().length < 8 || !when}
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
                className="rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-[13px] text-[color:var(--paper)] disabled:opacity-50"
              >
                {busy ? "Scheduling…" : "Schedule My Story Call"}
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

