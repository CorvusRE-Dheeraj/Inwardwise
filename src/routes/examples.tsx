import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: "Examples — OOOI" },
      { name: "description", content: "Four real OOOI walk-throughs from the framework — marriage, career, friendship, and forgiveness — end-to-end across all 7 steps." },
    ],
  }),
  component: Examples,
});

interface Example {
  category: string;
  title: string;
  situation: string;
  objective: string;
  solutions: string[];      // A/B/C/D
  refine: string;           // bias / fear
  abstracted: string;
  boundary: string;
  outin: { fragment: string; answer: string }[];
}

const EXAMPLES: Example[] = [
  {
    category: "Marriage",
    title: "Spousal situation",
    situation:
      "My spouse and I have been arguing for years. We rarely enjoy spending time together. We have two children and I am considering divorce, but I don't want to hurt the kids. What should I do?",
    objective:
      "Present the first three outcomes to the other partner and watch signals over 6 months, then act.",
    solutions: [
      "A · Stay happily married — real commitment from both sides.",
      "B · Stay unhappily married — family, kids' health and safety compromised.",
      "C · Separate on good terms — cooperative, financially prepared.",
      "D · Separate on bad terms — social stigma, financial fight, risk to children while dating.",
    ],
    refine:
      "Face the negatives most people avoid: kids affected by divorce, exposure to babysitting/dating risks, social judgment. If you stay and it's wasted time, life is wasted too. Prepare for the unfavorable path so you're not deciding out of fear.",
    abstracted:
      "For marriage to work, both partners need to be compatible, committed, and think about the whole family — not just themselves. I need to figure this out in 6 months.",
    boundary:
      "Are both partners understanding what staying married means to them, and maintaining that compatibility and commitment for the betterment of everyone in the family? Monitor for the next 6 months for signals and prepare yourself for emotional and financial independence if signals are negative.",
    outin: [
      {
        fragment: "Are both partners understanding what staying married means to them",
        answer: "Communicate. Find out what marriage means to each, what each has to give up to stay compatible and committed, and what neither should give up so it doesn't feel like a jail.",
      },
      { fragment: "maintaining that compatibility", answer: "Decide how you will actually maintain it and how you will measure it — not intentions, observable behavior." },
      { fragment: "and commitment for the betterment of everyone in the family", answer: "Look for commitment through actions, not words." },
      { fragment: "Monitor for the next 6 months for signals", answer: "Watch monthly for whether things are improving; you've given both of you a clear deadline to turn things around." },
      { fragment: "prepare yourself for emotional and financial independence if signals are negative", answer: "Build emotional strength (self-love, support network, no dependence on manipulation) and a financial cushion so you can act from strength, not fear." },
    ],
  },
  {
    category: "Career",
    title: "Great career decisions",
    situation:
      "I want to have a great career. Despite hard work I never had one — not by anyone's standard, especially my spouse's.",
    objective:
      "Understand how the engineering field is changing so I can follow the growth trends and keep salary and promotions moving.",
    solutions: [
      "A · Get into a top university as a stepping stone.",
      "B · Retrain into a fast-growth engineering discipline.",
      "C · Turn entrepreneur and build a successful career.",
      "D · Drift with idealism and specialization in a shrinking field.",
    ],
    refine:
      "I over-specialized in R&D that didn't produce revenue. I had ego about not following the crowd into CS. I never studied entrepreneurship — customers, marketing, iteration. Bias: 'someone great doesn't need a university name.' Fear: admitting I was boxed in.",
    abstracted:
      "I should have understood which new companies were emerging and which universities were ahead of those trends — and steered into them.",
    boundary:
      "Use a great university as a stepping stone career, or grow into a fast-growth industry to keep a highly successful career, or turn into an entrepreneur with an eventual successful career.",
    outin: [
      { fragment: "Use a great university as a stepping stone career", answer: "Work to get into a great school; treat it as leverage, not identity." },
      { fragment: "grow into a fast-growth industry to keep a highly successful career", answer: "Spot the trends and steer into them between career gaps." },
      { fragment: "turn into an entrepreneur with an eventual successful career", answer: "Study entrepreneurship — customers, marketing, product development, iteration loops." },
    ],
  },
  {
    category: "Friendship",
    title: "Keeping a stingy friend",
    situation: "My friend behaves very stingily. It affects me every time.",
    objective: "Have my friend's behavior stop affecting me.",
    solutions: [
      "A · Accept the behavior and understand its origin.",
      "B · Ask him to change (rarely lasts).",
      "C · Quietly reduce contact.",
      "D · Cut him off dramatically (ego-driven).",
    ],
    refine:
      "Wanting him to change when we're together is ego-driven — that can't be the objective. Maybe I'm too judgmental. Maybe I'm judging him on a few occasions, not the pattern. I may owe him understanding of his past before I decide.",
    abstracted:
      "Understanding both my past (why it bothers me) and his past (why he became this way) may be important. Do the positives outweigh the negative feelings?",
    boundary:
      "There is something in me that really bothers me when I am judging others, and there is some reason people behave stingily — understanding both is important to decide about a friendship that started because of some positives you found initially.",
    outin: [
      { fragment: "There is something in me that really bothers me when I am judging others", answer: "Examine your behavior and why it formed in early childhood — why judging others affects you so much." },
      { fragment: "there is some reason people behave stingily, understanding both are important", answer: "What made him stingy? What were his growing up years like? Knowing this may give you a soft corner so it won't bother you anymore." },
      { fragment: "decide about a friendship that started because of some positives you found initially", answer: "Assess both positives and negatives so you remember the positives every time a negative bothers you." },
    ],
  },
  {
    category: "Ethics",
    title: "Someone took advantage of your kindness",
    situation:
      "We lent our car to a friend who said he needed it temporarily while we were out of town. When we returned, the odometer showed 2,000 extra miles. They used it for a long trip without telling us.",
    objective:
      "Confront them — either they deny it or justify it. Explain what they did wrong. My anger says this is justified.",
    solutions: [
      "A · Keep the friendship.",
      "B · Lose the friendship.",
      "C · (Ego-driven) Make them realize and apologize — usually the reflex.",
      "D · (Ego-driven) Change their behavior — rarely happens.",
    ],
    refine:
      "My spouse suggested forgiveness instead. Learning about their poverty growing up gave context — they may not have known how to behave around a luxury. The action was still wrong, but the reaction doesn't have to be ego. Fear framing: anger justifies itself.",
    abstracted:
      "This may be an opportunity for me to practice forgiveness, rather than change the situation, educate someone, or satisfy my ego.",
    boundary:
      "This is an opportunity for me to demonstrate true forgiveness — I didn't need them as friends, but because they were my spouse's distant relatives, I needed to demonstrate to my spouse that I do have the capacity to forgive even when I am wronged.",
    outin: [
      {
        fragment: "This is an opportunity for me to demonstrate true forgiveness though I didn't need them as friends",
        answer: "Hard to do, but focusing on their poverty growing up rather than what they did helped. Set one objective and drive toward it — don't let anger keep swapping it.",
      },
      {
        fragment: "because they were my spouse's distant relatives, I needed to demonstrate to my spouse that I have the capacity to forgive even when wronged",
        answer: "Don't stress. Don't replay the scene and re-trigger anger — that's stress-induced damage. Pretend I didn't know, forgive, and move on. I never spoke to them again — but without carrying it.",
      },
    ],
  },
];

