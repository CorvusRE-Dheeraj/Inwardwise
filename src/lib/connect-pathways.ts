// Shared catalogue of the Connect AI pathways. Used both by the pathway grid
// and by Connect AI when it suggests which one fits a prompt.

export type PathwayId =
  | "book"
  | "events"
  | "membership"
  | "belonging"
  | "oneness"
  | "share"
  | "decision"
  | "self";

export type PathwayDef = {
  id: PathwayId;
  name: string;
  accent: string;
  purpose: string;
  to: string;
  action: string;
};

export const PATHWAYS: PathwayDef[] = [
  {
    id: "book",
    name: "Connect",
    accent: "Book",
    purpose:
      "AI looks at your prompt and your InwardWise Self, and based on that understanding recommends among various Connect alternatives if reading a book is relevant. If that is the case, it offers sections of the book the Founder wrote based on research for over 5 years at the intersections of psychology, philosophy, medicine and social sciences. But he put on his engineer and physicist hat so it has a unique flair on which the products are based on.",
    to: "/connect/book",
    action: "Open Book",
  },
  {
    id: "events",
    name: "Connect",
    accent: "Events",
    purpose:
      "AI looks at your prompt and your InwardWise Self, and based on that understanding recommends events to be part of, among other Connect alternatives.",
    to: "/connect/events",
    action: "Find Events",
  },
  {
    id: "membership",
    name: "Connect",
    accent: "Membership",
    purpose: "Somewhere to return to, with moderated groups working through something similar.",
    to: "/connect/membership",
    action: "See Groups",
  },
  {
    id: "belonging",
    name: "Connect",
    accent: "Belonging",
    purpose:
      "We have become very social and mobile, connect with many through online means, yet we feel more and more alone, feel no one shares our opinions and no one makes the effort to know us. Using AI, and knowing you via the InwardWise Self, assess your belongingness and how to improve it.",
    to: "/connect/belonging",
    action: "Find Belonging",
  },
  {
    id: "oneness",
    name: "Connect",
    accent: "Oneness",
    purpose:
      "A wider view that places your situation inside a larger picture, with one reflection prompt.",
    to: "/connect/oneness",
    action: "Widen the View",
  },
  {
    id: "share",
    name: "Connect",
    accent: "Share",
    purpose: "Record your own experience for someone else, anonymously and consent-led.",
    to: "/connect/share",
    action: "Share Experience",
  },
  {
    id: "decision",
    name: "Connect",
    accent: "Decision",
    purpose:
      "For when what you wrote is really a choice you need to make, carried into the Decision flow.",
    to: "/decision",
    action: "Make Decision",
  },
  {
    id: "self",
    name: "Connect",
    accent: "Self Aware",
    purpose: "Personal reflection using only your own completed Self, kept private to you.",
    to: "/avatar/ask",
    action: "Self Aware",
  },
];

export const PATHWAY_IDS = PATHWAYS.map((p) => p.id);

export function pathwayById(id: string): PathwayDef | null {
  return PATHWAYS.find((p) => p.id === id) ?? null;
}
