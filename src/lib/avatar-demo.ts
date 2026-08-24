import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";

export type DemoPerson = {
  id: "alex" | "mary";
  name: string;
  line: string;
  /** Keyed by question key, mirroring AVATAR_DIMENSIONS. */
  answers: Record<string, string>;
};

export const DEMO_PEOPLE: DemoPerson[] = [
  {
    id: "alex",
    name: "Alex",
    line: "34, fictitious. Built his self fully so you can see what a completed InwardWise Self feels like.",
    answers: {
      d1_q1:
        "That my father would lose his temper and there would be nothing I could do. I told people I was scared of the dark, but really I was scared of the sound of the front door at night.",
      d1_q2:
        "I became very quiet and very useful. I learned to read moods before anyone spoke and to be somewhere else before it started.",
      d1_q3:
        "How little money we had, and that I wore my cousin's clothes. I never invited anyone home.",
      d1_q4:
        "They called me secretive. Looking back, keeping things to myself was the only safe place I had.",
      d2_q1:
        "I withdraw completely when I feel criticised — days of silence. And I work late as a way of avoiding going home. Both of them have cost me a relationship already.",
      d3_q1:
        "Explaining technical work to non-technical people. Eight years of doing it badly in meetings until I got good at it.",
      d3_q2:
        "Reading a room. I know who is uncomfortable before they say anything, and people tell me it is unusual.",
      d4_q1: "Long walks with history podcasts, and restoring an old motorbike in the garage.",
      d4_q2: "A five-a-side football team on Thursdays, and a small mentoring circle at work.",
      d5_q1:
        "Left home at seventeen. Put myself through night school. Lost a job I loved in a restructure. Cared for my mother for two years.",
      d5_q2:
        "I keep becoming the steady one in unstable places. It has made me reliable and also very tired.",
    },
  },
  {
    id: "mary",
    name: "Mary",
    line: "41, fictitious. Half-finished on purpose, so you can see how the conversation resumes.",
    answers: {
      d1_q1:
        "Being laughed at. I was the tallest girl in class and I learned to make the joke first so nobody else could.",
      d1_q2: "I performed. Loud and funny, so nobody ever got to see the other part.",
      d1_q3: "That I was not clever, only quick. I still catch myself hiding it.",
      d1_q4: "",
      d2_q1: "",
      d3_q1: "Writing. I wrote a newsletter nobody read for three years and it taught me everything.",
      d3_q2: "",
      d4_q1: "Gardening, and documentaries about the deep sea.",
      d4_q2: "",
      d5_q1: "Emigrated alone at twenty-two. Started a business that closed publicly.",
      d5_q2: "",
    },
  },
];

export function demoProgress(person: DemoPerson): Record<number, number> {
  const out: Record<number, number> = {};
  for (const d of AVATAR_DIMENSIONS) {
    const done = d.questions.filter((q) => (person.answers[q.key] ?? "").trim()).length;
    out[d.n] = Math.round((done / d.questions.length) * 100);
  }
  return out;
}
