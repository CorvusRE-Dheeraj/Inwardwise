// Deterministic, model-independent crisis detection.
// Used as a safety net so hotlines are always surfaced, even if the model
// keeps facilitating instead of stopping.
//
// It must stay quiet for everyday language ("panic attack", "he attacked my
// proposal", "the market is bleeding") so the alert keeps its meaning.
import type { MiCrisisCategory } from "@/lib/mi-filter";

/**
 * Benign uses of otherwise alarming words. Stripped before matching so they
 * cannot trigger anything.
 */
const BENIGN = [
  /\b(panic|anxiety|asthma|heart|angina|cardiac|migraine)\s+attacks?\b/gi,
  /\battack(s|ed|ing)?\s+(my|his|her|their|our|the)\s+(idea|ideas|proposal|plan|plans|argument|position|work|character|credibility|point|view|thesis|record|policy)\w*/gi,
  // Only strip "attack" when it is clearly aimed at an idea/market/reputation
  // AND not aimed at a person ("attacked me", "attacked my daughter").
  /\b(attack|attacks|attacked|attacking)\b(?!\s+(me|us|him|her|them|my\s+\w+))(?=[^.\n]*\b(idea|proposal|argument|thesis|credibility|reputation|market|stocks?|share price)\b)/gi,
  /\b(bleeding)\s+(money|cash|customers|users|talent|edge)\b/gi,
  /\b(market|company|business|stock|budget|team)\s+\w*\s?bleeding\b/gi,
  /\bin danger of\b/gi,
  /\b(job|career|business|company|deal|relationship|marriage|project)\s+(is|was|feels?)\s+(in danger|not safe)\b/gi,
];

function stripBenign(text: string): string {
  return BENIGN.reduce((t, re) => t.replace(re, " "), text);
}

const PATTERNS: Array<{ category: MiCrisisCategory; re: RegExp }> = [
  {
    category: "suicide",
    re: /\b(kill myself|killing myself|end my life|ending my life|take my own life|suicid\w*|self[-\s]?harm|cut myself|want to die|don'?t want to live|no reason to live|overdose)\b/i,
  },
  {
    category: "imminent_danger",
    re: /((\bi\s?(a|')m not safe|\bi am not safe|\bi do ?n'?t feel safe|\bi'?m in danger|\bi am in danger|\bmy life is in danger|\bmy (life|safety) is at risk|\bmy (child|children|kids?|son|daughter|family|baby)\s+(is|are)\s+not safe|\bwe are not safe|\bwe'?re not safe)\b)|\b(being followed|stalking me|stalked me|is stalking|going to kill me|threaten\w* to kill|has a (gun|knife|weapon)|pointed a (gun|knife)|about to hurt me|hurt me again|need medical (aid|help|attention)|need (a )?(doctor|ambulance)|call an ambulance|i(')?m bleeding|i am bleeding|wo ?n'?t stop bleeding|bleeding badly)\b/i,
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

/**
 * Physical violence against the person, not against an idea or an object.
 */
const ASSAULT_GENERIC =
  /\b(assaulted me|assaulted by|someone assaulted|physically assault\w*|beat me up|attacked me physically|(someone|he|she|they|my \w+) (physically )?attacked me)\b/i;

/**
 * Returns the crisis categories implied by free text. Empty array = no crisis
 * detected. Errs on the side of showing help, but only for language that is
 * unambiguously about a person's physical safety.
 */
export function detectCrisis(text: string): MiCrisisCategory[] {
  const cleaned = stripBenign(text);
  const found = new Set<MiCrisisCategory>();
  for (const { category, re } of PATTERNS) {
    if (re.test(cleaned)) found.add(category);
  }

  // "Someone assaulted me" without an explicit sexual/domestic marker still
  // means violence: route it as imminent danger.
  if (ASSAULT_GENERIC.test(cleaned)) found.add("imminent_danger");

  // An identity mention alone is not a crisis, and identity should never be
  // the reason an alert appears.
  if (found.size === 1 && found.has("lgbtq")) return [];

  // Suicidal intent with a plan or "right now" is also imminent danger.
  if (found.has("suicide") && /\b(plan|tonight|right now|today|about to)\b/i.test(cleaned)) {
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
