import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import alexPortrait from "@/assets/alex-freeman.jpg.asset.json";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Message from the Founder — InwardWise" },
      {
        name: "description",
        content:
          "A message from Alex Freeman, Ph.D. — the history behind InwardWise, and notes to users, colleagues, investors and donors.",
      },
      { property: "og:title", content: "Message from the Founder — InwardWise" },
      { property: "og:description", content: "History, and messages to users, colleagues, investors and donors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: History,
});

const MESSAGES: { eyebrow: string; title: string; body: string[] }[] = [
  {
    eyebrow: "§ 01",
    title: "Message to Users",
    body: [
      "You already know how to think. What the modern day removes is the time and the quiet to do it properly, so decisions get made on instinct, fear or whoever spoke last.",
      "InwardWise gives you back the discipline without the labour. Bring one real decision, answer honestly, and let the process strip out the bias you cannot see from the inside. That is the whole promise, and it is enough.",
    ],
  },
  {
    eyebrow: "§ 02",
    title: "Message to Colleagues",
    body: [
      "This work sits between social psychology, philosophy and applied AI, and it does not belong entirely to any of them. That is exactly why I need people who will argue with it.",
      "If you research decision quality, self-image, stress biology or human-AI interaction, I would rather have your criticism early than your endorsement late. Write to us.",
    ],
  },
  {
    eyebrow: "§ 03",
    title: "Message to Investors",
    body: [
      "The defensible asset here is not a wrapper around a language model. It is a seven-stage philosophical filter, empirically derived over decades and validated against real decisions, plus a five-factor model of self that improves as people use it.",
      "We are building deliberately: measurable improvement in decision quality first, scale second. If that order appeals to you, we should talk.",
    ],
  },
  {
    eyebrow: "§ 04",
    title: "Message to Donors",
    body: [
      "Part of this work has no business model attached to it — helping people in crisis reason their way to a next step, and making that help free at the point of need.",
      "Donations go toward keeping those paths open for people who could never pay for them. Thank you for considering it.",
    ],
  },
];

function History() {
  return (
    <AppShell>
      <section className="mx-auto w-[min(1100px,calc(100%-2rem))] pb-24 pt-10 md:pb-36 md:pt-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono-cap text-[color:var(--muted-foreground)]"
        >
          Message from the Founder
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display mt-4 text-4xl leading-[1.05] tracking-tight text-[color:var(--ink)] md:text-6xl"
        >
          History
        </motion.h1>

        <div className="rule-top mt-8" />

        <div className="mt-10 flex flex-col items-center gap-8 sm:flex-row sm:items-end">
          <div className="paper-card relative aspect-square w-40 shrink-0 overflow-hidden rounded-3xl p-1">
            <img
              src={alexPortrait.url}
              alt="Alex Freeman, Ph.D."
              className="h-full w-full rounded-[1.25rem] object-cover"
            />
          </div>
          <div>
            <div className="font-display text-2xl text-[color:var(--ink)] md:text-3xl">
              Alex Freeman, Ph.D.
            </div>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              Research Scientist and Philosopher
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://www.linkedin.com/in/alex-freeman-phd-591a292a"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--rule)] px-3 py-1.5 text-xs text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
              <a
                href="https://alexfreeman.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--rule)] px-3 py-1.5 text-xs text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]"
              >
                <ExternalLink className="h-3.5 w-3.5" /> alexfreeman.org
              </a>
            </div>
          </div>
        </div>

        <article className="mt-12 max-w-3xl space-y-6 text-[16px] leading-[1.7] text-[color:var(--ink-2)]">
          <p>
            I began my journey as a philosophical person — it is even my earliest memory — a
            somewhat fearless thinker with a detachment from societal thinking norms, driven by a
            constant need for time alone. Even as a child, I used to wonder how inefficient we
            think, how emotional and egoistic we get, and I felt many societal problems were
            self-inflicted from this collective behavior.
          </p>
          <p>
            Only after much education and prior to my Ph.D. did I fall upon the concepts of
            self-image from <em className="font-display italic text-[color:var(--ink)]">Psycho-Cybernetics</em> by Maxwell Maltz. From then on I focused on
            social psychology and developed self-reflection, abstract thinking, fearless
            detachment from established thinking and other philosophical concepts. In parallel I
            was interested in science and engineering and had a strong career as a research
            scientist — and among many innovations I developed problem-solving tools. I felt I
            could bridge my science training into social psychology. My childhood interests kept
            tugging, and eventually — with a friend who shared the same interests — I perfected a
            set of decision-making tools. I tested them thoroughly, using them in my own
            decisions.
          </p>
          <p>
            Then slowly I got caught up in the grinding wheels of life and started using less and
            less of the concepts, though they had led to early success. One challenge was going
            through the laborious thinking process to get to the solutions; it required high
            discipline to strictly follow the process. As we have less time to make decisions and
            more distractions, I stopped following the rigorous process for key decisions. That
            led to some failures.
          </p>
          <p>
            After many years of struggling to keep the technique alive, AI suddenly made the
            process effortless. Simple prompts can keep the process intact. Now key decisions can
            be made very quickly, thanks to the speed of AI.
          </p>
          <p>
            Combining the old wisdom with the new AI tools, I was able to synthesize deep
            philosophical approaches into a very simple 7-step process filter that runs on AI. All
            decisions can go through the 7 steps fast to reach critical decisions in any field for
            anyone — which is my goal.
          </p>
          <p>
            The real innovation is in the philosophical 7-step process of problem solving, but AI
            makes it fast enough to go through these steps fairly easily — so the mental agony to
            stick to the process is taken away, while the filter still removes emotional biases,
            self-ego-based rigidness and fear-based approaches, and forces certain
            self-reflection. In the past, the fast-paced society did not allow fast yet rigorous
            decision making, because we do not take enough time to make important decisions on a
            more informed, impartial and judgement-free basis.
          </p>
          <p className="font-display text-xl text-[color:var(--ink)]">Now that's history.</p>
        </article>

        <div className="rule-top mt-14" />
        <div className="mt-2">
          {MESSAGES.map((m) => (
            <article key={m.title} className="border-b border-[color:var(--rule)] py-10">
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">{m.eyebrow}</span>
              <h2 className="font-display mt-3 text-2xl tracking-tight md:text-3xl">{m.title}</h2>
              <div className="mt-4 max-w-3xl space-y-4 text-[16px] leading-[1.7] text-[color:var(--ink-2)]">
                {m.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="rule-top mt-12" />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/decision"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-5 py-3 text-sm font-medium text-[color:var(--paper)] transition hover:bg-black"
          >
            Start a decision <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/examples"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)] px-5 py-3 text-sm text-[color:var(--ink)] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
          >
            See examples
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
