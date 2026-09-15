import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProductText } from "@/components/products/ProductChrome";

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

const REFERENCE_GROUPS: { heading: string; entries: string[] }[] = [
  {
    heading: "General",
    entries: [
      "Freeman, A. (2026). Mind it! For health and happiness [Unpublished manuscript].",
    ],
  },
  {
    heading: "Decision",
    entries: [
      "Cole, S. A., Sannidhi, D., Jadotte, Y. T., & Rozanski, A. (2023). Using motivational interviewing and brief action planning for adopting and maintaining positive health behaviors. Progress in Cardiovascular Diseases, 77, 86–94.",
      "Miller, W. R., & Rollnick, S. (2012). Motivational interviewing: Helping people change. Guilford Press.",
    ],
  },
  {
    heading: "Self",
    entries: [
      "Christianto, V., & Smarandache, F. (2020). A review on how an ancient forgiveness way called Ho‘oponopono can boost human health and immune system. EC Neurology, 12(6), 64–69.",
      "Freeman, A. (2026). Mind it! For health and happiness [Unpublished manuscript].",
      "Hassed, C., & Chambers, R. (2014). Mindful learning: Reduce stress and improve brain performance for effective learning (Vol. 3). Exisle Publishing.",
      "Ishii, T., Taweesedt, P. T., Chick, C. F., O’Hara, R., & Kawai, M. (2024). From macro to micro: Slow-wave sleep and its pivotal health implications. Frontiers in Sleep, 3, Article 1322995.",
      "McManus, E., Haroon, H., Duncan, N. W., Elliott, R., & Muhlert, N. (2022). The effects of stress across the lifespan on the brain, cognition and mental health: A UK Biobank study. Neurobiology of Stress, 18, Article 100447.",
      "Vago, D. R., & Zeidan, F. (2016). The brain on silent: Mind wandering, mindful awareness, and states of mental tranquility. Annals of the New York Academy of Sciences, 1373(1), 96–113.",
      "Wall, J. A., Jr., & Callister, R. R. (1995). Ho‘oponopono: Some lessons from Hawaiian mediation. Negotiation Journal, 11(1), 45–54.",
    ],
  },
  {
    heading: "Connect",
    entries: [
      "Holt-Lunstad, J., Smith, T. B., & Layton, J. B. (2010). Social relationships and mortality risk: A meta-analytic review. PLoS Medicine, 7(7), Article e1000316.",
      "Kemp, A. H., Arias, J. A., & Fisher, Z. (2017). Social ties, health and wellbeing: A literature review and model. In Neuroscience and social science: The missing link (pp. 397–427).",
    ],
  },
  {
    heading: "Biology and Medicine",
    entries: ["Selye, H. (1975). The stress of life."],
  },
];

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
          {REFERENCE_GROUPS.map((group) => (
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
