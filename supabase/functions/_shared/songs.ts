// Connect Music song suggestions: the AI prompt, the reply parsing and the
// fallback picks. Links are never taken from the model; the page builds search
// links itself. Runs in the music-suggest Edge Function; the API key is passed
// in so this file stays free of runtime-specific globals.

import { FEELINGS, cleanSong, type MusicMode, type Song } from "./music.ts";

/** Well-known songs used when the AI is unavailable, so the page still helps. */
const PICKS: Record<string, Song[]> = {
  Calm: [
    {
      title: "Weightless",
      artist: "Marconi Union",
      why: "A slow, steady pulse that helps your breathing settle.",
    },
    {
      title: "Clair de Lune",
      artist: "Claude Debussy",
      why: "Soft and unhurried, it gives your mind somewhere quiet to rest.",
    },
    {
      title: "Here Comes the Sun",
      artist: "The Beatles",
      why: "Gentle and warm, it keeps the calm light rather than heavy.",
    },
  ],
  Anxious: [
    {
      title: "Weightless",
      artist: "Marconi Union",
      why: "Its slowing rhythm is made to bring a racing body down a gear.",
    },
    {
      title: "Three Little Birds",
      artist: "Bob Marley & The Wailers",
      why: "A simple reminder, sung softly, that this moment will pass.",
    },
    {
      title: "Let It Be",
      artist: "The Beatles",
      why: "It gives permission to stop fighting what you cannot control tonight.",
    },
  ],
  Sad: [
    {
      title: "Fix You",
      artist: "Coldplay",
      why: "It sits with the hurt first, then slowly lifts, without rushing you.",
    },
    {
      title: "Everybody Hurts",
      artist: "R.E.M.",
      why: "It says plainly that you are not the only one feeling this.",
    },
    {
      title: "The Night We Met",
      artist: "Lord Huron",
      why: "Room to feel the loss fully, which is often what sadness asks for.",
    },
  ],
  Lonely: [
    {
      title: "You've Got a Friend",
      artist: "Carole King",
      why: "A warm voice promising someone will come when you call.",
    },
    {
      title: "Lean on Me",
      artist: "Bill Withers",
      why: "It reminds you that needing people is ordinary, not weak.",
    },
    {
      title: "Count on Me",
      artist: "Bruno Mars",
      why: "Light and kind, it points you back towards the people who would show up.",
    },
  ],
  Hopeful: [
    {
      title: "Here Comes the Sun",
      artist: "The Beatles",
      why: "The feeling of something turning, after a long cold stretch.",
    },
    {
      title: "Rise Up",
      artist: "Andra Day",
      why: "It gives hope a steady, patient strength rather than a rush.",
    },
    {
      title: "Unwritten",
      artist: "Natasha Bedingfield",
      why: "A reminder that the next page is still yours to write.",
    },
  ],
  Grateful: [
    {
      title: "What a Wonderful World",
      artist: "Louis Armstrong",
      why: "It slows you down to notice the ordinary good around you.",
    },
    {
      title: "Thank You",
      artist: "Dido",
      why: "Gratitude for the people who make the hard days bearable.",
    },
    {
      title: "Beautiful Day",
      artist: "U2",
      why: "It turns thankfulness outward, into energy for the day.",
    },
  ],
  Angry: [
    {
      title: "Stronger",
      artist: "Kelly Clarkson",
      why: "It channels the heat into standing taller rather than lashing out.",
    },
    {
      title: "Breathin",
      artist: "Ariana Grande",
      why: "A reminder to keep breathing while the feeling moves through you.",
    },
    {
      title: "Shake It Off",
      artist: "Taylor Swift",
      why: "Lets the energy out through your body instead of your words.",
    },
  ],
  Tired: [
    { title: "Holocene", artist: "Bon Iver", why: "Quiet and spacious, it asks nothing of you." },
    {
      title: "Banana Pancakes",
      artist: "Jack Johnson",
      why: "An easy, slow-morning song that makes rest feel allowed.",
    },
    {
      title: "Weightless",
      artist: "Marconi Union",
      why: "Helps a worn-out body let go of the day.",
    },
  ],
  Energised: [
    {
      title: "Don't Stop Me Now",
      artist: "Queen",
      why: "Pure momentum, for when you want to ride the feeling.",
    },
    {
      title: "Happy",
      artist: "Pharrell Williams",
      why: "Bright and easy to move to, it keeps the good energy going.",
    },
    {
      title: "Walking on Sunshine",
      artist: "Katrina and the Waves",
      why: "Joy you can feel in your step.",
    },
  ],
  "In love": [
    {
      title: "At Last",
      artist: "Etta James",
      why: "The relief and wonder of finally finding someone.",
    },
    {
      title: "Perfect",
      artist: "Ed Sheeran",
      why: "Tender and simple, the way new closeness feels.",
    },
    {
      title: "Thinking Out Loud",
      artist: "Ed Sheeran",
      why: "About love that plans to stay, not just arrive.",
    },
  ],
};

