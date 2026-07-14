import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Linkedin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import alexPortrait from "@/assets/alex-freeman.jpg";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Objective Solution Framework" },
      {
        name: "description",
        content:
          "The origin story of the Objective Solution Framework — from Alex Freeman's decades of philosophical inquiry to a 7-step AI-facilitated decision engine.",
      },
      { property: "og:title", content: "History — Objective Solution Framework" },
      { property: "og:description", content: "How the 7-step decision framework came to be." },
    ],
  }),
  component: History,
});

function History() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">History</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">The origin of the framework</h1>

        <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <img
            src={alexPortrait}
            alt="Alex Freeman, Ph.D."
            width={160}
            height={160}
            loading="lazy"
            className="h-40 w-40 rounded-3xl object-cover ring-1 ring-glass-border"
          />
          <div>
            <div className="font-display text-2xl">Alex Freeman, Ph.D.</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Research scientist · Decision-intelligence philosopher
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://www.linkedin.com/in/alex-freeman-phd-591a292a"
                target="_blank"
                rel="noreferrer"
                className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-foreground/90 hover:bg-foreground/5"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
              <a
                href="https://alexfreeman.org"
                target="_blank"
                rel="noreferrer"
                className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-foreground/90 hover:bg-foreground/5"
              >
                <ExternalLink className="h-3.5 w-3.5" /> alexfreeman.org
              </a>
            </div>
          </div>
        </div>

        <article className="prose prose-invert mt-10 max-w-none space-y-5 text-[15px] leading-relaxed text-foreground/90">
          <p>
            I began my journey as a philosophical person — it is even my earliest memory — a
            somewhat fearless thinker with a detachment from societal thinking norms, driven by a
            constant need for time alone. Even as a child, I used to wonder how inefficient we
            think, how emotional and egoistic we get, and I felt many societal problems were
            self-inflicted from this collective behavior.
          </p>
          <p>
            Only after much education and prior to my Ph.D. did I fall upon the concepts of
            self-image from <em>Psycho-Cybernetics</em> by Maxwell Maltz. From then on I focused on
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
          <p className="font-display text-xl text-foreground">Now that's history.</p>
        </article>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/decision"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
          >
            Start a decision <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/examples"
            className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-foreground hover:bg-foreground/5"
          >
            See examples
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
