import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/avatar/")({
  head: () => ({
    meta: [
      { title: "Your Avatar — Decision Philosophy" },
      {
        name: "description",
        content:
          "A private digital reflection of your inner self, built across five dimensions, whose only goal is your evolution.",
      },
      { property: "og:title", content: "Your Avatar — Decision Philosophy" },
      {
        property: "og:description",
        content: "Five dimensions. One inner mirror. Built to help you evolve.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AvatarLanding,
});

const PILLARS = [
  {
    n: "01",
    title: "Private by design",
    body: "Dimensions 1 and 2 stay behind sign-in, tied to your account and only your account.",
  },
  {
    n: "02",
    title: "Five dimensions",
    body: "Five dimensions of who you are — described once, in your own words.",
  },
  {
    n: "03",
    title: "Built to evolve you",
    body: "The only goal of your inner mirror is your evolution — small, specific steps toward a truer version of you.",
  },
];

function AvatarLanding() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-8 py-16 sm:py-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-mono-cap text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span aria-hidden="true">←</span> Home
      </Link>
      <header className="mt-8 max-w-3xl">
        <p className="font-mono-cap text-xs text-muted-foreground">A private inner mirror</p>
        <h1 className="mt-4 font-serif text-4xl sm:text-6xl leading-[1.05] font-medium tracking-tight text-balance">
          You are the physical you.{" "}
          <span className="italic text-royal">Your avatar is the inner one.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
          Every person is uniquely described by five dimensions. Once captured, they
          form a digital inner self whose only purpose is your evolution — looking
          out for you, and no one else.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/avatar/build"
            className="ink-btn rounded-full px-6 py-3 text-sm font-medium hover:ink-btn-hover"
          >
            Build your avatar
          </Link>
          <Link
            to="/avatar/consult"
            className="rounded-full border border-[var(--rule)] px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Consult your avatar →
          </Link>
        </div>
      </header>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {PILLARS.map((d) => (
          <article key={d.n} className="paper-card rounded-lg p-8">
            <div className="mb-6 flex items-baseline justify-between">
              <span className="font-mono-cap text-xs text-muted-foreground">{d.n}</span>
              <span className="ml-4 h-px flex-1 bg-[var(--rule)]" />
            </div>
            <h2 className="font-serif text-2xl font-medium">{d.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-16 rule-top pt-8 text-sm text-muted-foreground">
        Dimensions 1 and 2 are stored privately in your account.
        Everything else lives on this device.
      </div>
    </div>
  );
}
