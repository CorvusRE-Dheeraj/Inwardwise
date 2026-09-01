import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { synthesizeSpeech } from "@/lib/voice";

export const Route = createFileRoute("/_authenticated/meditation/practice")({
  head: () => ({
    meta: [
      { title: "Mantra Practice — InwardWise" },
      {
        name: "description",
        content:
          "Write your own prayer or intention and repeat it slowly, as many times as you choose.",
      },
      { property: "og:title", content: "Mantra Practice" },
      {
        property: "og:description",
        content: "Write your own prayer or intention and repeat it slowly, as many times as you choose.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MeditationPractice,
});

function MeditationPractice() {
  const vault = useAvatarVault();

  const [mantraText, setMantraText] = useState("");
  const [mantraRepeats, setMantraRepeats] = useState(12);
  const [mantraRunning, setMantraRunning] = useState(false);
  const [mantraCount, setMantraCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  async function speak(text: string) {
    try {
      audioRef.current?.pause();
      const blob = await synthesizeSpeech(text);
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      await audio.play();
    } catch {
      /* silent — the practice works read-only too */
    }
  }

  useEffect(() => {
    if (!mantraRunning) return;
    if (mantraCount >= mantraRepeats) {
      setMantraRunning(false);
      return;
    }
    void speak(mantraText);
    const t = setTimeout(() => setMantraCount((c) => c + 1), 12000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mantraRunning, mantraCount, mantraRepeats, mantraText]);

  function startMantra() {
    if (!mantraText.trim()) return;
    audioRef.current?.pause();
    setMantraCount(0);
    setMantraRunning(true);
  }

  function stopMantra() {
    audioRef.current?.pause();
    setMantraRunning(false);
  }

  if (vault.status === "loading") return <div className="min-h-[60vh]" />;

  if (vault.status !== "unlocked") {
    return (
      <div className="mx-auto grid w-[min(900px,calc(100%-2rem))] gap-8 py-20 md:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--rule)] p-8">
          <PinKeypad
            mode={vault.status === "needs-setup" ? "setup" : "enter"}
            busy={vault.busy}
            error={vault.error}
            onSubmit={(pin) =>
              vault.status === "needs-setup" ? vault.setupPin(pin) : vault.unlock(pin)
            }
          />
        </div>
        <Caution>
          Your mantra practice is built from the answers only you can unlock. They are
          decrypted in your browser and never readable by anyone else.
        </Caution>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[min(980px,calc(100%-2rem))] py-14 md:py-20">
      <Link
        to="/products/calm-mantra"
        className="font-mono-cap text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
      >
        ← Calm &amp; Mantra
      </Link>

      <section className="mt-10 rounded-xl border border-[color:var(--rule)] p-8">
        <span className="font-mono-cap text-[color:var(--royal)]">Your own prayer</span>
        {!mantraRunning ? (
          <>
            <p className="mt-3 max-w-xl text-[color:var(--muted-foreground)]">
              Write a prayer, line or intention in your own words. It will be repeated back to
              you, slowly, as many times as you choose.
            </p>
            <textarea
              value={mantraText}
              onChange={(e) => setMantraText(e.target.value)}
              rows={3}
              placeholder="I am safe, and I let go of what I cannot carry."
              className="mt-5 w-full rounded-lg border border-[color:var(--rule)] bg-transparent p-4 text-base outline-none focus:border-[color:var(--royal)]"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="text-sm text-[color:var(--muted-foreground)]">Repetitions</label>
              <select
                value={mantraRepeats}
                onChange={(e) => setMantraRepeats(Number(e.target.value))}
                className="rounded-full border border-[color:var(--rule)] bg-transparent px-4 py-2 text-sm"
              >
                {[5, 12, 21, 33, 54, 108].map((n) => (
                  <option key={n} value={n}>
                    {n} times
                  </option>
                ))}
              </select>
              <button
                onClick={startMantra}
                disabled={!mantraText.trim()}
                className="rounded-full bg-[color:var(--royal)] px-7 py-3 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Start Mantra
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="font-mono-cap mt-4 text-[color:var(--muted-foreground)]">
              {Math.min(mantraCount + 1, mantraRepeats)} / {mantraRepeats}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={mantraCount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                className="font-display mx-auto mt-6 max-w-2xl text-[clamp(1.4rem,3.2vw,2.2rem)] leading-[1.25] tracking-tight"
              >
                {mantraText}
              </motion.p>
            </AnimatePresence>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => speak(mantraText)}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-sm"
              >
                Speak this line
              </button>
              <button
                onClick={stopMantra}
                className="rounded-full bg-[color:var(--ink)] px-6 py-2.5 text-sm text-[color:var(--paper)]"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
