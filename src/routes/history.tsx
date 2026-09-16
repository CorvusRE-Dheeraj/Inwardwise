import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, ExternalLink, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { ProductText } from "@/components/products/ProductChrome";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import alexPortrait from "@/assets/alex-freeman.jpg.asset.json";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History, InwardWise" },
      {
        name: "description",
        content:
          "A message from Alex Freeman, Ph.D., the history behind InwardWise, and notes to users, colleagues, investors and donors.",
      },
      { property: "og:title", content: "History, InwardWise" },
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
      "Dear User,",
      "We are excited that you have found us and are exploring our products and services. We don't claim to be therapists or doctors. We are focusing on self-help with our products. Decisions that you take and the final solution is dictated by you. Your inner factors that define you dictate how well you will follow your own decisions you take. What you put into the InwardWise Self factors is what you will get out. Some of the personal information is deep, private, and very personal. Therefore we are implementing password based access to this information. We will also put a self-destruct feature so all of this information can be wiped out if you choose. Also as a company we will not be selling any of the client information any time now or in the future.",
      "Some of the information you have to dig deep might be painful and therefore, we will use mostly verbal motivational interviewing techniques to make you feel comfortable. Some of the suggestions may clash with your emotions and there is a high tendency not to continue to use the platform due to this discomfort. We want to make things more on the positive side, and our InwardWise Connect product safely tries to connect you to other users information without directly connecting you to them, so you can see many people feel the same way as you do, you are not alone struggling with no support. Give us your feedback as often as possible so we can continue to serve you better as the human mind is a very complex system and we have created even more complicated lives by following societal rules and expectations.",
      "Yours Sincerely,",
      "Alex Freeman, Ph.D.",
      "Founder & CEO",
      "InwardWise.com",
    ],
  },
  {
    eyebrow: "§ 02",
    title: "Message to Colleagues",
    body: [
      "Dear Colleagues,",
      "Thank you for your support and incessant energy to contribute to our collective effort to create a better world. Many of you are managing multiple situations like getting a degree, managing family and relationships, multiple jobs. I am very thankful for your contributions.",
      "As we consider ourselves knowledgeable, degreed and educated in the fields of psychology, philosophy and social sciences, we also need to understand that living a life and our experiences of different cultures, geographies and people we encounter should shape our knowledge and understanding. Though institutions like universities are the repositories of theories and extracted knowledge that we have access to, we cannot consider them as the only truth and become myopic in our quest for knowledge. It originates from a scientific curiosity to understand and make sense of things around us, not from knowledge of a theory or a degree. I see this myopia everywhere. Curiosity is the engine of new knowledge. Not reading, learning and reciting or writing scientific papers. Yes these help dig deeper and also develop our brain muscle to tackle complex analysis but they are not the truth. Truth is what you see with your eyes, and listen with your ears, which is the world around you. If you treat the world around you as a laboratory, and all information in it as data to extract from then you will reach independent thinking which is the foundation of a new body of knowledge. Highly accepted theories can be myopic, and simple Youtube videos may contain a lot of empirical data. So you not only need deductive reasoning i.e. break things down but inductive reasoning which is to stitch vastly different areas of observation and make sense out of them rather than limited view information. This search light bias is what will differentiate us from others.",
      "Our institutions will never tell you this, so we walk around thinking we are the experts because we use words like Gestalt and such. But that may make us therapists, and doctors but that's not what we are looking for. We are looking to solve everyday problems of humans who are fairly healthy and going about their business. We are not trying to replace therapists and doctors and instead we are trying to figure out how to improve human conditions for the better in everyday life. We are looking at self help gurus like Tony Robbins, Jay Shetty, Deepak Chopra and Dr. Phil and saying wait a minute, let me understand the basics and the fundamentals first before I accept anyone's opinions. So we are trying to be the scientific reasoning behind much of the advice that gets circulated around the world. Some of this advice is from trying to be popular, get many more views and in the process can become less scientific which we want to avoid.",
      "I somehow believe that nature has given me an immense gift of inductive reasoning (not so much deductive reasoning) and therefore, this integrative methodology is what this company's mission is. Connect vastly diverse pieces of information that traditional research does not allow some times (for example use of psychedelics in neuroscience which only now is gaining popularity) so our view points are broader and inclusive of current non theoretical empirical observations.",
      "Yours Sincerely,",
      "Alex Freeman, Ph.D.",
      "Founder & CEO",
      "InwardWise.com",
    ],
  },
  {
    eyebrow: "§ 03",
    title: "Message to Investors",
    body: [
      "Dear Investors,",
      "This company is found to serve both society and investors if we borrow money as we have an obligation to return it. We also understand that in order to continue to serve the society, we need a sustainable financial system so the benefit can serve larger populations which means we need to reach out to more people and become a larger company. We are not targeting any specific therapy or trying to compete with medical facilities or therapists. Our focus is to improve human condition and performance at a large scale where societies and cultures can change and adapt to the changing world. We need to be able to attract the best people who believe in the same goal. That also needs investments from the community. We understand this dichotomy and can balance both in a sustainable way. Our goal is to optimize this balance, not tip in any one direction too far, even if the opportunity arises. Given this please contact us for any further information on the company financials, culture and team.",
      "Yours Sincerely,",
      "Alex Freeman, Ph.D.",
      "Founder & CEO",
      "InwardWise.com",
    ],
  },
  {
    eyebrow: "§ 04",
    title: "Message to Donors",
    body: [
      "Dear Volunteer and Donor,",
      "Thank you for your kindness and generosity in our cause. Your help is invaluable for us despite being a for profit organization. Certain causes we want to fight for require us not only to focus on broad financial markets for survival and continue to build innovative systems but additional support to sustain causes that don't seem to be financially viable at first glance. Especially in the space of suicide prevention, mental health as we are not trying to be a medical facility or establishment, our efforts have to be subsidized through the generous donations of philanthropic individuals and organizations. We can maintain strict financial controls and records to track the donations being used in an area of interest to the donor. Please call us if this arrangement works for you or your organization.",
      "Yours Sincerely,",
      "Alex Freeman, Ph.D.",
      "Founder & CEO",
      "InwardWise.com",
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
            I began my journey as a philosophical person, it is even my earliest memory, a
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
            scientist, and among many innovations I developed problem-solving tools. I felt I
            could bridge my science training into social psychology. My childhood interests kept
            tugging, and eventually, with a friend who shared the same interests, I perfected a
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
            Combining the old with the new AI tools, I was able to synthesize deep
            philosophical approaches into a very simple 7-step process filter that runs on AI. All
            decisions can go through the 7 steps fast to reach critical decisions in any field for
            anyone, which is my goal.
          </p>
          <p>
            The real innovation is in the philosophical 7-step process of problem solving, but AI
            makes it fast enough to go through these steps fairly easily, so the mental agony to
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
            <Collapsible
              key={m.title}
              defaultOpen={false}
              className="border-b border-[color:var(--rule)]"
            >
              <CollapsibleTrigger asChild>
                <button className="group flex w-full items-center justify-between py-6 text-left transition-colors hover:text-[color:var(--royal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]">
                  <div>
                    <span className="font-mono-cap text-[color:var(--muted-foreground)]">{m.eyebrow}</span>
                    <h2 className="font-display mt-1 text-2xl tracking-tight md:text-3xl">{m.title}</h2>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[color:var(--muted-foreground)] transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pb-10 max-w-3xl space-y-4 text-[16px] leading-[1.7] text-[color:var(--ink-2)]">
                  {m.body.slice(0, -4).map((p, i) => (
                     <p key={i}><ProductText>{p}</ProductText></p>
                  ))}
                  <div className="mt-6 space-y-0 leading-snug">
                    {m.body.slice(-4).map((line, i) => (
                      <p key={i} className="m-0 p-0">{line}</p>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
