// Shared content configuration for the three top-level InwardWise products.
// Product names, taglines, routes and CTA labels MUST be sourced from here so
// they read identically everywhere they are reused.

export type ProductId = "decision" | "self" | "connect";

export interface ProductCta {
  label: string;
  to: string;
  primary?: boolean;
}

export interface ProductDef {
  id: ProductId;
  /** Full product name, e.g. "InwardWise Decision". */
  name: string;
  /** Short name used in menus. */
  shortName: string;
  /** The one canonical tagline. Reused verbatim everywhere. */
  tagline: string;
  /** Short overview paragraph for the product card. */
  summary: string;
  /** Dedicated product-detail route. */
  href: string;
  /** Anchor id on the /products overview page. */
  anchor: string;
  /** Primary call-to-action for the card and the detail page. */
  cta: ProductCta;
}

export const PRODUCTS: ProductDef[] = [
  {
    id: "decision",
    name: "InwardWise Decision",
    shortName: "Decision",
    tagline:
      "Before asking AI for an answer, make sure you're asking it to solve the right problem.",
    summary:
      "A seven-stage Objective-Oriented Out-In framework that clarifies the objective, removes bias and fear, and works the decision from the outside in.",
    href: "/products/decision",
    anchor: "decision",
    cta: { label: "Start My Decision", to: "/decision", primary: true },
  },
  {
    id: "self",
    name: "InwardWise Self",
    shortName: "Self",
    tagline: "Understand your inner self. Use that understanding to navigate the outer world.",
    summary:
      "Build a private inner Self through a guided conversation, then use it to see your patterns clearly. InwardWise Calm and InwardWise Mantra sit alongside it.",
    href: "/products/self",
    anchor: "self",
    cta: { label: "Build My Self", to: "/avatar", primary: true },
  },
  {
    id: "connect",
    name: "InwardWise Connect",
    shortName: "Connect",
    tagline: "Understand how you connect. Find where you belong. Build connections that matter.",
    summary:
      "Bring what is on your mind and choose how to work with it: make a decision, use your Self, or simply connect with material and stories from people who have been there.",
    href: "/products/connect",
    anchor: "connect",
    cta: { label: "Use InwardWise Connect", to: "/connect", primary: true },
  },
];

export function getProduct(id: ProductId): ProductDef {
  return PRODUCTS.find((p) => p.id === id)!;
}

/** Sub-products that live under Self, never as top-level products. */
export const SELF_SUB_PRODUCTS = [
  {
    id: "calm",
    name: "InwardWise Calm",
    summary:
      "Guided calm practice for a mind that will not settle: short, spoken, and shaped around what you brought with you today.",
    href: "/products/calm-mantra",
    cta: { label: "Start Calm", to: "/meditation/practice" },
  },
  {
    id: "mantra",
    name: "InwardWise Mantra",
    summary:
      "A personal phrase you can return to. Built from your own words, not borrowed from someone else's tradition.",
    href: "/products/calm-mantra",
    cta: { label: "Create My Mantra", to: "/meditation/practice" },
  },
] as const;

export const SELF_DISCLAIMER =
  "InwardWise Self is not medical, psychiatric or psychological care, and it does not diagnose or treat any condition. If you are in distress or in danger, contact your local emergency services or a qualified professional.";

/** The seven stages of the Objective-Oriented Out-In framework. */
export const OOOI_STAGES = [
  "Situation",
  "Objective",
  "Solutions",
  "Remove Bias & Fear",
  "Abstract the Objective",
  "Define the Boundary",
  "Work Out-In",
] as const;

export const OOOI_PROMISE =
  "Clarify the objective → Challenge assumptions → Expand your perspective → Define the boundary → Decide with greater clarity.";

/**
 * Placeholder marker for long-form copy that still requires the approved
 * "Website Edits" source document. Anything rendered through this helper is
 * intentionally visible so it cannot ship unnoticed.
 */
export const APPROVED_COPY_REQUIRED = "APPROVED COPY REQUIRED";
