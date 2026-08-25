import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { findArea } from "@/lib/areas";

export const Route = createFileRoute("/areas/$slug")({
  loader: ({ params }) => {
    const area = findArea(params.slug);
    if (!area) throw notFound();
    return area;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Area"} — InwardWise` },
      { name: "description", content: loaderData?.blurb ?? "" },
      { property: "og:title", content: `${loaderData?.name ?? "Area"} — InwardWise` },
      { property: "og:description", content: loaderData?.blurb ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div>
      <h1 className="text-3xl">Area not found</h1>
      <Link to="/areas" className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to areas
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div>
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: AreaPage,
});

function AreaPage() {
  const area = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/areas" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All areas
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">Area</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{area.name}</h1>
      {area.slug === "political-decisions" && (
        <>
          <h2 className="font-sans mt-2 text-2xl sm:text-3xl">From taking sides to solving the real problem</h2>
          <p className="mt-3 text-justify text-lg text-muted-foreground">
            Our method systematically opens that possibility of moving from having to take a side,
            even if it is political ideology, to actual problem solving which does not have a side.
            The goal is not to win an argument. It is to make the original problem visible enough
            that the argument becomes unnecessary.
          </p>
        </>
      )}
      <p className="mt-4 text-justify text-lg text-muted-foreground">{area.blurb}</p>

      {area.slug === "individual-development" ? (
        <IndividualDevelopmentContent />
      ) : area.slug === "individual-wellbeing" ? (
        <IndividualWellbeingContent />
      ) : area.slug === "security" ? (
        <SecurityContent />
      ) : area.slug === "organizational-change" ? (
        <OrganizationalChangeContent />
      ) : area.slug === "political-decisions" ? (
        <PoliticalDecisionsContent />
      ) : area.slug === "courts-counseling" ? (
        <CourtsCounselingContent />
      ) : area.slug === "marriage-counseling" ? (
        <MarriageCounselingContent />
      ) : area.slug === "family-decisions" ? (
        <FamilyDecisionsContent />
      ) : area.slug === "business-decisions" ? (
        <BusinessDecisionsContent />
      ) : area.slug === "ethics-counseling" ? (
        <EthicsCounselingContent />
      ) : (
        <div className="mt-10 glass rounded-3xl p-6 text-sm text-muted-foreground">
          Content for this area is being developed. In the meantime, you can start a facilitated
          decision session and select <span className="text-foreground">{area.name}</span> as your context.
        </div>
      )}

      <div className="mt-10">
        {area.slug === "political-decisions" ? (
          <Link
            to="/decision"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
          >
            Start a Decision <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/account/self-avatar"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" /> Design Your InwardWise Self
          </Link>
        )}
      </div>
    </article>
  );
}

function IndividualDevelopmentContent() {
  const dims = [
    { label: "Factor 1", x: 50, y: 2 },
    { label: "Factor 2", x: 95, y: 35 },
    { label: "Factor 3", x: 78, y: 96 },
    { label: "Factor 4", x: 22, y: 96 },
    { label: "Factor 5", x: 5, y: 35 },
  ];
  // Five-point star path centered in 100x100 viewBox
  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 46 : 18;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        We most of the time feel no one knows us well. In the fast and noisy world, sometimes even
        your closest friends are not taking the time or energy to maintain relationships in the way
        you&rsquo;d like them to. Instead, they are more worried about their own projection, thinking
        about their own lives and stressors, even when you are talking to them. This feeling of
        inadequate social relationships can be defined as loneliness (Perlman &amp; Peplau, 1981).
      </p>
      <p>
        You need someone who really knows you, inside and out, which is only you. But you cannot
        separate yourself from you and watch yourself. We want to help you introspect with AI.
      </p>
      <p>
        We make and maintain social relationships with one another, and perceive AI as an enemy, but
        that ignores the potential to use AI for self betterment. AI can help you look inwards, if
        you train it to know you. But psychological wellbeing needs both, self-love and social
        connection (Zessin et al., 2015; Neff, 2004).
      </p>

      <p>
        According to biology, life is defined by two characteristic traits: <em>Reproduction</em>,
        or the ability to pass along traits to the next generation, and <em>Evolution</em>, or the
        ability for a population to become better adapted to its environment. Your InwardWise
        Self&rsquo;s goal is to make you better so you can change and adapt within this lifetime, for
        the better.
      </p>
      <p>
        Given this is the goal of your InwardWise Self, let&rsquo;s design it using AI to help you
        change and adapt into a better version of yourself as time brings change. Your InwardWise
        Self gets formed based on the five attributes defined below. Once you identify that
        information and give the information to your InwardWise Self, it goes to work by identifying
        with the factors below and taking action based on the best course, based on the prompt it
        received from you.
      </p>

      <figure className="glass rounded-3xl p-6">
        <div className="mx-auto max-w-md">
          <svg viewBox="-15 -10 130 120" className="h-auto w-full">
            <polygon
              points={starPoints}
              fill="#D9D9D9"
              stroke="#BFBFBF"
              strokeWidth="0.6"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#000000"
              style={{ fontSize: 6, fontWeight: 700 }}
            >
              <tspan x="50" dy="-2">InwardWise</tspan>
              <tspan x="50" dy="7">Self</tspan>

            </text>
            {dims.map((d) => (
              <text
                key={d.label}
                x={d.x}
                y={d.y}
                textAnchor="middle"
                className="fill-current text-muted-foreground"
                style={{ fontSize: 4.2 }}
              >
                {d.label}
              </text>
            ))}
          </svg>
        </div>
        <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
          The InwardWise Self and its five factors
        </figcaption>
      </figure>

      <p>
        Based on the human prompt, the InwardWise Self will scan across all factors for a better
        understanding of you and try to advise you. These factors are based on reviewing many
        scientific papers and a combination of approaches, studying many philosophies,
        psychological approaches and observational methods. There was no single approach; it came
        together as a book project by the founder. You won&rsquo;t find this methodology in any single
        research project or paper. A full bibliography is available on the Science page.
      </p>

      <div className="glass rounded-3xl p-6">
        <p className="text-justify text-sm text-muted-foreground">
          We can think of the InwardWise Self as a <span className="text-foreground">Facebook for the inner self</span>,
          as Facebook is for the outer world to see what you are thinking and experiencing. Unlike
          Facebook, the information is confidential and will not be available to anyone except you.
          By representing a truthful you as the InwardWise Self, you can manage your inner self and have a
          personal conversation with yourself. This builds self-love and a healthy acceptance of
          who you are, not a victim of having to depend on others for acceptance and encouragement.
        </p>
      </div>
    </div>
  );
}


function SecurityContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        Security is not only a hardware problem, it is a pattern-recognition problem. The signals
        that precede a threat often show up first in language, behavior, and digital traces. We apply
        the Objective Solution Framework to make those signals visible earlier and with less bias.
      </p>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-2xl">Where this framework applies</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {[
            ["Airport Security", "Spot behavioral and psychological indicators before they escalate into physical risk."],
            ["National Security", "Separate real threats from noise, tribe, and political pressure across intelligence workflows."],
            ["Interrogations", "Use psychological clues as soft triggers, a software lie detector that reads patterns, not just polygraphs."],
            ["Database & Social Searches", "Structure searches across criminal databases and platforms like Facebook to surface anomalies without violating proportionality."],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[11px] text-background">
                •
              </span>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-justify text-muted-foreground">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-2xl">The principle</h2>
        <p className="mt-3 text-justify text-sm text-muted-foreground">
          A decision-first approach to security asks: what is the real objective? What boundary must not
          be crossed? And what are the hidden pressures, fear, ego, institutional bias, that distort
          the search for truth? By slowing the loop down, we reduce false positives and protect civil
          liberties at the same time.
        </p>
      </div>
    </div>
  );
}

function OrganizationalChangeContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        The world is run by large systems and organizational bodies. When those systems need to
        change, the task requires enormous clarity and amazing foresight, like the founders of this
        country exercising. Both money and power are the flow streams that must be examined and
        rerouted for change to take hold.
      </p>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-2xl">The levers of change</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {[
            ["Clarity of objective", "Define what the organization is actually for, not just what it currently does."],
            ["Foresight", "Map second- and third-order effects before the system locks in a new path."],
            ["Money flows", "Follow budgets, incentives, and cost structures, they reveal where power really sits."],
            ["Power flows", "Map decision rights, gatekeepers, and informal influence to understand resistance."],
            ["Psychological & social science", "Use human behavior, not just org charts, to design change people can adopt."],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[11px] text-background">
                •
              </span>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-justify text-muted-foreground">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-2xl">Why this matters</h2>
        <p className="mt-3 text-justify text-sm text-muted-foreground">
          Organizations that try to change without examining both money and power tend to adopt new
          language while keeping old behavior. We help leaders surface the real objectives, redraw the
          boundaries, and turn insight into executable commitment.
        </p>
      </div>
    </div>
  );
}

function PoliticalDecisionsContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        This area falls under decision making. Of course politics is riddled with biases far from
        any neutral arguments. But once you realize the political system is a human invention to
        take sides, you will abandon that line of thought and look at the original problem itself and
        seek solutions to that original problem to remove political rifts.
      </p>
    </div>
  );
}

function CourtsCounselingContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        A lot of the prison systems are a different type of underworld. The regular humanity and laws
        don&apos;t apply there because they need to be punished therefore what better way than to deny
        them humanity. But the problem is we are not looking at the original law and its enactment and
        how judgements were reached and laws were applied. Did they match the crime? Did they apply to
        others or only the few that were caught? If so, is it being applied selectively? Were there
        people who committed far worse crimes and got away? Then how do we justify punishing only a
        few disproportionately? So rather than considering the justice system as accurate, flawless
        and just, we need to look towards improving the human condition for all so true change is
        made than punishment as a cure. This requires removing some of these natural biases and
        looking for a holistic solution. Our platform opens the doors for such a thought process
        and decision making.
      </p>
    </div>
  );
}

function MarriageCounselingContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        We are not looking to replace the marriage counselors. Before it reaches that stage, the
        marriage goes through a period of crisis. We like to help the individuals to navigate this
        difficult situation and period with judgements and decisions and the consequences by being
        their own sounding boards and thought provokers.
      </p>
    </div>
  );
}

function FamilyDecisionsContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        Family structures have dominant personalities to put it mildly and dogmatic to be realistic,
        and then dormant, meek and troubled. When you have such a mix, trouble and hurt can follow.
        Making decisions without your emotions affecting you could be difficult. But the decisions
        you make cannot be reversed as the stakes are high as it&apos;s family. At least you need second
        opinions on the decisions you make and sometimes you may need beyond friends for this second
        opinion.
      </p>
    </div>
  );
}

function BusinessDecisionsContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        Business decisions tend to have two aspects to them. One you have to predict the future ie
        you have insufficient information to predict presenting a challenge. Secondly, you make
        decisions based on growth but life is not a business so these decisions become one sided
        rather than life balanced. Business is more like a sport where winning is more important and
        society and media stokes this condition. No growth and sustainable co-existence is considered
        a failure in business. Business decisions need to examine a lot of the assumptions behind
        the decisions so such analysis can become easy using our platform.
      </p>
    </div>
  );
}

function EthicsCounselingContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        Boards, high level positions, doctors, engineers, lawyers pretty much everyone is supposed
        to follow ethics. It turns into a burden rather than a necessity not imposed upon. But this
        requires questioning the status quo and social norms and social definitions of success and
        power. Especially the ethics of power and politics are more subtle than the straight forward
        money ethics. If we can measure political power and influence and status power in the same
        way we can count money, then ethics can become more clear. Our platform can allow such
        decision making for ethics.
      </p>
    </div>
  );
}

function IndividualWellbeingContent() {
  return (
    <div className="mt-10 space-y-6 text-justify text-[15px] leading-relaxed">
      <p>
        We can define individual wellbeing as more of a mental and physical combined activity. So
        both meditation and the act of repeating things and reminding yourself will fall into that
        category. Why are these things important? Meditation is an intermediate state between being
        fully alert and active and being asleep. A state where you can be aware of your thoughts and
        remember what occurred. A subconscious state not completely resting so insights and deeper
        connections come to life in that semi active state. Any auto suggestions in that state can
        have a profound influence on you. Therefore such suggestions can be repeated so you can
        induce patterns of habits like feeling thankful and forgiving yourself among other
        autosuggestions that are healing.
      </p>
      <p>
        Religion can achieve these results with rituals but a scientifically developed approach can
        be applied to everyone irrespective of their religious beliefs. Both brain images and
        empirical results support the power of these meditative suggestions prescribed on our
        platform.
      </p>
    </div>
  );
}