export type SongSuggestions = { songs: Song[]; source: "ai" | "picks" };

/** A gentle mix, used when no feeling was given (suggestions from the Self alone). */
const GENERAL_PICKS: Song[] = [
  PICKS["Hopeful"]![0]!,
  PICKS["Calm"]![1]!,
  PICKS["Grateful"]![0]!,
  PICKS["Sad"]![0]!,
];

function fallback(feeling: string | null): SongSuggestions {
  if (!feeling) return { songs: GENERAL_PICKS, source: "picks" };
  return { songs: PICKS[feeling] ?? PICKS["Calm"]!, source: "picks" };
}

/** What the songs should do, for each mode. */
const MODE_BRIEF: Record<MusicMode, string> = {
  discover:
    "Mode DISCOVER: they want music for their mood. Choose songs that meet the mood and, where it helps, gently lift it.",
  express:
    "Mode EXPRESS: they want a song to say something they cannot put into words. Choose songs whose lyrics speak to the situation they describe. " +
    '"why" names what the song says on their behalf.',
  share:
    "Mode SHARE: they want to send a song to someone. Choose songs suitable to send to the person they describe, kind and never awkward to receive. " +
    '"why" says what the song would tell that person.',
  reflect:
    "Mode REFLECT: they want a song to sit with and then write about. Choose songs that invite quiet reflection on what they describe. " +
    '"why" says what the song may help them notice.',
};

/** How the member's own Self Journey should shape the choice, when shared. */
const SELF_BRIEF =
  "They also shared parts of their private Self Journey (below, under WHO THEY ARE). Use it to choose songs that resonate with their life: " +
  "match the language, culture, faith and era they come from, and the themes of the moments that shaped them. " +
  "Prefer songs in the language or tradition they grew up with when it fits, alongside well-known songs. " +
  'In "why", you may gently name the theme a song touches (e.g. "the distance you described with your father"), ' +
  "but never quote their answers, never repeat private details, and never mention that you read a profile.";

/** When they share only their Self: no feeling, no note. */
const SELF_ONLY_BRIEF =
  "They did not say how they feel today. Choose songs purely from who they are: songs that would mean something to them " +
  "given their life, taste, culture, faith and era — a mix of comforting and uplifting. " +
  '"why" says why this song fits them, not a mood.';

export type SongMessages = Array<{ role: "system" | "user"; content: string }>;

/** The messages sent to the AI for one suggestion request. */
export function buildSongMessages(
  mode: MusicMode,
  feeling: string | null,
  note: string,
  selfProfile?: string | null,
): SongMessages {
  const self = selfProfile?.trim();
  const selfOnly = !!self && !feeling;
  return [
    {
      role: "system",
      content:
        "You are Connect Music. Someone tells you how they feel. Suggest exactly 4 real, published songs that fit this moment. " +
        "Only name songs you are certain exist, with the correct artist. Never invent songs, never include links. " +
        "Prefer songs that meet the feeling gently and help, never songs that glorify self-harm. " +
        '"why" is one warm, plain sentence in the second person saying why this song fits what they feel. ' +
        (feeling ? `The feeling is one of: ${FEELINGS.join(", ")}. ` : "") +
        (selfOnly ? `${SELF_ONLY_BRIEF} ` : `${MODE_BRIEF[mode]} `) +
        (self ? `${SELF_BRIEF} ` : "") +
        'Reply with JSON only: {"songs":[{"title":"...","artist":"...","why":"..."}]}',
    },
    {
      role: "user",
      content:
        `Feeling: ${feeling ?? "(not given — choose from who they are)"}\nWhat is on their mind: ${note.trim() ? note.slice(0, 1000) : "(not written — rely on their feeling and who they are)"}` +
        (self
          ? `\n\nWHO THEY ARE (private, from their own Self Journey):\n${self.slice(0, 3500)}`
          : ""),
    },
  ];
}

