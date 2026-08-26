// Deterministic, model-independent crisis detection.
// Used as a safety net so hotlines are always surfaced, even if the model
// keeps facilitating instead of stopping.
import type { MiCrisisCategory } from "@/lib/mi-filter";

const PATTERNS: Array<{ category: MiCrisisCategory; re: RegExp }> = [
  {
    category: "suicide",
    re: /\b(kill myself|killing myself|end my life|ending my life|take my own life|suicid\w*|self[-\s]?harm|cut myself|want to die|don'?t want to live|no reason to live|overdose)\b/i,
  },
  {
    category: "imminent_danger",
    re: /\b(not safe|unsafe right now|in danger|being followed|stalk\w*|he('| i)?s going to kill|she('| i)?s going to kill|threaten\w* to kill|has a (gun|knife|weapon)|about to hurt|hurt me again|nearby and (i|I) am scared|need medical aid|need medical help|bleeding|attack\w*|attacked me)\b/i,
  },
  {
    category: "sexual_assault",
    re: /\b(rape[d]?|raping|sexual(ly)? assault\w*|molest\w*|title ix|forced (me|himself|herself) on)\b/i,
  },
  {
    category: "domestic_violence",
    re: /\b(domestic (violence|abuse)|(my )?(husband|wife|partner|boyfriend|girlfriend|spouse|dad|father|mom|mother)\s+(hits?|hit|beats?|beat|abuses?|abused|chokes?|choked|strangl\w+)|abusive (partner|husband|wife|relationship))\b/i,
  },
  {
    category: "lgbtq",
    re: /\b(lgbtq?\+?|gay|lesbian|bisexual|transgender|trans|non[-\s]?binary|queer)\b/i,
  },
];

const ASSAULT_GENERIC =
  /\b(assault(ed|ing)?|beat me up|someone attacked me|he attacked me|she attacked me)\b/i;

/**
 * Returns the crisis categories implied by free text. Empty array = no crisis
 * detected. Intentionally errs on the side of showing help.
 */
export function detectCrisis(text: string): MiCrisisCategory[] {
  const found = new Set<MiCrisisCategory>();
  for (const { category, re } of PATTERNS) {
    if (re.test(text)) found.add(category);
  }

  // "Someone assaulted me" without an explicit sexual/domestic marker still
  // means violence: route it as imminent danger.
  if (ASSAULT_GENERIC.test(text)) found.add("imminent_danger");

  // An identity mention alone is not a crisis.
  if (found.size === 1 && found.has("lgbtq")) return [];

  // Suicidal intent with a plan or "right now" is also imminent danger.
  if (found.has("suicide") && /\b(plan|tonight|right now|today|about to)\b/i.test(text)) {
    found.add("imminent_danger");
  }

  const order: MiCrisisCategory[] = [
    "imminent_danger",
    "suicide",
    "sexual_assault",
    "domestic_violence",
    "lgbtq",
  ];
  return order.filter((c) => found.has(c));
}

/** Merge detections across a whole transcript of user messages. */
export function detectCrisisInMessages(texts: string[]): MiCrisisCategory[] {
  return detectCrisis(texts.join("\n"));
}
