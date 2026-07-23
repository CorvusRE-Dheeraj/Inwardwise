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
          to="/decision"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Start a decision in this area
        </Link>
      </div>
    </article>
  );
}

function IndividualDevelopmentContent() {
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
        If you allow, your self can step out and watch you from a distance, and reach out to you
        once in a while when it feels you need it. Your self-agent here can reach out to you in
        ways that currently no other channel can. Help us help you. Create your <em>Shadow</em> and
        your <em>Inner Enemy</em>, and let them reach you and interact with you to develop self-love.
      </p>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-2xl">The five attributes of an individual</h2>
        <ol className="mt-4 space-y-3 text-sm">
          {[
            ["Shadow", "Who you were growing up — the parts of you carried forward."],
            ["Enemy", "The inner forces that pull you off course."],
            ["Interests, skills and talents", "Your inner connections — what you are drawn to."],
            ["Outer Connections", "The people and places that shape you."],
            ["Connect the Dots", "The experiences that, in retrospect, form a pattern."],
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
        </ol>
        <p className="mt-5 text-sm text-muted-foreground">
          Using these, we can help you develop better — by helping you define them, and by letting
          them change over time.
        </p>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-display text-2xl">Why we do this</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          At Decision Philosophy, we believe that if we can prevent even one suicide, our efforts
          are worth it. We don&rsquo;t need to be another Facebook success. Our success is measured by
          making a difference in people&rsquo;s lives and in society in general.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {["Suicide prevention", "Depression prevention", "Anxiety prevention", "Anger prevention"].map((t) => (
            <li key={t} className="glass rounded-2xl px-3 py-2 text-center text-xs">{t}</li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted-foreground">
          My early sign of anger was when I felt I faced injustice — from family, friends or social
          institutions. But anger only turns you into a stressed and disliked individual. When the
          automated you reaches out to you and indicates which emotions you are feeling, the system
          works with you to better your situation.
        </p>
      </div>
    </div>
  );
}
