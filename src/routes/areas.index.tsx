import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AREAS, type Area } from "@/lib/areas";
import { ProductText } from "@/components/products/ProductChrome";

export const Route = createFileRoute("/areas/")({
  component: AreasIndex,
});

const ORDER: Record<string, number> = {
  "individual-development": 1,
  "individual-wellbeing": 2,
  family: 3,
  habits: 4,
  career: 5,
  "stress-management": 6,
  "special-interest-groups": 7,
  relationships: 8,
};

function sortIndividual(list: Area[]) {
  return [...list].sort((a, b) => (ORDER[a.slug] ?? 99) - (ORDER[b.slug] ?? 99));
}

function Column({
  label,
  note,
  areas,
  panel,
  card,
}: {
  label: string;
  note: string;
  areas: Area[];
  panel: string;
  card: string;
}) {
  return (
    <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
      <h2 className="text-2xl">{label}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>

      <div className="mt-5 grid gap-3">
        {areas.map((a) => (
          <Link
            key={a.slug}
            to="/areas/$slug"
            params={{ slug: a.slug }}
            className={`group rounded-2xl border p-4 transition ${card}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg">{a.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <ProductText>{a.blurb}</ProductText>
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AreasIndex() {
  const individual = sortIndividual(AREAS.filter((a) => a.audience === "individual"));
  const corporate = AREAS.filter((a) => a.audience === "corporate");

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Services</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Where InwardWise helps</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        The same 7-stage framework applied to the decisions that shape your life, your family, your work and your community.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
        <Column
          label="Individual"
          note="For your own life, your family and the people close to you."
          areas={individual}
          panel="border-[color:var(--royal)]/20 bg-[color:var(--royal)]/5"
          card="border-[color:var(--royal)]/15 bg-background/70 hover:bg-[color:var(--royal)]/10"
        />
        <Column
          label="Corporate"
          note="For organisations, institutions and the teams inside them."
          areas={corporate}
          panel="border-foreground/15 bg-foreground/[0.04]"
          card="border-foreground/10 bg-background/70 hover:bg-foreground/5"
        />
      </div>
    </div>
  );
}
