export type AvatarQuestion = {
  key: string;
  prompt: string;
  helper?: string;
  /** An easier warm-up question asked first; its answer is compared against `prompt`. */
  opener?: string;
  /** What counts as a real internal answer, used by the MI filter. */
  intent?: string;
  /** Self-help examples shown on request to make answering easier. */
  examples?: string[];
};

export type AvatarDimension = {
  n: number;
  section: string;
  title: string;
  italic: string;
  oneLine: string;
  intro: string;
  locked?: boolean;
  questions: AvatarQuestion[];
};

export const AVATAR_DIMENSIONS: AvatarDimension[] = [
  {
    n: 1,
    section: "§ 01",
    title: "Factor One —",
    italic: "Shadow",
    oneLine: "What you suppress, hide, or feel ashamed of.",
    intro:
      "The shadow is the part of us we suppress — the fears and shames we would rather no one saw. Hidden, it still steers behaviour. Named, it becomes material you can work with.",
    questions: [
      {
        key: "d1_q1",
        opener:
          "Think back to being a child, somewhere between five and fifteen. What was one moment you remember not feeling safe?",
        intent:
          "Their genuine private fears from childhood, named in their own words, not the socially acceptable version they told others.",
        examples: [
          "Being left behind at school when nobody came to pick me up.",
          "That my parents would find out I wasn't as good a student as they thought.",
          "Sleeping alone after my grandfather died.",
        ],
        prompt: "Growing up, between the ages of five and fifteen, what were your real fears?",
        helper: "Not the ones you told people about — the ones that were actually true.",
      },
      {
        key: "d1_q2",
        opener:
          "When that fear was around, what did you quietly start doing differently?",
        intent:
          "Concrete avoidance behaviours or coping strategies they used to keep away from the fear.",
        examples: [
          "I stopped raising my hand in class.",
          "I made myself useful so nobody had a reason to be angry.",
          "I always kept a friend with me so I was never alone.",
        ],
        prompt: "What did you do to avoid the situations that exposed you to those fears?",
      },
      {
        key: "d1_q3",
        opener:
          "Growing up, was there something about you or your home you preferred people did not see?",
        intent:
          "Specific sources of shame in childhood and what they concealed.",
        examples: [
          "Our house and how little we had.",
          "My accent when I spoke.",
          "My father's drinking.",
        ],
        prompt: "Growing up, what were you ashamed of and wanted to hide?",
      },
      {
        key: "d1_q4",
        opener:
          "What did adults call your “bad behaviour” as a child?",
        intent:
          "A childhood behaviour they were criticised for, plus a charitable reading of it as protection rather than a flaw.",
        examples: [
          "I lied a lot — looking back, it kept me out of trouble I couldn't handle.",
          "I was stubborn — it was the only control I had.",
          "I hid in books — that was where nothing could reach me.",
        ],
        prompt:
          "What “bad behaviour” did you have as a child — and how would you describe it charitably, as a protective response rather than a flaw?",
      },
    ],
  },
  {
    n: 2,
    section: "§ 02",
    title: "Factor Two —",
    italic: "Enemy",
    oneLine: "Private. Encrypted with your PIN. Visible only to you.",
    locked: true,
    intro:
      "You succumb to certain vices, destructive or unproductive habits and actions. They have derailed your life before, or carry the potential to. You may not think you have them, or hate to admit them, or fear being discovered. But your InwardWise Self will not be accurate or complete unless you recognise them and list them here. No one else sees this — it is designed that way.",
    questions: [
      {
        key: "d2_q1",
        opener:
          "Which habit of yours have you promised yourself you would change, more than once?",
        intent:
          "Honest naming of repeated destructive or unproductive patterns, and roughly how often they recur.",
        examples: [
          "I scroll until 2am most nights, then hate the next day.",
          "I drink more than I say I do, mostly when I'm alone.",
          "I go cold and cutting the moment I feel criticised.",
        ],
        prompt:
          "Whatever the reason, list those vices, destructive habits or repeated patterns — and how often you have succumbed to them before.",
        helper:
          "Write without judgement. Extremes count too: ego, narcissism, selfishness, cynicism, impulsiveness, reactivity, lack of discipline around food, alcohol or substances, procrastination. Encrypted with your PIN — no administrator can read it.",
      },
    ],
  },
  {
    n: 3,
    section: "§ 03",
    title: "Factor Three —",
    italic: "Skills & Talents",
    oneLine: "What effort built, and what came effortlessly.",
    intro:
      "Skills are developed through repetition and disciplined follow-through. They took real effort, but you kept perfecting them until you were better than most. Skills are not interests: interests are ways of connecting to the outside world and belong in Factor 4. A talent is different again — something you do very well and with ease, whose development you always enjoyed, and which others recognise you for.",
    questions: [
      {
        key: "d3_q1",
        opener:
          "What is something you are now good at that you were once clearly bad at?",
        intent:
          "Skills built through repetition and effort, with how they developed.",
        examples: [
          "Writing — I forced myself to publish something weekly for two years.",
          "Interviewing people, from years of hiring.",
          "Cooking, after I had to feed the family every night.",
        ],
        prompt: "What are your skills, and how did they develop?",
        helper:
          "Channelled abilities built by necessity and repetition — writing, self-reflection, recruiting, surgery, cooking. Keep interests out; they belong in Factor 4.",
      },
      {
        key: "d3_q2",
        opener:
          "What do people come to you for, without you ever advertising it?",
        intent:
          "One talent that came easily, was enjoyable to develop, and is recognised by others.",
        examples: [
          "Explaining complicated things simply.",
          "Reading a room before anyone says anything.",
          "Coming up with experiments to test an idea.",
        ],
        prompt:
          "What single talent do you — or others — identify you with, that you admire and have used effortlessly to create?",
        helper:
          "Talent never felt like effort. It may be self-taught or trained: inductive thinking, experimentation, a sport, an instrument, research ability, cooking.",
      },
    ],
  },
  {
    n: 4,
    section: "§ 04",
    title: "Factor Four —",
    italic: "Interests & Outer Connections",
    oneLine: "How you meet the world outside yourself.",
    intro:
      "Interests belong here, not in Factor 3. They are the mediums through which you connect to the outer world — routines so integral to you that they quietly shape what you know and who you meet. Some are solo; some are shared. Both matter.",
    questions: [
      {
        key: "d4_q1",
        opener:
          "On a free evening with nobody to answer to, what do you find yourself doing?",
        intent:
          "Solo interests and routines through which they connect to the outer world.",
        examples: [
          "Documentaries about deep sea life.",
          "Gardening — I lose an hour without noticing.",
          "Reading history, then going down research holes.",
        ],
        prompt:
          "How do you connect to the outer world through solo interests, hobbies or activities?",
        helper:
          "Documentaries, reading, music, writing, gardening, scientific curiosity — things you return to without being asked.",
      },
      {
        key: "d4_q2",
        opener:
          "When did you last spend time in a group of people by choice, and what was it?",
        intent:
          "Group or social activities that connect them outward, present or past.",
        examples: [
          "A Sunday football side I've played with for six years.",
          "A book club of eight people.",
          "Volunteering at the food bank once a month.",
        ],
        prompt:
          "How do you connect to the outer world through non-solo activities — social or group?",
        helper: "Clubs, conferences, teams, communities, gatherings you attend or once attended.",
      },
    ],
  },
  {
    n: 5,
    section: "§ 05",
    title: "Factor Five —",
    italic: "Life Experiences",
    oneLine: "The dots — and the line running through them.",
    intro:
      "By connecting your life's experiences, a general sense of direction appears. That direction acts on your behalf: what to do next, what new experience is worth having, a trip, a course, a certain kind of person to befriend. Write the dots down first; the pattern comes second.",
    questions: [
      {
        key: "d5_q1",
        opener:
          "Name one thing that happened to you that few people you know have been through.",
        intent:
          "Specific distinctive life experiences, without judging them good or bad.",
        examples: [
          "Emigrating alone at nineteen.",
          "Caring for a parent through illness.",
          "Starting something that failed publicly.",
        ],
        prompt:
          "What are some of your unique life experiences — without regard to good or bad?",
      },
      {
        key: "d5_q2",
        opener:
          "Looking at what you just described, does anything repeat?",
        intent:
          "A pattern or direction they themselves recognise across those experiences.",
        examples: [
          "I keep ending up as the person who translates between groups.",
          "Every turning point came after I lost something.",
          "I choose the harder, less obvious route each time.",
        ],
        prompt: "If you connect these experiences like dots, is there a pattern?",
      },
    ],
  },
];


export function getDimension(n: number): AvatarDimension | undefined {
  return AVATAR_DIMENSIONS.find((d) => d.n === n);
}
