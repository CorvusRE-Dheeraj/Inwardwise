export type Area = {
  slug: string;
  name: string;
  blurb: string;
};

export const AREAS: Area[] = [
  { slug: "individual-development", name: "Individual Development", blurb: "Build self-knowledge with an AI trained to be you." },
  { slug: "social-wellbeing", name: "Social Wellbeing", blurb: "Navigate relationships, community and belonging." },
  { slug: "political-decisions", name: "Political Decisions", blurb: "Think past noise, tribe and outrage." },
  { slug: "family-decisions", name: "Family Decisions", blurb: "Decide together — with less friction, more clarity." },
  { slug: "addiction-counseling", name: "Addiction Counseling", blurb: "Structured, private, non-judgemental support." },
  { slug: "courts-counseling", name: "Courts Counseling", blurb: "Weigh options when the stakes are legal." },
  { slug: "business-decisions", name: "Business Decisions", blurb: "Strategy, hiring, pricing and pivots." },
  { slug: "medical-decisions", name: "Medical Decisions", blurb: "Second-order thinking for health choices." },
  { slug: "marriage-counseling", name: "Marriage Counseling", blurb: "Turn conflict into shared objectives." },
  { slug: "ethics-counseling", name: "Ethics Counseling", blurb: "Test choices against your own principles." },
  { slug: "school-districts", name: "School Districts", blurb: "Policy, curriculum and community decisions." },
  { slug: "security", name: "Security", blurb: "Airport, national, and digital security — detect psychological signals before they become threats." },
  { slug: "organizational-change", name: "Organizational Change", blurb: "Reroute money and power in large systems with clarity and foresight." },
];

export function findArea(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}
