import { afterEach, describe, expect, it, vi } from "vitest";
import { suggestSongsFor, type FallbackReason } from "../../supabase/functions/_shared/songs.ts";

function reply(content: string, status = 200) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });
}

async function run(fetchImpl: () => Promise<Response>, apiKey: string | null = "key") {
  vi.stubGlobal("fetch", vi.fn(fetchImpl));
  const reasons: FallbackReason[] = [];
  const res = await suggestSongsFor("discover", "Sad", "A long day at work.", null, {
    apiKey,
    onFallback: (r) => reasons.push(r),
  });
  return { res, reasons };
}

afterEach(() => vi.unstubAllGlobals());

describe("suggestSongsFor", () => {
  it("returns AI songs when the gateway answers", async () => {
    const { res, reasons } = await run(async () =>
      reply(
        '```json\n{"songs":[{"title":"Fix You","artist":"Coldplay","why":"For a heavy day."}]}\n```',
      ),
    );
    expect(res.source).toBe("ai");
    expect(res.songs[0]).toMatchObject({ title: "Fix You", artist: "Coldplay" });
    expect(reasons).toEqual([]);
  });

  it("sends the request to the configured gateway with the key", async () => {
    const fetchMock = vi.fn(async () => reply('{"songs":[]}'));
    vi.stubGlobal("fetch", fetchMock);
    await suggestSongsFor("discover", "Sad", "note", null, {
      apiKey: "secret",
      baseUrl: "https://gw.example/v1",
      model: "m",
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://gw.example/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret");
    expect(JSON.parse(init.body as string).model).toBe("m");
  });

  it.each<[string, () => Promise<Response>, string | null, FallbackReason]>([
    ["no key", async () => reply("{}"), null, "no_key"],
    ["out of credits", async () => reply("", 402), "key", "http_402"],
    ["rate limited", async () => reply("", 429), "key", "http_429"],
    ["unparseable reply", async () => reply("Here are some songs!"), "key", "bad_reply"],
    ["no usable songs", async () => reply('{"songs":[{"title":"X"}]}'), "key", "no_songs"],
    [
      "network error",
      async () => {
        throw new TypeError("fetch failed");
      },
      "key",
      "network",
    ],
  ])("falls back to picks and reports why: %s", async (_name, impl, key, reason) => {
    const { res, reasons } = await run(impl, key);
    expect(res.source).toBe("picks");
    expect(res.songs.length).toBeGreaterThanOrEqual(3);
    expect(reasons).toEqual([reason]);
  });
});

describe("suggestSongsFor error details", () => {
  it("passes the provider's error message to onFallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              { error: { code: 404, message: "models/google/gemini-2.5-flash is not found" } },
            ]),
            { status: 404 },
          ),
      ),
    );
    const calls: Array<[string, string | undefined]> = [];
    await suggestSongsFor("discover", "Sad", "A long day at work.", null, {
      apiKey: "k",
      onFallback: (r, d) => calls.push([r, d]),
    });
    expect(calls).toEqual([["http_404", "models/google/gemini-2.5-flash is not found"]]);
  });
});

describe("suggestSongsFor time limit", () => {
  it("gives up after the timeout and returns the picks", async () => {
    // A provider that never answers until the request is aborted.
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")),
            );
          }),
      ),
    );
    const reasons: string[] = [];
    const started = Date.now();
    const res = await suggestSongsFor("discover", "Sad", "A long day at work.", null, {
      apiKey: "k",
      timeoutMs: 50,
      onFallback: (r) => reasons.push(r),
    });
    expect(res.source).toBe("picks");
    expect(reasons).toEqual(["timeout"]);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it("sends provider-specific fields like reasoning_effort", async () => {
    const fetchMock = vi.fn(async () => reply('{"songs":[]}'));
    vi.stubGlobal("fetch", fetchMock);
    await suggestSongsFor("discover", "Sad", "note", null, {
      apiKey: "k",
      extraBody: { reasoning_effort: "low" },
    });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string).reasoning_effort).toBe("low");
  });
});

describe("suggestSongsFor retries when the model is busy", () => {
  it("retries once after a 503 and returns AI songs", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(
        reply('{"songs":[{"title":"Fix You","artist":"Coldplay","why":"x"}]}'),
      );
    vi.stubGlobal("fetch", fetchMock);
    const res = await suggestSongsFor("discover", "Sad", "note", null, {
      apiKey: "k",
      retryDelayMs: 1,
    });
    expect(res.source).toBe("ai");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses the backup model on the retry when one is set", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(reply('{"songs":[]}'));
    vi.stubGlobal("fetch", fetchMock);
    await suggestSongsFor("discover", "Sad", "note", null, {
      apiKey: "k",
      model: "main",
      fallbackModel: "backup",
      retryDelayMs: 1,
    });
    const models = fetchMock.mock.calls.map(
      (c) => JSON.parse((c[1] as RequestInit).body as string).model,
    );
    expect(models).toEqual(["main", "backup"]);
  });

  it("falls back to picks if still busy after the retry, with Google's message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { message: "high demand" } }), { status: 503 }),
      ),
    );
    const calls: Array<[string, string | undefined]> = [];
    const res = await suggestSongsFor("discover", "Sad", "note", null, {
      apiKey: "k",
      retryDelayMs: 1,
      onFallback: (r, d) => calls.push([r, d]),
    });
    expect(res.source).toBe("picks");
    expect(calls).toEqual([["http_503", "high demand"]]);
  });

  it("does not retry errors that won't fix themselves, like a bad key", async () => {
    const fetchMock = vi.fn(async () => new Response("bad key", { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);
    await suggestSongsFor("discover", "Sad", "note", null, { apiKey: "k", retryDelayMs: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
