/**
 * Connect — MVP matching service.
 *
 * Deliberately isolated and pure so a real AI matching service can replace
 * `rankConnectMatches` later without touching the UI. It never receives or
 * returns private Self answers, contact details, or another member's prompt.
 */

export const CONNECT_CATEGORIES = [
  "Belonging & loneliness",
  "Career uncertainty",
  "Relationships",
  "Family",
  "Major life transitions",
  "Feeling stuck",
  "Overcoming adversity",
  "Comparison with others",
] as const;

export type ConnectCategory = (typeof CONNECT_CATEGORIES)[number];

const KEYWORDS: Record<ConnectCategory, string[]> = {
  "Belonging & loneliness": ["lonely", "alone", "belong", "isolated", "friends", "no one", "community"],
  "Career uncertainty": ["career", "job", "work", "quit", "promotion", "boss", "salary", "business"],
  Relationships: ["relationship", "partner", "marriage", "spouse", "divorce", "dating", "argument"],
  Family: ["family", "parents", "mother", "father", "children", "son", "daughter", "sibling"],
  "Major life transitions": ["moved", "moving", "transition", "change", "retire", "loss", "died", "new city"],
  "Feeling stuck": ["stuck", "don't know", "dont know", "paralysed", "paralyzed", "next step", "drifting"],
  "Overcoming adversity": ["addiction", "illness", "recovery", "debt", "failure", "trauma", "setback"],
  "Comparison with others": ["everyone else", "better than me", "behind", "compare", "comparison", "social media"],
};

