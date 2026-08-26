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
        opening:
          "Growing up, between five and fifteen, tell me about what you liked and did not like, how you handled the problems that came at you, and what happened when you could not solve one.",
        prompt: "Growing up, between the ages of five and fifteen, what were your real fears?",
        helper: "Not the ones you told people about — the ones that were actually true.",
      },
      {
        key: "d1_q2",
        opening:
          "When something like that was coming your way, what did you usually do? Walk me through it.",
        prompt: "What did you do to avoid the situations that exposed you to those fears?",
      },
      {
        key: "d1_q3",
        opening:
          "Was there anything back then that you kept to yourself, that you would rather nobody knew about?",
        prompt: "Growing up, what were you ashamed of and wanted to hide?",
      },
      {
        key: "d1_q4",
        opening:
          "As a game, and only for a moment: what did adults call your \"bad behaviour\" back then, and what might it have been protecting?",
        prompt:
          "What “bad behaviour” did you have as a child — and how would you describe it charitably, as a protective response rather than a flaw?",
      },
      {
        key: "d1_q5",
        opening:
          "Now the other side of it: what did you do back then that you felt genuinely good about?",
        prompt: "Growing up, between the ages of five and fifteen, what were you proud of?",
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
      "Everyone makes mistakes. This factor is about what makes you imperfect, which is to say what makes you human. Here we ask for the habits, actions or vices you may not be proud of but which are part of your story, along with how often you find yourself engaging in them. Your InwardWise Self will not be accurate or complete unless you recognise them and list them here. No one else sees this; it is designed that way.",

    questions: [
      {
        key: "d2_q1",
        opening:
          "Nobody sees this but you. What habits or patterns have pulled you off course, and how often have they had you?",
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
        opening:
          "What are you noticeably better at than most people around you, and what did the road to that look like?",
        prompt: "What are your skills, and how did they develop?",
        helper:
          "Channelled abilities built by necessity and repetition — writing, self-reflection, recruiting, surgery, cooking. Keep interests out; they belong in Factor 4.",
      },
      {
        key: "d3_q2",
        opening:
          "What comes so easily to you that you barely count it as work, and what do others say you are known for?",
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
        opening:
          "When you have time entirely to yourself, what do you find yourself returning to?",
        prompt:
          "How do you connect to the outer world through solo interests, hobbies or activities?",
        helper:
          "Documentaries, reading, music, writing, gardening, scientific curiosity — things you return to without being asked.",
      },
      {
        key: "d4_q2",
        opening:
          "And when you are with other people by choice, what are you doing together?",
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
        opening:
          "Tell me about a few experiences that shaped you, without sorting them into good or bad.",
        prompt:
          "What are some of your unique life experiences — without regard to good or bad?",
      },
      {
        key: "d5_q2",
        opening:
          "If you lay those side by side, what do you notice running through them?",
        prompt: "If you connect these experiences like dots, is there a pattern?",
      },
    ],
  },
];


export function getDimension(n: number): AvatarDimension | undefined {
  return AVATAR_DIMENSIONS.find((d) => d.n === n);
}
