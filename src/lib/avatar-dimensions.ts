export type AvatarQuestion = { key: string; prompt: string; helper?: string };

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
    title: "Dimension One —",
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
    title: "Dimension Two —",
    italic: "Enemy",
    oneLine: "Private. Encrypted with your PIN. Visible only to you.",
    locked: true,
    intro:
      "Everyone carries destructive tendencies that, left unmanaged, cause real harm. Naming them plainly — without judgement, without editing — is what makes your Avatar accurate rather than flattering.",
    questions: [
      {
        key: "d2_q1",
        prompt:
          "List any vices, destructive habits, or repeated patterns that have derailed you before — or could — and roughly how often they appear.",
        helper: "This field is encrypted with your PIN. No administrator can read it.",
      },
    ],
  },
  {
    n: 3,
    section: "§ 03",
    title: "Dimension Three —",
    italic: "Skills & Talents",
    oneLine: "What effort built, and what came effortlessly.",
    intro:
      "A skill is developed through repetition and necessity. A talent is something done with such ease and enjoyment that it never felt like effort. The distinction matters.",
    questions: [
      { key: "d3_q1", prompt: "What are your skills, and how did they develop?" },
      {
        key: "d3_q2",
        prompt:
          "What is the one talent you — or others — most identify you with? Something you have used almost effortlessly to create or achieve.",
      },
    ],
  },
  {
    n: 4,
    section: "§ 04",
    title: "Dimension Four —",
    italic: "Interests & Outer Connections",
    oneLine: "How you meet the world outside yourself.",
    intro:
      "These are not skills you have honed. They are the mediums through which you connect to the outer world — alone, and among others.",
    questions: [
      {
        key: "d4_q1",
        prompt: "What solo interests, hobbies, or activities connect you to the outer world?",
      },
      {
        key: "d4_q2",
        prompt: "What social or group activities connect you to the outer world?",
      },
    ],
  },
  {
    n: 5,
    section: "§ 05",
    title: "Dimension Five —",
    italic: "Life Experiences",
    oneLine: "The dots — and the line running through them.",
    intro:
      "Experiences look random until they are laid side by side. Write them down first; the pattern comes second.",
    questions: [
      { key: "d5_q1", prompt: "What are some of your unique life experiences, good or bad?" },
      {
        key: "d5_q2",
        prompt: "Looking at these experiences together, do you see a pattern?",
      },
    ],
  },
];

export function getDimension(n: number): AvatarDimension | undefined {
  return AVATAR_DIMENSIONS.find((d) => d.n === n);
}