export function classifyPrompt(text: string): ConnectCategory {
  const t = text.toLowerCase();
  let best: ConnectCategory = "Feeling stuck";
  let bestScore = 0;
  for (const category of CONNECT_CATEGORIES) {
    const score = KEYWORDS[category].reduce((n, k) => (t.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return best;
}

export type ConnectReading = {
  title: string;
  eyebrow: string;
  summary: string;
  body: string;
};

const READINGS: Record<ConnectCategory, ConnectReading> = {
  "Belonging & loneliness": {
    title: "Belonging is accumulated, not discovered",
    eyebrow: "From InwardWise · Factor 4",
    summary:
      "Loneliness rarely responds to more people. It responds to repetition in one place, with the same faces, over enough weeks that you stop being a visitor.",
    body: "Most people treat belonging as a search problem — the right group, the right city, the right circle. In practice it behaves like a compounding problem. Familiarity is built by frequency, and frequency requires choosing one place and returning to it before it has earned your affection. The InwardWise position is simple: reduce the number of rooms, increase the number of returns, and let recognition do the work that charm cannot.",
  },
  "Career uncertainty": {
    title: "Test the decision before you make it",
    eyebrow: "From InwardWise · Decision",
    summary:
      "A career choice made from fatigue is a guess. A career choice made after a small, reversible experiment is evidence.",
    body: "The seven-stage practice separates the situation from the objective for a reason. 'I want to leave' is a situation; the objective underneath it is usually something narrower — autonomy, usefulness, respect, or time. Name the objective, then design the smallest reversible test that would tell you whether a change actually delivers it. Most people discover the objective can be met without the upheaval they were bracing for.",
  },
  Relationships: {
    title: "Recurring conflict is a method disagreement",
    eyebrow: "From InwardWise · Decision",
    summary:
      "When the same argument returns in different words, the disagreement is almost never about values. It is about how two compatible objectives are being pursued.",
    body: "Ask each person to state the objective they are defending before defending it. Objectives are usually compatible — safety, respect, being taken seriously. Tactics are not, and tactics are far easier to renegotiate than character. The moment the shared objective is written down, the argument stops being about who is right.",
  },
  Family: {
    title: "One shared objective, not competing opinions",
    eyebrow: "From InwardWise · Decision",
    summary:
      "Family decisions stall because each person argues from a private objective they have never said out loud.",
    body: "Write each person's objective in a single sentence, then look for the one objective all of them serve. Deciding together becomes tractable once the group is choosing between methods rather than defending identities. Where the objectives genuinely conflict, name the trade-off explicitly rather than letting it be settled by whoever is loudest.",
  },
  "Major life transitions": {
    title: "Keep some of the old while you build the new",
    eyebrow: "From InwardWise · Self",
    summary:
      "Transitions are survivable in proportion to how much continuity you deliberately preserve.",
    body: "After a rupture — a move, a loss, a separation — the instinct is either to rebuild everything or to change nothing. Both fail. Choose three rituals from the previous life that still fit who you are, keep them without apology, and build three new ones that belong only to the life ahead. Continuity is not nostalgia; it is the scaffolding that makes change bearable.",
  },
  "Feeling stuck": {
    title: "Reduce the size of the choice",
    eyebrow: "From InwardWise · Decision",
    summary:
      "Stuckness is usually a decision that has been framed too large to make.",
    body: "When no move feels safe, the problem is rarely courage — it is scale. List the smallest reversible steps available to you, ignore the ones that require certainty, and take the cheapest one. Information arrives through motion. The path becomes visible only from a position you cannot currently see.",
  },
  "Overcoming adversity": {
    title: "Structure, not willpower",
    eyebrow: "From InwardWise · Self",
    summary:
      "Repeating choices are held in place by structure. Change the structure and the choice becomes easier to make.",
    body: "The InwardWise view treats a repeating decision as a systems question rather than a moral one. What precedes the choice? What does it reliably relieve? What could relieve it at lower cost? Answering these honestly, in writing, converts a private struggle into a set of adjustable conditions — which is the only form in which it can be worked on.",
  },
  "Comparison with others": {
    title: "Visibility is not value",
    eyebrow: "From InwardWise · Self",
    summary:
      "Comparison tells you what is visible in other lives. It cannot tell you what you want.",
    body: "Write the list of what you actually want before you read anyone else's. Then mark each item as yours or inherited. A surprising share turns out to belong to other people, and releasing those makes the remaining ambitions feel both smaller and more achievable. The feeling of being behind is usually a measurement error, taken against a scale you never chose.",
  },
};

export function readingFor(category: ConnectCategory): ConnectReading {
  return READINGS[category];
}

export type ConnectSupportOption = {
  title: string;
  description: string;
};

export function supportOptionsFor(category: ConnectCategory): ConnectSupportOption[] {
  const base: ConnectSupportOption[] = [
    {
      title: "Trained listener",
      description: "A volunteer listener who will hear the situation without advising or judging.",
    },
    {
      title: "InwardWise support team",
      description: "Practical help using the Decision, Self and Meditation practices for your situation.",
    },
  ];
  if (category === "Overcoming adversity" || category === "Relationships") {
    base.push({
      title: "Professional resources",
      description: "Directories of licensed counsellors and community services in your region.",
    });
  }
  return base;
}

export type ConnectActivity = { title: string; description: string };

export function activitiesFor(category: ConnectCategory): ConnectActivity[] {
  const map: Partial<Record<ConnectCategory, ConnectActivity[]>> = {
    "Belonging & loneliness": [
      { title: "A weekly recurring room", description: "One group that meets on the same evening each week — reading, walking, making." },
      { title: "Volunteer shift", description: "Regular, useful work alongside the same handful of people." },
    ],
    "Career uncertainty": [
      { title: "Skills exchange evening", description: "Teach one thing you know; learn one thing you do not." },
      { title: "Small experiment", description: "A six-week side project designed to test one assumption about the work you want." },
    ],
    "Feeling stuck": [
      { title: "Movement before deciding", description: "A repeated physical practice — walking, swimming, cycling — held for four weeks." },
      { title: "Guided meditation", description: "The InwardWise practice for quieting an overstimulated mind before a decision." },
    ],
  };
  return (
    map[category] ?? [
      { title: "Guided meditation", description: "A short daily InwardWise practice for a calmer, clearer mind." },
      { title: "Reflective writing", description: "Twenty minutes a week describing the situation without solving it." },
    ]
  );
}

export type MatchInput = {
  category: ConnectCategory;
  storyCategories: string[];
  storyCount: number;
};

export type MatchRanking = {
  storyOrder: (index: number) => number;
  hasGroup: boolean;
};

/** Rank curated stories: same category first, then everything else. */
export function rankStories<T extends { category: string }>(stories: T[], category: ConnectCategory): T[] {
  return [...stories].sort((a, b) => {
    const av = a.category === category ? 0 : 1;
    const bv = b.category === category ? 0 : 1;
    return av - bv;
  });
}

/**
 * Book content shown on the community path (members who have not completed
 * their Self build yet). Never contains another member's private material.
 */
export type ConnectBookContent = {
  chapter: string;
  title: string;
  excerpt: string;
  takeaways: string[];
};

export function bookContentFor(category: ConnectCategory): ConnectBookContent {
  const reading = READINGS[category];
  const index = CONNECT_CATEGORIES.indexOf(category) + 1;
  const takeaways: Record<ConnectCategory, string[]> = {
    "Belonging & loneliness": [
      "Choose fewer rooms and return to them more often.",
      "Familiarity, not charm, produces belonging.",
      "Measure weeks of repetition, not number of people met.",
    ],
    "Career uncertainty": [
      "Separate the situation from the objective underneath it.",
      "Design the smallest reversible test of that objective.",
      "Treat fatigue as information, not as a verdict.",
    ],
    Relationships: [
      "State the objective before defending it.",
      "Renegotiate tactics, never character.",
      "Write the shared objective down where both can see it.",
    ],
    Family: [
      "Each person writes their objective in one sentence.",
      "Choose between methods, not identities.",
      "Name unavoidable trade-offs out loud.",
    ],
    "Major life transitions": [
      "Keep three rituals from the life before.",
      "Build three that belong only to the life ahead.",
      "Continuity is scaffolding, not nostalgia.",
    ],
    "Feeling stuck": [
      "Stuckness is usually a scale problem, not a courage problem.",
      "Take the cheapest reversible step available.",
      "Information arrives through motion.",
    ],
    "Overcoming adversity": [
      "Ask what precedes the choice and what it relieves.",
      "Change conditions before demanding willpower.",
      "Write the system down so it can be adjusted.",
    ],
    "Comparison with others": [
      "Write what you want before reading anyone else's list.",
      "Mark each item as yours or inherited.",
      "Being behind is usually a measurement error.",
    ],
  };
  return {
    chapter: `Chapter ${index}`,
    title: reading.title,
    excerpt: `${reading.summary} ${reading.body}`,
    takeaways: takeaways[category],
  };
}
