import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Lock, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AVATAR_DIMENSIONS } from "@/lib/avatar-factors";
import { SELF_JOURNEY } from "@/lib/self-journey";
import { SelfJourneyIntro } from "@/components/avatar/SelfJourneyIntro";
import { useAvatarVault } from "@/lib/avatar-vault";
import { Caution, PinKeypad } from "@/components/avatar/PinKeypad";
import { AvatarPortrait } from "@/components/avatar/AvatarPortrait";
import { ProductName } from "@/components/products/ProductChrome";


export const Route = createFileRoute("/_authenticated/avatar/")({
  head: () => ({
    meta: [
      { title: "InwardWise Self Design, InwardWise" },
      {
        name: "description",
        content:
          "Build your Self Avatar through a guided five-stage conversation, private, encrypted, and yours alone.",
      },
      { property: "og:title", content: "InwardWise Self Design, InwardWise" },
      { property: "og:description", content: "Five stages. One inner mirror." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AvatarDashboard,
});

function AvatarDashboard() {
  const vault = useAvatarVault();
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [voice, setVoice] = useState(false);
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState("");
  const [savedNote, setSavedNote] = useState<ReactNode | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    if (!vault.profile) return;
    setVoice(vault.profile.voice_enabled);
    setPhone(vault.profile.phone_number ?? "");
    setWhen(vault.profile.scheduled_call_at?.slice(0, 16) ?? "");
    supabase
      .from("avatar_dimensions")
      .select("dimension_number, progress_pct")
      .eq("user_id", vault.profile.user_id)
      .then(({ data }) => {
        const map: Record<number, number> = {};
        (data ?? []).forEach((r) => {
          map[r.dimension_number] = r.progress_pct;
        });
        setProgress(map);
      });
  }, [vault.profile]);

  async function saveVoice() {
    if (!vault.profile) return;
    await supabase
      .from("avatar_profiles")
      .update({
        voice_enabled: voice,
        phone_number: phone || null,
        scheduled_call_at: when ? new Date(when).toISOString() : null,
      })
      .eq("user_id", vault.profile.user_id);
    setSavedNote(<>Saved. Your <ProductName id="self" /> will call at the time you chose.</>);
    setTimeout(() => setSavedNote(null), 4000);
  }

  const completedStages = AVATAR_DIMENSIONS.filter((d) => (progress[d.n] ?? 0) >= 100).map(
    (d) => d.n,
  );
  const complete = completedStages.length;

  return (
    <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 sm:py-20">
      <Link
        to="/"
        className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)] transition hover:text-[color:var(--ink)]"
      >
        ← Home
      </Link>

      <header className="mt-8 max-w-3xl">
        <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
          § 01 · <ProductName id="self" /> Design Dashboard
        </div>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.02] tracking-tight">
          Design Your <span className="italic text-[color:var(--royal)]">Inner <ProductName id="self" /></span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[color:var(--muted-foreground)]">
          A digital representation of you, built through a guided conversation across five stages.
          There are no right or wrong answers; share only what you are comfortable sharing.
        </p>
      </header>

      {vault.status === "needs-setup" || vault.status === "locked" ? (
        <section className="mt-12 grid gap-8 md:grid-cols-2">
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
            This 4-digit PIN is separate from your sign-in and encrypts your Self Journey answers.
            There is no recovery: if you lose it, the answers cannot be retrieved, not by us,
            not by an administrator. You may permanently self-destruct your <ProductName id="self" /> data at any
            time, and data auto-purges after twelve months of account inactivity.
          </Caution>
        </section>
      ) : null}

      {vault.status === "unlocked" && (
        <>
          <section className="mt-12 grid gap-6 md:grid-cols-[320px_1fr]">
            <AvatarPortrait
              userId={vault.profile!.user_id}
              complete={complete}
              total={AVATAR_DIMENSIONS.length}
            />


            <div className="rounded-lg border border-[color:var(--rule)] p-8">
              <div className="font-mono-cap flex items-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
                <Phone className="h-3 w-3" /> Calendar Scheduling for Voice Build
              </div>
              <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                Rather than typing, schedule a call, your <ProductName id="self" /> phones you and takes the
                journey questions conversationally.
              </p>
              <div className="mt-6 space-y-4">
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>Voice enabled</span>
                  <button
                    onClick={() => setVoice((v) => !v)}
                    aria-pressed={voice}
                    className={`h-6 w-11 rounded-full border border-[color:var(--rule)] p-0.5 transition ${
                      voice ? "bg-[color:var(--ink)]" : "bg-transparent"
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full transition ${
                        voice
                          ? "translate-x-5 bg-[color:var(--paper)]"
                          : "bg-[color:var(--muted-foreground)]"
                      }`}
                    />
                  </button>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-[color:var(--muted-foreground)]">
                    Phone number
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-[color:var(--muted-foreground)]">
                    Schedule a call
                  </span>
                  <input
                    type="datetime-local"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className="w-full rounded-md border border-[color:var(--rule)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--royal)]/30"
                  />
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={saveVoice}
                    className="rounded-full bg-[color:var(--ink)] px-5 py-2 text-[13px] text-[color:var(--paper)]"
                  >
                    Save schedule
                  </button>
                  {savedNote && (
                    <span className="text-sm text-[color:var(--royal)]">{savedNote}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14">
            <SelfJourneyIntro
              completed={completedStages}
              nextStage={
                SELF_JOURNEY.find((s) => !completedStages.includes(s.n))?.n ?? SELF_JOURNEY[0].n
              }
            />
          </section>

          <section className="mt-14">
            <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
              § 02 · Your Self Journey
            </div>
            <div className="mt-6 border-t border-[color:var(--rule)]">
              {SELF_JOURNEY.map((s, i) => {
                const pct = progress[s.n] ?? 0;
                return (
                  <Link
                    key={s.n}
                    to="/avatar/dimension/$n"
                    params={{ n: String(s.n) }}
                    className="group grid gap-3 border-b border-[color:var(--rule)] py-6 transition hover:bg-[color:var(--ink)]/[0.02] sm:grid-cols-[110px_1fr_200px] sm:items-center"
                  >
                    <span className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
                      Stage {i + 1} of {SELF_JOURNEY.length}
                    </span>
                    <div>
                      <div className="font-display text-2xl">
                        <span className="italic text-[color:var(--royal)]">{s.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{s.blurb}</p>
                    </div>
                    <div>
                      <div className="h-px w-full bg-[color:var(--rule)]">
                        <div
                          className="h-px bg-[color:var(--ink)] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="font-mono-cap mt-2 text-[10px] text-[color:var(--muted-foreground)]">
                        {pct >= 100 ? "Complete" : pct > 0 ? "In progress" : "Not started"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Caution>
                Your Self becomes richer the more of the journey you complete, partial answers
                produce partial reflections. If typing is the obstacle, turn on voice and schedule
                times when you can take a phone call; your <ProductName id="self" /> will call you and
                continue the conversation with you.
              </Caution>


              <div className="rounded-lg border border-[color:var(--rule)] p-5">
                <div className="font-mono-cap mb-2 text-[10px] text-[color:var(--muted-foreground)]">
                  Your data
                </div>
                <div className="flex flex-wrap gap-3">
                  {complete === AVATAR_DIMENSIONS.length && (
                    <Link
                      to="/avatar/consult"
                      className="rounded-full bg-[color:var(--ink)] px-5 py-2 text-[13px] text-[color:var(--paper)]"
                    >
                      Consult your <ProductName id="self" /> →
                    </Link>
                  )}
                  <Link
                    to="/avatar/library"
                    className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                  >
                    Review, edit or download →
                  </Link>
                  <Link
                    to="/avatar/ask"
                    className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                  >
                    Ask your <ProductName id="self" /> →
                  </Link>
                  <button
                    onClick={vault.lock}
                    className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px]"
                  >
                    Lock <ProductName id="self" />
                  </button>
                  <button
                    onClick={() => setConfirmWipe(true)}
                    className="rounded-full px-5 py-2 text-[13px] text-destructive underline-offset-4 hover:underline"
                  >
                    Self-destruct
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {confirmWipe && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-[color:var(--rule)] bg-[color:var(--paper)] p-8">
            <div className="font-mono-cap text-[10px] text-destructive">Irreversible</div>
            <h2 className="mt-3 font-display text-2xl">Self-destruct your <ProductName id="self" />?</h2>
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              Every answer, every stage, and your PIN will be permanently deleted. This
              cannot be undone or recovered.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  await vault.selfDestruct();
                  setConfirmWipe(false);
                  setProgress({});
                }}
                className="rounded-full bg-destructive px-5 py-2 text-[13px] text-white"
              >
                Delete everything
              </button>
              <button
                onClick={() => setConfirmWipe(false)}
                className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
