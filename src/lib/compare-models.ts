/**
 * Authored side-by-side comparisons between the InwardWise Decision model
 * (OOOI: objective-first, out-in) and a "Wise Owl" style public-knowledge
 * filter (conventional wisdom, best-practice advice, majority opinion).
 */

export type ModelComparison = {
  n: string;
  category: string;
  prompt: string;
  wiseOwl: string;
  inwardWise: string;
  divergence: string;
};

export const WISE_OWL_DESCRIPTION =
  "A Wise Owl style answer filters your situation through public knowledge: what most people do, what best practice says, what the internet consensus recommends. It is fast, sensible and usually safe.";

export const INWARDWISE_DESCRIPTION =
  "InwardWise Decision does not answer the question you brought. It first tests whether that is the right question, removes fear, ego and social conditioning from the objective, abstracts the objective upward, draws a wider boundary, and only then works inward toward options you can live with.";

export const COMPARISONS: ModelComparison[] = [
  {
    n: "01",
    category: "Medical",
    prompt:
      "Doctors recommend surgery with an 85% success rate and a 15% risk of permanent disability. Should I go ahead?",
    wiseOwl:
      "Weigh the odds and follow the specialists. An 85% success rate is strong, so proceed, take a second opinion, and prepare for recovery.",
    inwardWise:
      "The stated objective — “avoid disability” — is a pseudo objective born of fear. The real objective is a livable, functioning life over the next twenty years. Once framed that way, untreated kidney failure is measured on the same scale as surgical risk, and the boundary widens to include timing, rehabilitation support and who cares for you if the 15% happens.",
    divergence:
      "Same recommendation, different ownership: Wise Owl decides by probability, InwardWise makes you decide against a life objective you can defend later.",
  },
  {
    n: "02",
    category: "Career",
    prompt:
      "I earn a high salary but hate my job. I have another offer at nearly half the pay doing work I love. Should I take it?",
    wiseOwl:
      "Do not halve your income while you carry debt. Stay, build a financial cushion of six to twelve months, and move to meaningful work later.",
    inwardWise:
      "“Money or meaning” is a false binary. The objective abstracts to: build a life where earning does not cost self-respect. The boundary then includes negotiating scope in the current role, a staged exit, contract work, and a debt-clearance date — options that never appear while the question stays yes-or-no.",
    divergence:
      "Wise Owl optimises the trade-off inside the two options given. InwardWise refuses the two options and enlarges the option set first.",
  },
  {
    n: "03",
    category: "Entrepreneurship",
    prompt:
      "I have a secure government job but I dream of launching a startup. Should I resign?",
    wiseOwl:
      "Do not resign yet. Validate the idea on evenings and weekends, save eighteen months of runway, then leave once there is traction.",
    inwardWise:
      "“Start a company” is a solution, not an objective. Abstracted, it is usually autonomy, mastery or proof of self-worth. If the objective is autonomy, the boundary includes roles with ownership, not only founding one. If it genuinely is building the thing, the out-in path is designed so no single leap can sink the family.",
    divergence:
      "Wise Owl sequences the leap. InwardWise first tests whether a leap is what the objective actually requires.",
  },
  {
    n: "04",
    category: "Parenting",
    prompt: "My son wants to quit engineering to become a YouTuber. How do I stop him?",
    wiseOwl:
      "Ask him to finish the degree as a fallback and pursue content creation alongside it. A qualification costs him little and protects his future.",
    inwardWise:
      "Whose objective is being solved? The question carries the parent's fear of social judgement and lost status. Separated, there are two objectives — his path, and your need for security about him. Each gets its own testable conditions: audience milestones, income floors, review dates, instead of one confrontation with a winner and a loser.",
    divergence:
      "Wise Owl arbitrates between father and son. InwardWise shows the decision belongs to two people with two objectives, and stops one being smuggled inside the other.",
  },
  {
    n: "05",
    category: "Marriage",
    prompt: "My spouse has lied to me repeatedly about money. Should I divorce?",
    wiseOwl:
      "Repeated financial deception is a serious breach. Try counselling and full financial transparency; if the lying continues, separation is reasonable.",
    inwardWise:
      "Divorce is an instrument, not an objective. The objective is a life not built on concealment — for you and for the children. Trust becomes the single measurable variable, so a verification boundary comes first: shared accounts, disclosure of debt, a fixed observation window. The irreversible step is only taken against evidence, never against anger.",
    divergence:
      "Wise Owl gives a conditional verdict. InwardWise installs a test before any irreversible step, so the decision is made on evidence rather than on the worst week.",
  },
];

export const WISE_OWL_FOUNDATIONS: Array<{ title: string; body: string }> = [
  {
    title: "Accumulated public knowledge",
    body: "Proverbs, elders' counsel, self-help literature, advice columns and the aggregated opinion of forums and search results. Its authority comes from repetition: if many people say it, it is treated as true.",
  },
  {
    title: "Best practice and professional norms",
    body: "Institutional guidance — clinical protocols, financial planning rules of thumb, career-progression convention. Reliable for the average case, silent about which case you are.",
  },
  {
    title: "Expected-value reasoning",
    body: "Weigh the odds, compare costs and benefits, pick the higher expected outcome. Classical decision theory, applied to the options already on the table.",
  },
  {
    title: "Risk aversion and social safety",
    body: "Prefer the reversible, the insured, the respectable. Protects against catastrophe and against disapproval, and cannot tell the two apart.",
  },
  {
    title: "Precedent and majority behaviour",
    body: "What comparable people did in comparable situations. Strong pattern matching, weak at noticing that your objective differs from theirs.",
  },
];

export const WISE_OWL_LIMITS = [
  "It answers the question as asked, and never audits whether that is the right question.",
  "It optimises inside the options presented, so a false binary stays a false binary.",
  "It cannot separate fear, ego and social conditioning from a stated objective.",
  "It issues a verdict, which quietly transfers ownership of your life away from you.",
];

export const COMPARISON_SUMMARY = [
  "Wise Owl answers the question you asked. InwardWise checks whether it is the right question.",
  "Wise Owl draws on what most people do. InwardWise draws on what your objective requires.",
  "Wise Owl gives you a recommendation. InwardWise gives you the judgment and leaves the verdict with you.",
];