function Examples() {
  return (
    <AppShell>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Examples</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">From rushed answer to right objective</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Four cases from the OOOI framework, walked end-to-end across all seven steps.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {EXAMPLES.map((ex) => (
          <ExampleCard key={ex.title} ex={ex} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/decision" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm text-background">
          Run OOOI on your own situation <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </AppShell>
  );
}

function ExampleCard({ ex }: { ex: Example }) {
  return (
    <article className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{ex.category}</span>
          <h2 className="font-display mt-1 text-2xl">{ex.title}</h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] text-accent">7 steps</span>
      </div>

      <div className="mt-6 grid gap-3">
        <StepBlock n={1} label="Situation">{ex.situation}</StepBlock>
        <StepBlock n={2} label="Objective">{ex.objective}</StepBlock>
        <StepBlock n={3} label="Solutions">
          <ul className="space-y-1.5">
            {ex.solutions.map((s) => <li key={s} className="text-sm text-muted-foreground">{s}</li>)}
          </ul>
        </StepBlock>
        <StepBlock n={4} label="Refined (Bias & Fear)">{ex.refine}</StepBlock>
        <StepBlock n={5} label="Abstracted Objective" highlight>{ex.abstracted}</StepBlock>
        <StepBlock n={6} label="Boundary Defined" highlight>{ex.boundary}</StepBlock>
        <StepBlock n={7} label="Out-In Approach">
          <ol className="space-y-3">
            {ex.outin.map((p, i) => (
              <li key={i} className="rounded-2xl bg-foreground/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[10px] text-background">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div>
                    <div className="text-sm italic text-foreground/90">"{p.fragment}"</div>
                    <div className="mt-1.5 text-sm text-muted-foreground">→ {p.answer}</div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </StepBlock>
      </div>
    </article>
  );
}

function StepBlock({
  n, label, highlight, children,
}: { n: number; label: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? "border-2 border-accent/40 bg-accent/5" : "glass"}`}>
      <div className="flex items-center gap-2">
        <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${highlight ? "bg-accent text-accent-foreground" : "bg-foreground text-background"}`}>{n}</span>
        <div className={`text-[10px] uppercase tracking-[0.16em] ${highlight ? "text-accent" : "text-muted-foreground"}`}>{label}</div>
      </div>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
