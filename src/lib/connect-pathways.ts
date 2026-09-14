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
      "Reading that is relevant to what you described, sent in small pieces, with one follow-up action.",
    to: "/connect/book",
    action: "Open Book",
  },
  {
    id: "events",
    name: "Connect",
    accent: "Events",
    purpose: "Local or online gatherings where you can take part rather than read alone.",
    to: "/connect/events",
    action: "Find Events",
  },
  {
    id: "membership",
    name: "Connect",
    accent: "Membership",
    purpose: "Groups and networks you can be part of over time, and how to join them.",
    to: "/connect/membership",
    action: "See Groups",
  },
  {
    id: "belonging",
    name: "Connect",
    accent: "Belonging",
    purpose:
      "Gentle ways to feel less isolated and more socially at home, one small step at a time.",
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
