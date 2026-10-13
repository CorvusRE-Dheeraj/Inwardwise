// Psychology games: short, scenario-based situations. Config-driven, never diagnostic.
// Every result is a gentle signal, never a label.

export type PsychOption = { label: string; signal: string; consequence?: string };
export type PsychGame = {
  id: string;
  title: string;
  kind: string;
  context: "workplace" | "friendship" | "family" | "unexpected" | "everyday";
  minutes: string;
  situation: string;
  /** Optional speech-bubble line from another person. */
  message?: { who: string; text: string };
  q1: string;
  options: PsychOption[];
  q2: string;
  options2: PsychOption[];
  /** Ask "what made you choose it?" in free text. */
  askWhy?: boolean;
};

const SIGNAL_TEXT: Record<string, string> = {
  direct: "you were willing to address things openly",
  patient: "you seemed comfortable giving a situation time",
  curious: "you tended to look for more information first",
  caring: "you gave importance to how the other person felt",
  practical: "you prioritized a practical way forward",
  boundary: "you respected other people's boundaries",
  harmony: "you seemed to value keeping things calm",
  responsible: "you gave weight to responsibility and getting it right",
  independent: "you leaned on your own judgement",
  collaborative: "you looked for ways to involve others",
  flexible: "you were open to changing course with new evidence",
  steady: "you preferred to hold your position until you knew more",
  growth: "you gave importance to learning and freedom",
  security: "you gave importance to stability",
};

