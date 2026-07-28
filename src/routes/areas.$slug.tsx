import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { findArea } from "@/lib/areas";

export const Route = createFileRoute("/areas/$slug")({
  loader: ({ params }) => {
    const area = findArea(params.slug);
    if (!area) throw notFound();
    return area;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Area"} — Decision Philosophy` },
      { name: "description", content: loaderData?.blurb ?? "" },
      { property: "og:title", content: `${loaderData?.name ?? "Area"} — Decision Philosophy` },
      { property: "og:description", content: loaderData?.blurb ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div>
      <h1 className="font-display text-3xl">Area not found</h1>
      <Link to="/areas" className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to areas
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div>
      <h1 className="font-display text-3xl">Something went wrong</h1>
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
      <h1 className="font-display mt-2 text-4xl sm:text-5xl">{area.name}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{area.blurb}</p>

      {area.slug === "individual-development" ? (
        <IndividualDevelopmentContent />
      ) : area.slug === "security" ? (
        <SecurityContent />
      ) : area.slug === "organizational-change" ? (
        <OrganizationalChangeContent />
      ) : (
        <div className="mt-10 glass rounded-3xl p-6 text-sm text-muted-foreground">
          Content for this area is being developed. In the meantime, you can start a facilitated
          decision session and select <span className="text-foreground">{area.name}</span> as your context.
        </div>
      )}

      <div className="mt-10">
        <Link
          to="/account/self-avatar"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Create my avatar
        </Link>
      </div>
    </article>
  );
}

function IndividualDevelopmentContent() {
  const dims = [
    { label: "Dimension 1", x: 50, y: 2 },
    { label: "Dimension 2", x: 95, y: 35 },
    { label: "Dimension 3", x: 78, y: 96 },
    { label: "Dimension 4", x: 22, y: 96 },
    { label: "Dimension 5", x: 5, y: 35 },
  ];
  // Five-point star path centered in 100x100 viewBox
  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 46 : 18;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
      <p>
        We most of the time feel no one knows us well. In the fast and noisy world, even friends
        are not spending time asking questions about you and getting to know you. Instead they are
        worried about their own projection, constantly worried about themselves even when you are
        talking to them.
      </p>
      <p>
        You need someone who really knows you — which is only you. But you cannot separate yourself
        from you and watch yourself. We want to provide you that, by AI.
      </p>
      <p>
        We make human friends more important and AI an enemy — but sometimes it&rsquo;s the other way
        around. AI can be you, if you train it to be you. You cannot expect any friend of yours to
        become a true friend; they are so few and far between. But psychological wellbeing needs
        both — self-love and good social connection.
      </p>

      <p>
        Life is defined by two characteristic traits: <em>Reproduction</em> and <em>Evolution</em> —
        the drive toward a better species, better adapted to survival and thriving. The first is
        possible only for a physical being, which the human can do. You can accomplish reproduction
        and accomplish your evolution, and pass on heredity to the next generation. The Avatar&rsquo;s
        goal is solely the second: to make you better so you can evolve within this lifetime, for
        the better.
      </p>
      <p>
        Given this goal of your Avatar, let&rsquo;s design it using AI to help you evolve into a
        better human being as time brings change. The Avatar&rsquo;s goal is how to make you better
        over a long time, in a broad sense. It gets formed based on the five attributes defined
        above. Once you identify that information and hard-code your Avatar, it goes to work by
        identifying with the dimensions below and taking action based on the best course, based on
        the prompt it received from you.
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
              style={{ fontSize: 7, fontWeight: 700 }}
            >
              <tspan x="50" dy="-2">Self</tspan>
              <tspan x="50" dy="8">Avatar</tspan>
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
          The Self Avatar and its five dimensions
        </figcaption>
      </figure>

      <p>
        Based on the human prompt, the Avatar will scan across all dimensions for a better
        understanding of you and advise you. These dimensions are based on reviewing many scientific
        papers and a combination of intuitive approaches — studying many philosophies, psychological
        approaches and observational methods. There was no single approach; it came together as a
        book project by the founder to assemble all of the material for the book he is working on.
        You won&rsquo;t find this methodology in any single research.
      </p>

      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-muted-foreground">
          We can think of the Avatar as a <span className="text-foreground">Facebook for the inner self</span>,
          as Facebook is for the outer world to see what you are thinking and experiencing. Unlike
          Facebook, the information is confidential and will not be available to anyone except you.
          By representing a truthful you as the Avatar, you can manage your inner self and have a
          personal conversation with yourself. This builds self-love and a healthy acceptance of
          who you are — not a victim of having to depend on others for acceptance and encouragement.
        </p>
      </div>
    </div>
  );
}


function SecurityContent() {
  return (
    <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
      <p>
        Security is not only a hardware problem — it is a pattern-recognition problem. The signals
        that precede a threat often show up first in language, behavior, and digital traces. We apply
        the Objective Solution Framework to make those signals visible earlier and with less bias.
      </p>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-2xl">Where this framework applies</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {[
            ["Airport Security", "Spot behavioral and psychological indicators before they escalate into physical risk."],
            ["National Security", "Separate real threats from noise, tribe, and political pressure across intelligence workflows."],
            ["Interrogations", "Use psychological clues as soft triggers — a software lie detector that reads patterns, not just polygraphs."],
            ["Database & Social Searches", "Structure searches across criminal databases and platforms like Facebook to surface anomalies without violating proportionality."],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[11px] text-background">
                •
              </span>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-muted-foreground">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-2xl">The principle</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          A decision-first approach to security asks: what is the real objective? What boundary must not
          be crossed? And what are the hidden pressures — fear, ego, institutional bias — that distort
          the search for truth? By slowing the loop down, we reduce false positives and protect civil
          liberties at the same time.
        </p>
      </div>
    </div>
  );
}

function OrganizationalChangeContent() {
  return (
    <div className="mt-10 space-y-6 text-[15px] leading-relaxed">
      <p>
        The world is run by large systems and organizational bodies. When those systems need to
        change, the task requires enormous clarity and amazing foresight — like the founders of this
        country exercising. Both money and power are the flow streams that must be examined and
        rerouted for change to take hold.
      </p>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-2xl">The levers of change</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {[
            ["Clarity of objective", "Define what the organization is actually for, not just what it currently does."],
            ["Foresight", "Map second- and third-order effects before the system locks in a new path."],
            ["Money flows", "Follow budgets, incentives, and cost structures — they reveal where power really sits."],
            ["Power flows", "Map decision rights, gatekeepers, and informal influence to understand resistance."],
            ["Psychological & social science", "Use human behavior, not just org charts, to design change people can adopt."],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[11px] text-background">
                •
              </span>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-muted-foreground">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-2xl">Why this matters</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Organizations that try to change without examining both money and power tend to adopt new
          language while keeping old behavior. We help leaders surface the real objectives, redraw the
          boundaries, and turn insight into executable commitment.
        </p>
      </div>
    </div>
  );
}
