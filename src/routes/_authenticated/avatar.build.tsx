import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  loadProfile,
  saveProfile,
  clearProfile,
  type StoredProfile,
} from "@/lib/avatar-storage";
import { supabase } from "@/integrations/supabase/client";
import {
  getPrivateDimensions,
  savePrivateDimensions,
} from "@/lib/private-dimensions.functions";

export const Route = createFileRoute("/_authenticated/avatar/build")({
  head: () => ({
    meta: [
      { title: "Build your Avatar — Decision Philosophy" },
      {
        name: "description",
        content:
          "Describe your five dimensions to build your inner self avatar.",
      },
      { property: "og:title", content: "Build your Avatar — Decision Philosophy" },
      { property: "og:description", content: "Five dimensions that make up who you are." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuildAvatar,
});

const EMPTY: StoredProfile = {
  name: "",
  skillsTalents: "",
  outerConnections: "",
  lifeExperiences: "",
  updatedAt: 0,
};

function BuildAvatar() {
  const router = useRouter();
  const [profile, setProfile] = useState<StoredProfile>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [shadow, setShadow] = useState("");
  const [enemy, setEnemy] = useState("");
  const [privateLoading, setPrivateLoading] = useState(true);
  const getPrivate = useServerFn(getPrivateDimensions);
  const savePrivate = useServerFn(savePrivateDimensions);

  useEffect(() => {
    const p = loadProfile();
    if (p) setProfile(p);
    setHydrated(true);
    (async () => {
      try {
        const priv = await getPrivate();
        setShadow(priv.shadow);
        setEnemy(priv.enemy);
      } catch {
        /* ignore */
      } finally {
        setPrivateLoading(false);
      }
    })();
  }, [getPrivate]);

  function update<K extends keyof StoredProfile>(k: K, v: StoredProfile[K]) {
    setProfile((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  async function saveAll() {
    const next: StoredProfile = { ...profile, updatedAt: Date.now() };
    saveProfile(next);
    setProfile(next);
    try {
      await savePrivate({ data: { shadow, enemy } });
    } catch (e) {
      console.error(e);
    }
    setSaved(true);
  }

  function reset() {
    if (!confirm("Erase your avatar profile from this device?")) return;
    clearProfile();
    setProfile(EMPTY);
    setSaved(false);
  }

  const inputCls =
    "w-full rounded-md border border-[var(--rule)] bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-royal/40";
  const areaCls = inputCls + " min-h-[140px] resize-y leading-relaxed";

  return (
    <div className="mx-auto max-w-3xl px-6 sm:px-8 py-12 sm:py-20">
      <header className="mb-10">
        <p className="font-mono-cap text-xs text-muted-foreground">The five dimensions</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-medium tracking-tight">
          Describe your inner self.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Write as if only you will read this. There are no right answers — only truer
          ones. Dimensions 1 and 2 are stored privately in your account; the rest lives
          on this device.
        </p>
      </header>

      <div className="space-y-6">
        <Field label="What should your avatar call you?">
          <input
            className={inputCls}
            value={profile.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="A name only your avatar uses"
            disabled={!hydrated}
          />
        </Field>

        <Section
          index="01"
          title="Dimension 1"
          hint="Your first dimension. Write freely and privately — this is stored securely in your account."
        >
          <textarea
            aria-label="Dimension 1"
            className={areaCls}
            value={shadow}
            onChange={(e) => {
              setShadow(e.target.value);
              setSaved(false);
            }}
            placeholder="Write in your own words…"
            disabled={privateLoading}
          />
        </Section>

        <Section
          index="02"
          title="Dimension 2"
          hint="Your second dimension. Stored privately behind sign-in."
        >
          <textarea
            aria-label="Dimension 2"
            className={areaCls}
            value={enemy}
            onChange={(e) => {
              setEnemy(e.target.value);
              setSaved(false);
            }}
            placeholder="Write in your own words…"
            disabled={privateLoading}
          />
        </Section>

        <Section
          index="03"
          title="Dimension 3"
          hint="Your third dimension. Write in your own words."
        >
          <textarea
            aria-label="Dimension 3"
            className={areaCls}
            value={profile.skillsTalents}
            onChange={(e) => update("skillsTalents", e.target.value)}
            placeholder="Write in your own words…"
          />
        </Section>

        <Section
          index="04"
          title="Dimension 4"
          hint="Your fourth dimension. Write in your own words."
        >
          <textarea
            aria-label="Dimension 4"
            className={areaCls}
            value={profile.outerConnections}
            onChange={(e) => update("outerConnections", e.target.value)}
            placeholder="Write in your own words…"
          />
        </Section>

        <Section
          index="05"
          title="Dimension 5"
          hint="Your fifth dimension. Write in your own words."
        >
          <textarea
            aria-label="Dimension 5"
            className={areaCls}
            value={profile.lifeExperiences}
            onChange={(e) => update("lifeExperiences", e.target.value)}
            placeholder="Write in your own words…"
          />
        </Section>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3 rule-top pt-6">
        <button
          onClick={saveAll}
          className="ink-btn rounded-full px-6 py-2.5 text-sm font-medium hover:ink-btn-hover"
        >
          Save avatar
        </button>
        <button
          onClick={() => router.navigate({ to: "/avatar/consult" })}
          className="rounded-full border border-[var(--rule)] px-6 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Consult avatar →
        </button>
        <div className="flex-1" />
        {saved && <span className="text-sm text-royal">Saved.</span>}
        <button
          onClick={reset}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
        >
          Erase local profile
        </button>
      </div>

      <div className="mt-8 text-sm">
        <Link to="/avatar" className="text-muted-foreground hover:text-foreground">
          ← Back to Avatar
        </Link>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Section({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="paper-card rounded-lg p-6">
      <div className="mb-3 flex items-baseline gap-4">
        <span className="font-mono-cap text-xs text-muted-foreground">{index}</span>
        <h2 className="font-serif text-2xl font-medium">{title}</h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}