export const PSYCH_GAMES: PsychGame[] = [
  {
    id: "quiet-colleague", title: "The Quiet Colleague", kind: "What Would You Do?", context: "workplace", minutes: "1–2 min",
    situation: "You arrive at a meeting and notice that one person who normally talks a lot is unusually quiet. Nobody else seems to notice.",
    q1: "What do you do first?",
    options: [
      { label: "Ask them privately if everything is okay.", signal: "caring", consequence: "They reply: \"I'm fine. I just don't feel like talking about it.\"" },
      { label: "Continue and see whether they speak later.", signal: "patient", consequence: "The meeting ends. They still haven't said much." },
      { label: "Try to understand why before approaching them.", signal: "curious", consequence: "You notice they keep checking their phone." },
      { label: "Make a light comment to help them feel comfortable.", signal: "harmony", consequence: "They smile briefly, then go quiet again." },
    ],
    q2: "What do you do next?",
    options2: [
      { label: "Let it be and check in tomorrow.", signal: "boundary" },
      { label: "Gently offer that you're around if they want to talk.", signal: "caring" },
      { label: "Ask directly what's going on.", signal: "direct" },
      { label: "Leave it, it's their business.", signal: "independent" },
    ],
  },
  {
    id: "friend-cancels", title: "Friend Cancels", kind: "What Would You Do?", context: "friendship", minutes: "1–2 min",
    situation: "Your friend cancels an important plan at the last minute and gives a very short explanation.",
    q1: "What do you do?",
    options: [
      { label: "Ask what happened.", signal: "direct", consequence: "They say: \"Just a lot going on. Sorry.\"" },
      { label: "Assume something came up.", signal: "patient", consequence: "A day passes with no further message." },
      { label: "Feel disappointed but say nothing.", signal: "harmony", consequence: "They message later asking if you're upset." },
      { label: "Ask whether they want to talk.", signal: "caring", consequence: "They say: \"Maybe later.\"" },
    ],
    q2: "Then what?",
    options2: [
      { label: "Suggest another plan.", signal: "practical" },
      { label: "Tell them honestly how it felt.", signal: "direct" },
      { label: "Give them space.", signal: "boundary" },
      { label: "Check how they are doing.", signal: "caring" },
    ],
  },
  {
    id: "between-lines", title: "Read Between the Lines", kind: "Read Between the Lines", context: "everyday", minutes: "1–2 min",
    situation: "Two people are deciding where to go. One of them says:",
    message: { who: "Person A", text: "It's okay. Do whatever you want." },
    q1: "What do you think is most likely happening?",
    options: [
      { label: "They genuinely don't mind.", signal: "independent" },
      { label: "They are disappointed.", signal: "caring" },
      { label: "They want the other person to decide.", signal: "practical" },
      { label: "They are avoiding an argument.", signal: "harmony" },
      { label: "Not enough information.", signal: "curious" },
    ],
    q2: "If you were the other person, what would you reply?",
    options2: [
      { label: "\"Are you sure? I'd like to know what you'd prefer.\"", signal: "curious" },
      { label: "\"Okay, let's go with my choice then.\"", signal: "independent" },
      { label: "\"Let's pick something we both like.\"", signal: "collaborative" },
      { label: "\"You seem a bit off, is everything okay?\"", signal: "caring" },
    ],
    askWhy: true,
  },
  {
    id: "next-move", title: "Choose the Next Move", kind: "Branching story", context: "workplace", minutes: "2–3 min",
    situation: "You are working with three people on an important project. Two of them disagree strongly about what to do next.",
    q1: "What do you do?",
    options: [
      { label: "Mediate between them.", signal: "harmony", consequence: "Both relax a little, but neither changes their mind." },
      { label: "Observe for now.", signal: "patient", consequence: "The disagreement grows louder." },
      { label: "Choose the side you agree with.", signal: "direct", consequence: "One person looks relieved, the other frustrated." },
      { label: "Ask for more information.", signal: "curious", consequence: "It turns out they have different deadlines in mind." },
      { label: "Propose a compromise.", signal: "collaborative", consequence: "One agrees; the other wants time to think." },
    ],
    q2: "Look at the path you created. What's your next step?",
    options2: [
      { label: "Set a clear decision deadline.", signal: "practical" },
      { label: "Bring everyone together to talk it through.", signal: "collaborative" },
      { label: "Ask a lead to decide.", signal: "responsible" },
      { label: "Give it a day.", signal: "patient" },
    ],
  },
  {
    id: "what-matters", title: "What Matters Most?", kind: "Competing priorities", context: "workplace", minutes: "1–2 min",
    situation: "You have one hour left before an important deadline. Your work is 80% complete. A colleague says one section may contain an important mistake.",
    q1: "What matters most right now?",
    options: [
      { label: "Finish on time.", signal: "practical", consequence: "You finish with ten minutes to spare." },
      { label: "Verify the possible mistake.", signal: "responsible", consequence: "You find a small error, but now time is tight." },
      { label: "Ask someone else to check it.", signal: "collaborative", consequence: "They agree, but can only look in 40 minutes." },
      { label: "Tell the team about the risk.", signal: "direct", consequence: "The team asks what you recommend." },
    ],
    q2: "What do you do with what's left?",
    options2: [
      { label: "Submit and flag the risk honestly.", signal: "responsible" },
      { label: "Ask for a short extension.", signal: "flexible" },
      { label: "Push through and fix what you can.", signal: "independent" },
      { label: "Split the remaining work with others.", signal: "collaborative" },
    ],
  },
  {
    id: "two-good-choices", title: "Two Good Choices", kind: "Two Good Choices", context: "everyday", minutes: "1–2 min",
    situation: "You receive two job offers. Option A: higher salary, less flexibility. Option B: lower salary, more freedom and learning.",
    q1: "Which would you choose?",
    options: [
      { label: "Option A, higher salary.", signal: "security" },
      { label: "Option B, freedom and learning.", signal: "growth" },
      { label: "I'd try to negotiate a mix.", signal: "practical" },
    ],
    q2: "What weighed most in your choice?",
    options2: [
      { label: "The people who depend on me.", signal: "responsible" },
      { label: "Where I want to be in five years.", signal: "growth" },
      { label: "Feeling settled and secure.", signal: "security" },
      { label: "My gut feeling.", signal: "independent" },
    ],
    askWhy: true,
  },
  {
    id: "missing-info", title: "The Missing Information", kind: "Incomplete information", context: "workplace", minutes: "1–2 min",
    situation: "Your colleague hasn't responded to your message for two days.",
    q1: "What feels most likely?",
    options: [
      { label: "They're busy.", signal: "patient", consequence: "Another day passes." },
      { label: "They forgot.", signal: "practical", consequence: "You notice they've replied to others." },
      { label: "They're unhappy with me.", signal: "caring", consequence: "You start replaying your last message." },
      { label: "I don't know yet.", signal: "curious", consequence: "You still have no reply." },
    ],
    q2: "What do you do?",
    options2: [
      { label: "Send a friendly follow-up.", signal: "direct" },
      { label: "Ask someone else.", signal: "collaborative" },
      { label: "Wait a bit longer.", signal: "patient" },
      { label: "Move ahead without their reply.", signal: "independent" },
    ],
  },
  {
    id: "new-evidence", title: "New Evidence", kind: "Changing your mind", context: "unexpected", minutes: "1–2 min",
    situation: "You've decided to book a trip with a friend. Just before paying, you read several recent reviews saying the place has changed a lot.",
    q1: "Do you change your decision?",
    options: [
      { label: "Definitely.", signal: "flexible", consequence: "Your friend is disappointed; they were excited." },
      { label: "Probably.", signal: "flexible", consequence: "Your friend says the reviews might be exaggerated." },
      { label: "Not yet.", signal: "steady", consequence: "More reviews appear, mixed this time." },
      { label: "I need more information.", signal: "curious", consequence: "You find a recent photo that looks fine." },
    ],
    q2: "How do you settle it?",
    options2: [
      { label: "Decide together with my friend.", signal: "collaborative" },
      { label: "Go with what the evidence says.", signal: "responsible" },
      { label: "Trust my first instinct.", signal: "steady" },
      { label: "Pick a safer alternative.", signal: "security" },
    ],
  },
  {
    id: "three-messages", title: "Same Message, Different People", kind: "Context matters", context: "friendship", minutes: "1–2 min",
    situation: "You send the same message to three people: a close friend, your manager, and someone new you just met. None of them reply for a day.",
    q1: "Whose silence would you notice most?",
    options: [
      { label: "My close friend.", signal: "caring" },
      { label: "My manager.", signal: "responsible" },
      { label: "The new person.", signal: "curious" },
      { label: "Honestly, none of them.", signal: "independent" },
    ],
    q2: "Would you react differently to each?",
    options2: [
      { label: "Yes, quite differently.", signal: "flexible" },
      { label: "A little.", signal: "patient" },
      { label: "No, about the same.", signal: "steady" },
    ],
    askWhy: true,
  },
  {
    id: "pressure-mode", title: "Pressure Mode", kind: "Quick choice", context: "unexpected", minutes: "1 min",
    situation: "Your train is cancelled and you need to be somewhere in an hour. Take your time, there's a gentle timer only for curiosity.",
    q1: "Your first instinct?",
    options: [
      { label: "Book a taxi right away.", signal: "practical", consequence: "Prices are high but one is available." },
      { label: "Check alternatives first.", signal: "curious", consequence: "There's a bus in 20 minutes." },
      { label: "Let the people waiting know.", signal: "responsible", consequence: "They say it's okay to be a little late." },
    ],
    q2: "Looking back calmly, would you choose the same?",
    options2: [
      { label: "Yes, same choice.", signal: "steady" },
      { label: "No, I'd slow down first.", signal: "patient" },
      { label: "I'd ask for help sooner.", signal: "collaborative" },
    ],
  },
];

export const psychGameById = (id: string) => PSYCH_GAMES.find((g) => g.id === id);

/** Observational reflection text, never a label. */
export function reflectOn(signals: string[]): string {
  const uniq = [...new Set(signals)].filter((s) => SIGNAL_TEXT[s]);
  if (!uniq.length) return "Your choices are yours to interpret. Nothing here is a conclusion about you.";
  const parts = uniq.slice(0, 2).map((s) => SIGNAL_TEXT[s]);
  return `In this situation, ${parts.join(", and ")}. This is only one moment, patterns emerge over many situations.`;
}

/** Discovery points: rewards taking part, never "right" answers. */
export function psychScore(answered: number, wroteWhy: boolean): number {
  return answered * 10 + (wroteWhy ? 10 : 0);
}
