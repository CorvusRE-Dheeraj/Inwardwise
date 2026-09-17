import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import { personalityFor } from "@/lib/people-personalities";

export type DemonstrationCharacterId = "alex" | "mary";

export type DemonstrationProfile = {
  id: DemonstrationCharacterId;
  name: string;
  avatarKey: string;
  situation: string;
  motivations: string[];
  concerns: string[];
  strengths: string[];
  weaknesses: string[];
  decisionStyle: string;
  answers: Record<string, string>;
  factorResults: Record<number, string>;
};

export const DEMONSTRATION_CHARACTERS: Record<DemonstrationCharacterId, DemonstrationProfile> = {
  alex: {
    id: "alex",
    name: "Alex",
    avatarKey: "alex",
    situation:
      "A driven young athlete chasing a football scholarship, carrying anger he was never allowed to express, and hiding how smart he is so he can stay one of the boys.",
    motivations: ["A football scholarship to UCSB", "Making his dad proud", "Belonging with his friends"],
    concerns: ["Becoming his dad", "Being seen as a nerd", "Losing his place with the boys"],
    strengths: ["Athletic discipline", "Natural aptitude for math, chemistry and physics", "One honest relationship where he can talk"],
    weaknesses: ["Anger that comes out sideways", "Shutting down instead of talking", "Hiding his abilities out of fear of ridicule"],
    decisionStyle:
      "Reactive under stress. Alex either blows up or shuts down, then escapes into games or the gym to reset before he can think clearly.",
    answers: {
      d1_q1: "Growing up I liked sports — I was a linebacker in the fall and threw shot put in the spring — and hanging out with my boys playing COD. I handled problems by shutting down and saying I was fine even when I wasn't, and when I couldn't solve one I'd get angry. I wasn't taught to talk about my emotions; my dad always said boys don't cry, so anger became the one emotion I was allowed to express.",
      d1_q2: "When something hard came at me I shut down or became angry — quiet and reserved. My girl tells me I'm \"avoidant\" and \"closed off\". Mostly I'd steer clear and avoid the situation entirely.",
      d1_q3: "I'm actually pretty smart, but nobody gives me credit for anything. I barely study and keep it on the down-low so no one gives me crap — my friends would call me a nerd and I'd be left out of team stuff. My girl is the only one who knows; we talk about the real stuff.",
      d1_q4: "Adults would have called it my anger issues. Looking back, that anger was protecting me from showing my emotions — because boys don't cry.",
      d1_q5: "I became the starting linebacker as a sophomore, the first since my dad to do that, and I won the science fair before I moved back to my dad's hometown after my parents' divorce. What felt good was someone telling me I did a good job — making my dad proud.",
      d2_q1: "My anger, lack of communication and emotional immaturity pull me off course pretty often, especially when I'm stressed — which is pretty often. It feels crappy, and my girl gets mad at me.",
      d3_q1: "I play football and I hold the shot put record at my school. I'm also pretty good at math and chemistry. For all of it, I just practiced — drills mostly, conditioning to get stronger, lifting in the gym most days.",
      d3_q2: "Math and chemistry come easily, and I'm decent at physics — it just clicks. I'm taking organic chemistry and Sn2 reactions make complete sense to me while everyone else struggles, so sometimes I help my boys with it. I'd explore it more just for fun, but my friends would call me a nerd or a dork, so I shut it down. I'm excited for college so I can be more myself.",
      d4_q1: "Mostly video games — first-person shooters. They're fast-paced and keep my mind off stuff; you're constantly moving and reacting, and when you win or make a good play it feels good. Plus I'm actually good at it.",
      d4_q2: "Usually hanging out playing COD or LoL, throwing back a few drinks, hitting the gym together or working on footwork drills for football. We don't really do the deep talking thing — we just game, watch sports and chill. I mostly talk about the real stuff with my girl.",
      d5_q1: "My parents' divorce shaped me. My mom and dad always fought — my dad would yell and my mom just had to take it, until she left the papers and left. My biggest fear is becoming my dad, and I think I already am him: I get angry quickly too, and then I yell or shut down. Either way with my girl I lose — if I snap we end up in a huge argument, and if I pull away she says I'm avoiding her.",
      d5_q2: "The pattern running through everything is that stress sucks and I hate feeling backed into a corner. Whether I'm blowing up or shutting down, it's me dealing with stuff piling up at once — chest tight, head racing, an overload of noise. So I bounce: loud music and a drive, the gym, or locking my door and playing COD for hours until I reset. Then I calm down and everything's fine.",
    },
    factorResults: {
      1: "Alex’s shadow grew from a home where boys don’t cry. Anger became the only permitted emotion and a wall against everything else, while being smart had to stay hidden to keep his place with the boys.",
      2: "His recurring enemy is anger with no outlet: stress builds until he blows up or shuts down, and avoidance strains the relationship that matters most to him.",
      3: "His strongest assets are disciplined athletic work and a quick natural grasp of math, chemistry and physics — a mind he only uses freely when no one is watching.",
      4: "He connects through games, the gym and shared sport rather than deep talk, keeping one honest channel — his girlfriend — for the real stuff.",
      5: "His life pattern runs through his parents’ divorce: a fear of becoming his dad, the same quick anger, and an escape-and-reset routine that works short-term but keeps the cycle going.",
    },
  },
  mary: {
    id: "mary",
    name: "Mary",
    avatarKey: "merry",
    situation:
      "A highly organised leader — track captain and drum major — who was picked on in middle school and now keeps everyone included, while running an anxious second track in her head.",
    motivations: ["Making sure nobody is left out", "Community and belonging", "Being the reliable one"],
    concerns: ["Ending up alone", "Being seen as 'too much'", "Time and distance pulling her people away"],
    strengths: ["Organising people", "Leading composed under pressure", "Running through discomfort", "Loyal friendships and family"],
    weaknesses: ["Overthinking that spirals", "Hiding how anxious she is", "Taking control by taking on everything"],
    decisionStyle:
      "Runs every option past the people it touches, then over-analyses it privately. She decides by taking charge of the details and burning off the anxiety with a run.",
    answers: {
      d1_q1: "I played soccer from 5 to 14, did ballet, then jazz, then hip hop, then girl scouts, then theatre, and in high school marching band, track and choir. I liked all of that a lot — it gave me a sense of community. What I feared was not fitting in. I hated being made fun of for my acne, braces and glasses; people would call me names and say mean stuff behind my back, and in the moment it really crushed my confidence. I told myself they were just mean or jealous, but part of me believed them for a long time. Even now, if someone gives me a weird look, that old high school insecurity pops back up.",
      d1_q2: "When something hurt, I'd talk to my friends or my sister about it until I felt better. When I couldn't solve a problem, I'd try to get someone else to see my point of view by venting until they validated me. None of the things they picked on were in my control, so I leaned on the people who loved me — my friends, my parents, my sister — and told myself I was okay.",
      d1_q3: "Probably that I'm not as unshakable as I let myself seem. I'm a very, very anxious person and I overthink even the slightest things. I worry that even though I've known my friends since I was 6, and made new ones in college, I'll end up alone. Holding that inside is exhausting — it's like running a second background operating system that uses up all my battery. On the outside I'm organising the group chat, making plans, keeping everyone together. Inside I'm keeping score, checking if people are pulling away, overanalysing a tone shift in a text, wondering if I'm being 'too much'.",
      d1_q4: "Because I was smart and didn't quite fit in, the more popular girls picked on me — I was an easy target, and it made me feel completely isolated. Charitably, none of it was about me; it was about what was easy to point at. But it's the reason I became hyper-aware of who gets left out.",
      d1_q5: "Giving back to my community, and my relationships. Back then it was tied to whatever group I was in, like food drives with Girl Scouts. Later, in band and theatre, it became about making sure nobody felt left out like I did — staying late to help underclassmen learn marching steps, organising props, planning bake sales with my sister. For me, giving back was just making sure no one had to sit alone. And my sister and I are sisters, so we fight sometimes, but I love her to death.",
      d2_q1: "My overthinking. It turns into spiralling, more often than I'd like, mostly when I'm stressed or doing a million things. If my boyfriend doesn't text back, my mind goes down a rabbit hole: it's been hours; okay, maybe he's just busy; but what if he died; what if he died in a foreign city and the police are going to blame me.",
      d3_q1: "In track I'm one of the fastest on the team and a team captain, and I'm drum major in the marching band. I just practise a lot — when I'm stressed I run, and over time I got faster. Sometimes I put on ankle weights to challenge myself. I don't analyse my stride or anything technical; it's mostly mental. Running is the one time my brain actually shuts off, because I'm forcing my body to work harder than my mind. What makes me faster is being willing to push through the discomfort — I use the nervous energy to run harder instead of slowing down. I trained myself to outrun the urge to quit, and my body adapted.",
      d3_q2: "Organising people and making sure everyone feels included — that's second nature, so it doesn't even feel like work. Keeping the group chat alive, organising team spirit days, coordinating band rehearsals; I naturally take charge of the details. People say I'm known for being the reliable one, the person who has everything under control and keeps the group together. Honestly, most of that comes from wanting to make sure no one ever feels left out or on the outside looking in.",
      d4_q1: "I normally run in my free time, or draw or journal depending on my mood. They're a release — I can actually take time to think instead of hustling. I think about my family, my friends, or the future. Sometimes I overthink what's going to happen with the people in my life or with my career, but these things keep me grounded.",
      d4_q2: "I'm usually the one organising whatever we're doing. It's rarely just sitting around: hosting nights at my apartment, planning group dinners, coffee runs, getting everyone together for a weekend road trip. Even if it's low-key like studying or watching a movie, I started the group chat, picked the time and made sure everyone knew they were invited. Being with people by choice means creating a space where everyone feels included, comfortable and actually connected.",
      d5_q1: "Moving through middle school with braces, bad skin and glasses, and having the popular girls turn me into an easy target — it knocked my confidence flat, but it built the part of me that makes sure no one sits alone or gets left out of the group chat. Stepping up as drum major and track captain, where I wasn't just managing my own stress but keeping forty other people on time, on beat and working together; it taught me to lead and stay composed even when my own mind was spinning. And moving away to college and building a friend group from scratch, without my childhood best friends and family right down the hall — it proved I could build community wherever I go, even though the anxiety of starting over terrified me.",
      d5_q2: "In middle school I had zero control over how I looked or how people treated me, and it made me feel completely isolated. After that I took control the only way I knew how — by becoming hyper-reliable, running until I was exhausted, and stepping up as a leader so people actually needed me. Everything I do — organising plans, running, keeping the group together — is me trying to stay grounded and make sure I'm never on the outside looking in again.",
    },
    factorResults: {
      1: "Mary’s shadow was formed by being made an easy target in middle school for her acne, braces and glasses. She looks unshakable, while hiding how anxious she is and a fear of ending up alone.",
      2: "Her recurring enemy is overthinking that turns into spiralling — worst when she is stressed or juggling too much, escalating a small silence into a catastrophe.",
      3: "Her strongest assets are speed and endurance built by outrunning the urge to quit, and an effortless gift for organising people and making sure nobody is left out.",
      4: "She recharges alone through running, drawing and journalling, and by choice she is the one hosting, planning and inviting everyone in.",
      5: "Her life pattern is turning early exclusion into control: hyper-reliability, hard running and leadership so she is never on the outside looking in again.",
    },
  },
};

export const DEMONSTRATION_CHARACTER_IDS = Object.keys(
  DEMONSTRATION_CHARACTERS,
) as DemonstrationCharacterId[];

export function assessmentFor(id: DemonstrationCharacterId): DemonstrationProfile {
  return DEMONSTRATION_CHARACTERS[id];
}

export function validateDemonstrationAnswers(): string[] {
  const questionKeys = AVATAR_DIMENSIONS.flatMap((dimension) =>
    dimension.questions.map((question) => question.key),
  );
  return DEMONSTRATION_CHARACTER_IDS.flatMap((id) => {
    const character = DEMONSTRATION_CHARACTERS[id];
    return questionKeys
      .filter((key) => !character.answers[key]?.trim())
      .map((key) => `${character.name} is missing ${key}`);
  });
}

export function demonstrationType(id: DemonstrationCharacterId): string {
  return personalityFor(id)?.type ?? "Illustrative profile";
}