/** Why a request got the fallback picks instead of AI songs. Never includes user text. */
export type FallbackReason =
  "no_key" | `http_${number}` | "bad_reply" | "no_songs" | "network" | "timeout";

/** Temporary provider errors worth one retry: overloaded, rate-limited, hiccup. */
const BUSY = new Set([429, 500, 503]);

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    });
  });
}

/** Long enough for a good answer; short enough that nobody stares at "Finding songs…". */
export const SUGGEST_TIMEOUT_MS = 20_000;

export type SuggestOptions = {
  apiKey?: string | null;
  baseUrl?: string;
  model?: string;
  /** Tried on the retry when the main model is overloaded (503) or rate-limited (429). */
  fallbackModel?: string;
  retryDelayMs?: number;
  /** Extra provider-specific request fields, e.g. { reasoning_effort: "low" }. */
  extraBody?: Record<string, unknown>;
  timeoutMs?: number;
  /** `detail` is the provider's own error message, never the member's text. */
  onFallback?: (reason: FallbackReason, detail?: string) => void;
};

/** The provider's error message from a failed response, e.g. "models/x is not found". */
async function providerError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const body = JSON.parse(text) as unknown;
    const err = (Array.isArray(body) ? body[0] : body) as { error?: { message?: string } };
    if (err?.error?.message) return err.error.message.slice(0, 300);
  } catch {
    // Not JSON; fall through.
  }
  return text.slice(0, 300);
}

export async function suggestSongsFor(
  mode: MusicMode,
  feeling: string | null,
  note: string,
  selfProfile?: string | null,
  options: SuggestOptions = {},
): Promise<SongSuggestions> {
  const {
    apiKey,
    baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai",
    model = "gemini-3.8-flash",
    fallbackModel,
    extraBody = {},
    timeoutMs = SUGGEST_TIMEOUT_MS,
    retryDelayMs = 1500,
    onFallback,
  } = options;
  const fall = (reason: FallbackReason, detail?: string) => {
    onFallback?.(reason, detail);
    return fallback(feeling);
  };
  if (!apiKey) return fall("no_key");
  // One deadline for the whole exchange, including reading the reply.
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(), timeoutMs);
  try {
    return await ask();
  } finally {
    clearTimeout(timer);
  }

  function request(withModel: string): Promise<Response> {
    return fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...extraBody,
        model: withModel,
        messages: buildSongMessages(mode, feeling, note, selfProfile),
      }),
      signal: deadline.signal,
    });
  }

  async function ask(): Promise<SongSuggestions> {
    let res: Response;
    try {
      res = await request(model);
      // Overloaded or rate-limited: usually gone within seconds. Retry once,
      // on the backup model if one is set, still within the same deadline.
      if (BUSY.has(res.status)) {
        await res.body?.cancel();
        await sleep(retryDelayMs, deadline.signal);
        res = await request(fallbackModel ?? model);
      }
    } catch {
      return fall(deadline.signal.aborted ? "timeout" : "network");
    }
    if (!res.ok) return fall(`http_${res.status}`, await providerError(res));
    let parsed: { songs?: Array<Partial<Song>> };
    try {
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw = (json.choices?.[0]?.message?.content ?? "")
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/i, "")
        .trim();
      parsed = JSON.parse(raw) as { songs?: Array<Partial<Song>> };
    } catch {
      return fall(deadline.signal.aborted ? "timeout" : "bad_reply");
    }
    const songs = (parsed.songs ?? [])
      .map((s) =>
        cleanSong({
          title: String(s.title ?? ""),
          artist: String(s.artist ?? ""),
          why: s.why ? String(s.why) : null,
        }),
      )
      .filter((s): s is Song => !!s && !!s.artist)
      .slice(0, 5);
    return songs.length > 0 ? { songs, source: "ai" } : fall("no_songs");
  }
}
