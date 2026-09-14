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

export const WISE_OWL_FOUNDATIONS: Array<{ title: string; source: string; body: string }> = [
  {
    title: "Carnegie filter — rapport and cooperation",
    source: "Dale Carnegie, How to Win Friends and Influence People",
    body: "Make the other person feel respected, important, heard and willing to cooperate.",
  },
  {
    title: "Motivational interviewing filter — draw out their own motivation",
    source: "Miller, W. R., & Rollnick, S. Motivational Interviewing",
    body: "Instead of persuading someone directly, help them discover and articulate their own reasons for changing or acting.",
  },
  {
    title: "Tactical empathy filter — understand before influencing",
    source: "Chris Voss, Never Split the Difference",
    body: "Surface hidden concerns and reduce resistance, without necessarily agreeing.",
  },
  {
    title: "Active listening filter — understand accurately",
    source: "Rogers, C. R. (1951). Client-centered therapy. Boston: Houghton Mifflin.",
    body: "Prevent the AI from becoming an intelligent talking machine that does not actually listen.",
  },
  {
    title: "Nonviolent communication filter — reduce conflict",
    source: "Marshall Rosenberg's NVC framework",
    body: "Separate observation, feeling, need and request, so a disagreement does not become an attack.",
  },
  {
    title: "Cialdini persuasion filter — ethical influence",
    source: "Robert Cialdini's persuasion research",
    body: "Use reciprocity, consistency, social proof and authority openly rather than as pressure tactics.",
  },
  {
    title: "Emotional intelligence filter — read the emotional conversation",
    source: "Emotional intelligence literature",
    body: "Respond to the person's emotional state, not merely the literal words.",
  },
  {
    title: "Socratic filter — improve thinking through questions",
    source: "Waltman, S. H., Codd III, R. T., & McFarr, L. M. (2020). Socratic questioning for therapists and counselors. Routledge.",
    body: "Help someone examine an issue rather than telling them the conclusion.",
  },
  {
    title: "Behavioral economics filter — detect decision biases",
    source: "Kahneman, D. (2011). Thinking, Fast and Slow. New York: Farrar, Straus and Giroux.",
    body: "Name the anchoring, loss aversion and framing effects that quietly shape the answer.",
  },
  {
    title: "Face and autonomy filter — protect ego and agency",
    source: "Brown, P., & Levinson, S. C. (1987). Politeness: Some universals in language usage. Cambridge University Press.",
    body: "Say the difficult thing in a way that leaves the person's dignity and choice intact.",
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
