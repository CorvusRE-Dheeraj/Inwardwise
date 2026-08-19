import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AREAS } from "@/lib/areas";

export const Route = createFileRoute("/areas/")({
  component: AreasIndex,
});

function AreasIndex() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Services</p>
      <h1 className="font-display mt-2 text-3xl sm:text-4xl">Where Inwardwise helps</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        The same 7-stage framework applied to the decisions that shape your life, your family, your work and your community.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((a) => (
          <Link
            key={a.slug}
            to="/areas/$slug"
            params={{ slug: a.slug }}
            className="glass group rounded-2xl p-5 transition hover:bg-foreground/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-lg">{a.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{a.blurb}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
