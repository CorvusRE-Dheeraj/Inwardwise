export type Area = {
  slug: string;
  name: string;
  blurb: string;
};

export const AREAS: Area[] = [
  {
    slug: "individual-development",
    name: "Individual Development",
    blurb:
      "Build real self-knowledge with an AI Avatar trained on your own five dimensions, then use it to choose better.",
  },
  {
    slug: "individual-wellbeing",
    name: "Individual Wellbeing",
    blurb:
      "Quiet an overstimulated mind. Guided meditation, calmer emotional balance, and habits that hold once the session ends.",
  },
  {
    slug: "social-wellbeing",
    name: "Social Wellbeing",
    blurb:
      "Think clearly about friendship, community and belonging — and act in ways that keep those bonds intact.",
  },
  {
    slug: "political-decisions",
    name: "Political Decisions",
    blurb: "Reason past noise, tribe and outrage to a position you can actually defend.",
  },
  {
    slug: "family-decisions",
    name: "Family Decisions",
    blurb: "Decide together with less friction: one shared objective instead of competing opinions.",
  },
  {
    slug: "addiction-counseling",
    name: "Addiction Counseling",
    blurb: "Structured, private and non-judgemental support for the choices that keep repeating.",
  },
  {
    slug: "courts-counseling",
    name: "Courts Counseling",
    blurb: "Weigh your options calmly when the stakes are legal and the pressure is high.",
  },
  {
    slug: "business-decisions",
    name: "Business Decisions",
    blurb: "Strategy, hiring, pricing and pivots — tested against evidence rather than instinct.",
  },
  {
    slug: "medical-decisions",
    name: "Medical Decisions",
    blurb: "Second-order thinking for health choices, so you understand the trade-offs before you commit.",
  },
  {
    slug: "marriage-counseling",
    name: "Marriage Counseling",
    blurb: "Turn recurring conflict into a shared objective both partners can work toward.",
  },
  {
    slug: "ethics-counseling",
    name: "Ethics Counseling",
    blurb: "Test a difficult choice against your own stated principles before you act on it.",
  },
  {
    slug: "school-districts",
    name: "School Districts",
    blurb: "Policy, curriculum and community decisions made transparently and defensibly.",
  },
  {
    slug: "security",
    name: "Security",
    blurb:
      "Airport, national and digital security — read psychological signals before they become threats.",
  },
  {
    slug: "organizational-change",
    name: "Organizational Change",
    blurb: "Move money, people and power through large systems with clarity and foresight.",
  },
];

export function findArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}
