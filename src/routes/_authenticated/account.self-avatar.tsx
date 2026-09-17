import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductName } from "@/components/products/ProductChrome";
import { loadSelfAvatar, saveSelfAvatar, selfAvatarDefaults, type SelfAvatar } from "@/lib/profile-storage";

export const Route = createFileRoute("/_authenticated/account/self-avatar")({
  component: SelfAvatarPage,
});

function SelfAvatarPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [form, setForm] = useState<SelfAvatar>(selfAvatarDefaults);
  const navigate = useNavigate();


  

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      setForm(loadSelfAvatar(data.user.id));
    });
  }, []);

  function update<K extends keyof SelfAvatar>(k: K, v: SelfAvatar[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    saveSelfAvatar(uid, form);
    setSaved(true);
  }

  const dims = [
    { label: "Factor 1", key: "dimension1" as const, x: 50, y: 2 },
    { label: "Factor 2", key: "dimension2" as const, x: 95, y: 35 },
    { label: "Factor 3", key: "dimension3" as const, x: 78, y: 96 },
    { label: "Factor 4", key: "dimension4" as const, x: 22, y: 96 },
    { label: "Factor 5", key: "dimension5" as const, x: 5, y: 35 },
  ];

  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 46 : 18;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <div>
      <h1 className="font-display text-3xl"><ProductName id="self" /> Design</h1>

      <div className="mt-4 max-w-2xl space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          Your inner <ProductName id="self" /> is a unique representation of you psychologically. But it&apos;s built from first
          principles that shaped you and will shape you based on future actions. Our unique approach does
          not classify you and use those attributes to build your <ProductName id="self" />. That would not be unique, nor
          a true representation of you, especially when you get triggered by certain things. Listing you
          via classification would not be an inner representation.
        </p>
        <p>
          For countless years the founder of the company asked this question as a physicist: are there
          first principles that can define a human being? He did not just look into psychology research,
          because that is very limiting. Instead he used his physics-based approach of things that need
          to be built from first principles. So he developed this approach to help you build your <ProductName id="self" />.
        </p>
        <p>
          For additional background information on the <ProductName id="self" /> model{" "}
          <Link to="/areas/$slug" params={{ slug: "individual-development" }} className="underline underline-offset-4 hover:text-accent">
            click here
          </Link>
          .
        </p>
        <p>
          In order to build your <ProductName id="self" /> you have to answer a series of questions in each of the 5 factors.
          This is a laborious process, and you really have to dig deeper in answering these questions. Set
          aside time and do this for each factor so you get an <ProductName id="self" /> that is accurate. You only have to
          do this once; the <ProductName id="self" /> will keep updating itself over time so it stays a representation of the
          current you. You can always review your answers and change them to revise your <ProductName id="self" />.
        </p>
      </div>

      <form onSubmit={onSave} className="mt-10 grid gap-4 max-w-2xl">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground"><ProductName id="self" /> symbol (emoji or short text)</span>
          <input
            value={form.avatar}
            onChange={(e) => update("avatar", e.target.value)}
            className="input w-24 text-center text-2xl"
            maxLength={4}
          />
        </label>

        <div className="glass rounded-3xl p-6">
          <div className="mx-auto max-w-xs">
            <svg viewBox="-15 -10 130 120" className="h-auto w-full">
              <polygon points={starPoints} fill="#D9D9D9" stroke="#BFBFBF" strokeWidth="0.6" />
              <text
                x="50"
                y="52"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 6.5, fontWeight: 700 }}
              >
                <tspan x="50" dy="-2" fill="#000000">InwardWise</tspan>
                <tspan x="50" dy="7" fill="#2563EB">Self</tspan>
              </text>
              {dims.map((d) => (
                <text
                  key={d.label}
                  x={d.x}
                  y={d.y}
                  textAnchor="middle"
                  className="fill-current text-muted-foreground"
                  style={{ fontSize: 4.2 }}
                >
                  {d.label}
                </text>
              ))}
            </svg>
          </div>
          <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
            The <ProductName id="self" /> and its five factors
          </p>
        </div>


        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (uid) saveSelfAvatar(uid, form);
              navigate({ to: "/avatar/dimension/$n", params: { n: "1" } });
            }}
            className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
          >
            Self build
          </button>
        </div>
      </form>

      <style>{`
        .input { width:100%; border-radius:0.75rem; border:1px solid hsl(var(--glass-border, 0 0% 100% / 0.12)); background: hsl(var(--background) / 0.4); padding: 0.625rem 0.75rem; font-size: 0.875rem; outline:none; }
        .input:focus { border-color: hsl(var(--accent)); }
      `}</style>
    </div>
  );
}
