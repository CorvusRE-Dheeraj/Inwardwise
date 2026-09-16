import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProductText } from "@/components/products/ProductChrome";
import { SCIENCE_REFERENCE_GROUPS } from "@/lib/science-references";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "Science, The Thinking Behind InwardWise" },
      {
        name: "description",
        content:
          "The references behind InwardWise: decision quality, the five factors of self, self-awareness and connection, from stress biology to modern psychology.",
      },
      { property: "og:title", content: "Science, The Thinking Behind InwardWise" },
      {
        property: "og:description",
        content: "References from stress biology to modern psychology behind InwardWise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Science,
});

function Science() {
  return (
    <AppShell>
      <section className="mx-auto w-[min(1100px,calc(100%-2rem))] pb-24 pt-10 md:pt-16">
        <header className="border-b border-[color:var(--rule)] pb-10">
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-[color:var(--ink)] md:text-6xl">
            Science
          </h1>
        </header>

        <div className="mt-10 max-w-3xl space-y-8 text-base leading-relaxed text-[color:var(--ink)]">
          <div>
            <h2 className="font-display text-xl tracking-tight text-[color:var(--royal)]">
              Science
            </h2>
            <ul className="mt-3 list-disc space-y-3 pl-5">
              <li>
                <ProductText>
                  All of our products are based in research, and decision making is
                  based on both a philosophy and psychological research. Therefore,
                  it is appropriate to keep up with the latest research to get a
                  deeper understanding.
                </ProductText>
              </li>
              <li>
                <ProductText>
                  If old world wisdom can only get us so far, applying more of that
                  and spreading it in more ways is not going to help. Many self help
                  books and gurus try this recycled wisdom.
                </ProductText>
              </li>
              <li>
                <ProductText>
                  Previous research can only go so far, as it tends to not cross the
                  boundaries.
                </ProductText>
              </li>
              <li>
                <ProductText>
                  We took a different approach by combining psychology, philosophy,
                  social sciences and biology and medicine to look at the broader
                  picture of what is going on with ourselves.
                </ProductText>
              </li>
              <li>
                <ProductText>
                  Such an approach will not be tried in the research community, as
                  it is too broad and sits between multiple disciplines. But we
                  don&apos;t have such limitations.
                </ProductText>
              </li>
            </ul>
          </div>
          {SCIENCE_REFERENCE_GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="font-display text-xl tracking-tight text-[color:var(--royal)]">
                {group.heading}
              </h2>
              <ul className="mt-3 list-disc space-y-3 pl-5">
                {group.entries.map((entry, i) => (
                  <li key={i}>
                    <ProductText>{entry}</ProductText>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
