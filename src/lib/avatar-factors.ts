export type AvatarQuestion = {
  key: string;
  prompt: string;
  helper?: string;
  /** Easy, indirect opening used by the motivational-interviewing agent. */
  opening?: string;
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
        prompt: "Growing up, between the ages of five and fifteen, what were your real fears?",
        helper: "Not the ones you told people about — the ones that were actually true.",
      },
      {
        key: "d1_q2",
        prompt: "What did you do to avoid the situations that exposed you to those fears?",
      },
      {
        key: "d1_q3",
        prompt: "Growing up, what were you ashamed of and wanted to hide?",
      },
      {
        key: "d1_q4",
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
        prompt: "What are your skills, and how did they develop?",
        helper:
          "Channelled abilities built by necessity and repetition — writing, self-reflection, recruiting, surgery, cooking. Keep interests out; they belong in Factor 4.",
      },
      {
        key: "d3_q2",
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
        prompt:
          "How do you connect to the outer world through solo interests, hobbies or activities?",
        helper:
          "Documentaries, reading, music, writing, gardening, scientific curiosity — things you return to without being asked.",
      },
      {
        key: "d4_q2",
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
        prompt:
          "What are some of your unique life experiences — without regard to good or bad?",
      },
      {
        key: "d5_q2",
        prompt: "If you connect these experiences like dots, is there a pattern?",
      },
    ],
  },
];


export function getDimension(n: number): AvatarDimension | undefined {
  return AVATAR_DIMENSIONS.find((d) => d.n === n);
}
