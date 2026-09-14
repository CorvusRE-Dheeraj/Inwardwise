import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles, Waves } from "lucide-react";
import { findArea, type Area } from "@/lib/areas";

export const Route = createFileRoute("/areas/$slug")({
  loader: ({ params }) => {
    const area = findArea(params.slug);
    if (!area) throw notFound();
    return area;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Service"}, InwardWise` },
      { name: "description", content: loaderData?.blurb ?? "" },
      { property: "og:title", content: `${loaderData?.name ?? "Service"}, InwardWise` },
      { property: "og:description", content: loaderData?.blurb ?? "" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  notFoundComponent: () => (
    <div>
      <h1 className="text-3xl">Service not found</h1>
      <Link to="/areas" className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to services
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
      <Link
        to="/areas"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All services
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">Service</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{area.name}</h1>
      <p className="mt-4 text-lg leading-relaxed text-royal">{area.tagline}</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed">
        {area.sections.map((s, i) => (
          <section key={i} className="space-y-4">
            {s.heading && <h2 className="text-2xl sm:text-3xl">{s.heading}</h2>}
            {s.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {area.slug === "individual-development" && i === 1 && <SelfStar />}
          </section>
        ))}

        {area.cycle && (
          <div className="glass rounded-3xl p-6">
            <p className="text-center text-sm font-medium leading-relaxed">{area.cycle}</p>
          </div>
        )}

        {area.closing && (
          <p className="text-lg font-medium leading-relaxed text-foreground">{area.closing}</p>
        )}

        {area.disclaimer && (
          <p className="text-sm italic leading-relaxed text-muted-foreground">{area.disclaimer}</p>
        )}
      </div>

      <div className="mt-10">
        <PrimaryAction cta={area.cta} />
      </div>
    </article>
  );
}

function PrimaryAction({ cta }: { cta: Area["cta"] }) {
  const base =
    "inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90";
  if (cta === "self")
    return (
      <Link to="/account/self-avatar" className={base}>
        <Sparkles className="h-4 w-4" /> Design Your Self
      </Link>
    );
  if (cta === "calm")
    return (
      <Link to="/meditation/schedule" className={base}>
        <Waves className="h-4 w-4" /> Start Calm
      </Link>
    );
  return (
    <Link to="/decision" className={base}>
      Start a Decision <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SelfStar() {
  const dims = [
    { label: "Factor 1", x: 50, y: 2 },
    { label: "Factor 2", x: 95, y: 35 },
    { label: "Factor 3", x: 78, y: 96 },
    { label: "Factor 4", x: 22, y: 96 },
    { label: "Factor 5", x: 5, y: 35 },
  ];
  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 46 : 18;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <figure className="glass rounded-3xl p-6">
      <div className="mx-auto max-w-md">
        <svg viewBox="-15 -10 130 120" className="h-auto w-full">
          <polygon points={starPoints} fill="#D9D9D9" stroke="#BFBFBF" strokeWidth="0.6" />
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
        InwardWise Self and its five factors
      </figcaption>
    </figure>
  );
}
