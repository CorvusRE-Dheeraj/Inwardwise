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

type ReferenceGroup = {
  heading: string;
  entries?: string[];
  subsections?: { heading: string; entries: string[] }[];
};

const REFERENCE_GROUPS: ReferenceGroup[] = [
  {
    heading: "General",
    entries: [
      "Freeman, A. (2026). Mind it! For health and happiness [Unpublished manuscript].",
      "An introduction to construction management. (n.d.).",
      "Project management, planning and control: Managing engineering, construction and manufacturing projects to PMI, APM and BSI standards (5th ed.). (n.d.).",
    ],
  },
  {
    heading: "Decision",
    entries: [
      "Baumeister, R. F., Bratslavsky, E., Finkenauer, C., & Vohs, K. D. (2001). Bad is stronger than good. Review of General Psychology, 5(4), 323–370. https://doi.org/10.1037/1089-2680.5.4.323",
      "Cole, S. A., Sannidhi, D., Jadotte, Y. T., & Rozanski, A. (2023). Using motivational interviewing and brief action planning for adopting and maintaining positive health behaviors. Progress in Cardiovascular Diseases, 77, 86–94.",
      "Miller, W. R., & Rollnick, S. (2012). Motivational interviewing: Helping people change. Guilford Press.",
      "Mediating role of impaired wisdom. (2022).",
      "Neurolinguistic programming (NLP) and health outcomes. (n.d.).",
      "Nawijn, J. (n.d.). Leisure travel and happiness.",
    ],
  },
  {
    heading: "Self",
    entries: [
      "Christianto, V., & Smarandache, F. (2020). A review on how an ancient forgiveness way called Ho‘oponopono can boost human health and immune system. EC Neurology, 12(6), 64–69.",
      "Freeman, A. (2026). Mind it! For health and happiness [Unpublished manuscript].",
      "Brown, K. W., & Ryan, R. M. (2003). The benefits of being present: Mindfulness and its role in psychological well-being. Journal of Personality and Social Psychology, 84(4), 822–848.",
      "Hassed, C., & Chambers, R. (2014). Mindful learning: Reduce stress and improve brain performance for effective learning (Vol. 3). Exisle Publishing.",
      "Ishii, T., Taweesedt, P. T., Chick, C. F., O’Hara, R., & Kawai, M. (2024). From macro to micro: Slow-wave sleep and its pivotal health implications. Frontiers in Sleep, 3, Article 1322995.",
      "McManus, E., Haroon, H., Duncan, N. W., Elliott, R., & Muhlert, N. (2022). The effects of stress across the lifespan on the brain, cognition and mental health: A UK Biobank study. Neurobiology of Stress, 18, Article 100447.",
      "Xin, Z., Li, S., Jia, Y., & Yuan, H. (n.d.). Analysis of self-healing of depression by helping others in adolescents from the perspective of constructivism. Frontiers in Psychiatry.",
      "Hidden wounds of the inner child: A systematic review on the psychological effects of childhood trauma in adulthood. (n.d.).",
      "Overprotection psychology. (n.d.).",
      "Rogers, D. (n.d.). Dark shadow: Examining the inner critic and shame [Doctoral dissertation].",
      "Mehta, N. D., Stevens, J. S., Li, Z., Gillespie, C. F., Fani, N., Michopoulos, V., & Felger, J. C. (2020). Inflammation, reward circuitry and symptoms of anhedonia and PTSD in trauma-exposed women. Social Cognitive and Affective Neuroscience, 1046–1055. https://doi.org/10.1093/scan/nsz100",
      "Justice, N. J. (n.d.). The relationship between stress and Alzheimer’s disease. Neurobiology of Stress.",
      "The role of cortisol in chronic stress, neurodegenerative diseases, and psychological disorders. (n.d.).",
      "HPA axis: Unveiling the potential mechanisms involved in stress-induced Alzheimer’s disease and depression. (n.d.).",
      "Stress-induced anhedonia is associated with an increase in Alzheimer’s-related processes. (2011). British Journal of Pharmacology.",
      "Goldstein, T. R., & Winner, E. (2012). Enhancing empathy and theory of mind. Journal of Cognition and Development.",
      "Goldstein, T. R., & Bloom, P. (n.d.). The mind on stage.",
      "Thakurdas, A. (2008). Ho’oponopono: Universal healing method for mankind.",
      "Ito, K. L. (n.d.). Ho’oponopono, “to make right”: Hawaiian conflict resolution and metaphor in the construction of a family therapy.",
      "Vago, D. R., & Zeidan, F. (2016). The brain on silent: Mind wandering, mindful awareness, and states of mental tranquility. Annals of the New York Academy of Sciences, 1373(1), 96–113.",
      "Wall, J. A., Jr., & Callister, R. R. (1995). Ho‘oponopono: Some lessons from Hawaiian mediation. Negotiation Journal, 11(1), 45–54.",
    ],
  },
  {
    heading: "Connect",
    entries: [
      "Holt-Lunstad, J., Smith, T. B., & Layton, J. B. (2010). Social relationships and mortality risk: A meta-analytic review. PLoS Medicine, 7(7), Article e1000316.",
      "Kemp, A. H., Arias, J. A., & Fisher, Z. (2017). Social ties, health and wellbeing: A literature review and model. In Neuroscience and social science: The missing link (pp. 397–427).",
      "Holt-Lunstad, J. (n.d.). Why social relationships are important for physical health.",
      "Hirsch, J. L., & Clark, M. S. (2019). Multiple paths to belonging that we should study together. Perspectives on Psychological Science, 14(2), 238–255. https://doi.org/10.1177/1745691618803629",
      "Oxytocin and oxygen: The evolution of a solution to the stress of life. (n.d.).",
      "The monogamy paradox. (n.d.).",
      "The role of oxytocin in shaping complex social behaviors. (n.d.).",
      "Endogenous oxytocin, cortisol, and testosterone response to group singing. (n.d.).",
      "Mothers’ and fathers’ joint profiles for testosterone and oxytocin in a small-scale fishing-farming community. (n.d.).",
      "Social reward requires coordinated interaction between serotonin and oxytocin. (n.d.).",
      "Love is analogous to money in the human brain. (n.d.).",
      "The behavioral, anatomical, and pharmacological parallels between social attachment, love, and addiction. (n.d.).",
      "How passion for playing World of Warcraft predicts in-game social capital, loneliness, and well-being. (n.d.).",
      "Effects of realism on extended violent and nonviolent video game play on aggressive behavior. (n.d.).",
      "Leggieri, M., Thaut, M. H., Fornazzari, L., Schweizer, T. A., Barfett, J., Munoz, D. G., & Fischer, C. E. (2019). Music intervention approaches for Alzheimer’s disease: A review of the literature. Frontiers in Neuroscience, 13, 132. https://doi.org/10.3389/fnins.2019.00132",
    ],
  },
  {
    heading: "Biology and Medicine",
    entries: ["Selye, H. (1975). The stress of life."],
    subsections: [
      {
        heading: "Lifestyle, Diet & Metabolic Health",
        entries: [
          "Effects of intensive lifestyle changes on the progression of mild cognitive impairment or early dementia due to Alzheimer’s disease: A randomized, controlled clinical trial. (2024). Alzheimer’s Research & Therapy, 16, 122. https://doi.org/10.1186/s13195-024-01482-z",
          "Mattson, M. P., Moehl, K., Ghena, N., Schmaedick, M., & Cheng, A. (2018). Intermittent metabolic switching, neuroplasticity and brain health. Nature Reviews Neuroscience, 19, 63–80.",
          "Evolutionary basis for the human diet: Consequences for human health. (n.d.).",
          "Evolution of the human diet and its impact on gut microbiota, immune responses and brain health. (n.d.).",
          "DHA: An ancient nutrient for the modern human brain. (n.d.).",
        ],
      },
      {
        heading: "Fasting",
        entries: [
          "Analysis of physiological and metabolic responses to fasting. (n.d.).",
          "Effects of 10-day complete fasting on physiological homeostasis, nutrition, and health markers. (n.d.).",
          "Prolonged fasting drives a program of metabolic adaptation. (n.d.).",
          "Dietary intake regulates circulating inflammatory monocytes. (n.d.).",
          "Pre-therapy fasting slows epithelial turnover and modulates the microbiota. (n.d.).",
          "Combined fasting and ketogenic diet on chemotherapy toxicity. (n.d.).",
          "Ketogenic diet combined with intermittent fasting: Effects on biochemical markers. (n.d.).",
          "Intermittent fasting reduces neuroinflammation. (n.d.).",
        ],
      },
      {
        heading: "Ketogenic Diet & Nutrition",
        entries: [
          "Ketogenic diet: A nutritional therapeutic tool for lipedema. (n.d.).",
          "The effect of a ketogenic diet versus Mediterranean diet on clinical and biochemical markers of inflammation in patients with obesity. (n.d.).",
        ],
      },
      {
        heading: "Exercise, Yoga & Physical Health",
        entries: [
          "The need for upper limits in physical activity guidelines: A narrative review. (n.d.).",
          "Time-restricted eating: Effects on performance, immune function, and body composition in elite cyclists. (n.d.).",
          "Acute physiological effects of performing yoga in the heat on energy expenditure, range of motion, and inflammatory biomarkers. (n.d.).",
        ],
      },
      {
        heading: "Inflammation & Autoimmune Health",
        entries: [
          "Inflammatory response to red meats. (n.d.).",
          "Alcohol as friend or foe in autoimmune diseases: A role for the gut microbiome. (n.d.).",
        ],
      },
      {
        heading: "Brain Health & Alzheimer’s Disease",
        entries: [
          "Alzheimer’s disease: Roles of the gut, adipocytes, HPA axis, and melatonergic pathways. (n.d.).",
          "Neuroprotective effects of quercetin in Alzheimer’s disease. (n.d.).",
        ],
      },
      {
        heading: "Endocrine & Hormonal Health",
        entries: ["Can ashwagandha benefit the endocrine system? (n.d.)."],
      },
      {
        heading: "Alcohol & Population Health",
        entries: [
          "GBD 2016 Alcohol Collaborators. (2018). Alcohol use and burden for 195 countries and territories, 1990–2016: A systematic analysis for the Global Burden of Disease Study 2016. The Lancet, 392, 1015–1035.",
        ],
      },
      {
        heading: "Psychedelics & Psychopharmacology",
        entries: [
          "Solmi, M., Chen, C., Daure, C., et al. (2022). A century of research on psychedelics: A scientometric analysis on trends and knowledge maps of hallucinogens, entactogens, entheogens and dissociative drugs. European Neuropsychopharmacology, 64, 44–60.",
          "Colcott, J., Guerin, A. A., Carter, O., Meikle, S., & Bedi, G. (2024). Side-effects of MDMA-assisted psychotherapy: A systematic review and meta-analysis.",
          "Common side effects of MDMA-assisted psychotherapy. (n.d.).",
          "de Wit, H., Molla, H. M., Bershad, A., Bremmer, M., & Lee, R. (n.d.). Repeated low doses of LSD in healthy adults: A placebo-controlled, dose-response study.",
          "Is microdosing a placebo? (2024). Journal of Psychopharmacology, 38(8), 701–711. https://doi.org/10.1177/02698811241254831",
          "Müller, F., Zaczek, H., Becker, A. M., et al. (n.d.). Efficacy and safety of low- versus high-dose LSD-assisted therapy in patients with major depression: A randomized trial.",
          "Hutten, N. R. P. W., Mason, N. L., Dolder, P. C., Theunissen, E. L., Holze, F., Liechti, M. E., Feilding, A., Ramaekers, J. G., & Kuypers, K. P. C. (2020). Mood and cognition after administration of low LSD doses in healthy volunteers: A placebo-controlled dose-effect finding study. European Neuropsychopharmacology, 41, 81–91.",
          "Ommati, M. M., Mobasheri, A., Niknahad, H., et al. (2023). Low-dose ketamine improves animals’ locomotor activity and decreases brain oxidative stress and inflammation in ammonia-induced neurotoxicity.",
        ],
      },
      {
        heading: "Low-Dose Anti-Inflammatory & Medical Interventions",
        entries: [
          "Choubey, A., Girdhar, K., Kar, A. K., Kushwaha, S., Yadav, M. K., Ghosh, D., & Mondal, P. (2020). Low-dose naltrexone rescues inflammation and insulin resistance associated with hyperinsulinemia.",
          "Fiolet, A. T. L., Lin, A., Kwiecinski, J., et al. (n.d.). Effect of low-dose colchicine on pericoronary inflammation and coronary plaque composition in chronic coronary disease: A sub-analysis of the LoDoCo2 trial.",
          "Lesmana, R., Yusuf, I. F., Goenawan, H., Achadiyani, A., Khairani, A. F., Fatimah, S. N., & Supratman, U. (2020). Low dose of β-carotene regulates inflammation, reduces caspase signaling, and correlates with autophagy activation in cardiomyoblast cell lines.",
          "Vinyes, D., Muñoz-Sellart, M., & Fischer, L. (2023). Therapeutic use of low-dose local anesthetics in pain, inflammation, and other clinical conditions: A systematic scoping review. Journal of Clinical Medicine, 12, 7221. https://doi.org/10.3390/jcm12237221",
          "Lundberg, P., Abrahamsson, A., Kihlberg, J., et al. (2024). Low-dose acetylsalicylic acid reduces local inflammation and tissue perfusion in dense breast tissue in postmenopausal women. Breast Cancer Research, 26, 22. https://doi.org/10.1186/s13058-024-01780-2",
          "Borroni, D., Mazzotta, C., Rocha-de-Lossada, C., Sánchez-González, J.-M., Ballesteros-Sanchez, A., García-Lorente, M., et al. (2023). Dry eye para-inflammation treatment: Evaluation of a novel tear substitute containing hyaluronic acid and low-dose hydrocortisone. Biomedicines, 11, 3277. https://doi.org/10.3390/biomedicines11123277",
          "Kupka, E., Hesselman, S., Hastie, R., Lomartire, R., Wikström, A. K., & Bergman, L. (n.d.). Low-dose aspirin use in pregnancy and the risk of preterm birth: A Swedish register-based cohort study.",
        ],
      },
    ],
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
              {group.entries && group.entries.length > 0 && (
                <ul className="mt-3 list-disc space-y-3 pl-5">
                  {group.entries.map((entry, i) => (
                    <li key={i}>
                      <ProductText>{entry}</ProductText>
                    </li>
                  ))}
                </ul>
              )}
              {group.subsections?.map((subsection) => (
                <div key={subsection.heading} className="mt-6">
                  <h3 className="font-display text-lg tracking-tight text-[color:var(--royal)]">
                    {subsection.heading}
                  </h3>
                  <ul className="mt-3 list-disc space-y-3 pl-5">
                    {subsection.entries.map((entry, i) => (
                  <li key={i}>
                    <ProductText>{entry}</ProductText>
                  </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
