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
          "The science behind InwardWise: decision quality, the five factors of self, self-awareness and connection, with references from stress biology to modern psychology.",
      },
      { property: "og:title", content: "Science, The Thinking Behind InwardWise" },
      {
        property: "og:description",
        content: "Understand your biases and weaknesses, become fully self aware, improve your chances of follow through.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Science,
});

const SECTIONS: { n: string; title: string; body: string[] }[] = [
  {
    n: "§ 01",
    title: "Decision",
    body: [
      "The seven-stage InwardWise filter is empirically derived. It was built through decades of applied practice rather than assembled from an existing academic theory, which is precisely why it is new.",
      "The relevant literature is broad rather than direct: work on cognitive bias, bounded rationality, loss aversion and the gap between intention and follow-through all describe the failure modes the filter is designed to interrupt. The results we observe in practice are strong enough that the method does not need to lean on any single model to justify itself.",
    ],
  },
  {
    n: "§ 02",
    title: "Self Build",
    body: [
      "Your inner InwardWise Self is assembled from five factors, among them your skills, your talents, your outer connections, and the ability to connect the dots between experiences that seem unrelated.",
      "The underlying idea is old and well supported: self-image governs behaviour. When the picture you hold of yourself is accurate and complete, your choices stop fighting your own nature. When it is distorted, no amount of information corrects the outcome.",
    ],
  },
  {
    n: "§ 03",
    title: "Self Aware",
    body: [
      "Self-awareness is treated here as a measurable capacity, not a mood. It is the ability to name a bias while it is operating, to notice fear disguised as logic, and to see ego protecting a position that the evidence no longer supports.",
      "Meditation, reflection and structured questioning are the instruments. Research into contemplative practice points to effects on stress response, emotional regulation and patterns of brain activity, the same systems that quietly steer decisions.",
    ],
  },
  {
    n: "§ 04",
    title: "Connect",
    body: [
      "Belonging is not a soft outcome. Social connection shows up in the literature as a determinant of health, resilience and longevity on a scale comparable with well-known physical risk factors.",
      "Connect exists so that self-knowledge does not end in isolation: to be fully yourself and still belong is the practical goal of the whole practice.",
    ],
  },
  {
    n: "§ 05",
    title: "Biology and Medicine",
    body: [
      "Hans Selye, The Stress of Life, McGraw-Hill, New York, 1956, the foundational description of the stress response that underlies much of what the calm practice addresses.",
      "Further references are being drawn from Mind It! For Health and Happiness and will be listed here by section.",
    ],
  },
];

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
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">Science</span>
        <h1 className="font-display mt-4 max-w-4xl text-4xl leading-[1.05] tracking-tight md:text-6xl">
          Inward<em className="italic text-[color:var(--royal)]">Wise</em>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[color:var(--ink-2)]">
          A connected world where intelligent decision making can happen, understand your biases and
          weaknesses, become fully self aware, and improve your chances of follow through and success.
        </p>

        <div className="rule-top mt-10" />
        <section className="pt-10">
          <h2 className="font-display text-2xl tracking-tight md:text-3xl">References</h2>
          <div className="mt-8 max-w-3xl space-y-8 text-[16px] leading-[1.7] text-[color:var(--ink-2)]">
            {REFERENCE_GROUPS.map((group) => (
              <div key={group.heading}>
                <h3 className="font-display text-lg tracking-tight text-[color:var(--royal)]">
                  {group.heading}
                </h3>
                <ul className="mt-3 list-none space-y-3">
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
        <div className="rule-top mt-10" />

        <div className="mt-4">
          {SECTIONS.map((s) => (
            <article key={s.title} className="border-b border-[color:var(--rule)] py-12">
              <span className="font-mono-cap text-[color:var(--muted-foreground)]">{s.n}</span>
              <h2 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">{s.title}</h2>
              <div className="mt-5 max-w-3xl space-y-4 text-[16px] leading-[1.7] text-[color:var(--ink-2)]">
                {s.body.map((p, i) => (
                  <p key={i}><ProductText>{p}</ProductText></p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <article className="border-b border-[color:var(--rule)] py-12">
          <span className="font-mono-cap text-[color:var(--muted-foreground)]">§ 06</span>
          <h2 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">Bibliography</h2>
          <ul className="mt-5 max-w-3xl list-none space-y-4 text-[16px] leading-[1.7] text-[color:var(--ink-2)]">
            <li>
              Neff, K. D. (2004). Self-compassion and psychological well-being.{" "}
              <em>Constructivism in the Human Sciences, 9</em>(2), 27, 37.
            </li>
            <li>
              Perlman, D., &amp; Peplau, L. A. (1981). Toward a social psychology of loneliness. In S.
              Duck &amp; R. Gilmour (Eds.), <em>Personal relationships 3: Personal relationships in
              disorder</em> (pp. 31, 56). London, England: Academic Press.
            </li>
            <li>
              Zessin, U., Dickhauser, O., &amp; Garbade, S. (2015). The relationship between
              self-compassion and well-being: A meta-analysis.{" "}
              <em>Applied Psychology: Health and Well-Being, 7</em>(3), 340, 364.
            </li>
          </ul>
        </article>

        <p className="mt-10 text-sm text-[color:var(--muted-foreground)]">
          This page shares general background only. The InwardWise model itself remains proprietary.
        </p>
      </section>
    </AppShell>
  );
}
