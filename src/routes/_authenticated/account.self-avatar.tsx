import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadSelfAvatar, saveSelfAvatar, selfAvatarDefaults, type SelfAvatar } from "@/lib/profile-storage";

export const Route = createFileRoute("/_authenticated/account/self-avatar")({
  component: SelfAvatarPage,
});

function SelfAvatarPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [form, setForm] = useState<SelfAvatar>(selfAvatarDefaults);
  const [saved, setSaved] = useState(false);

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
    { label: "Dimension 1", key: "dimension1" as const, x: 50, y: 2 },
    { label: "Dimension 2", key: "dimension2" as const, x: 95, y: 35 },
    { label: "Dimension 3", key: "dimension3" as const, x: 78, y: 96 },
    { label: "Dimension 4", key: "dimension4" as const, x: 22, y: 96 },
    { label: "Dimension 5", key: "dimension5" as const, x: 5, y: 35 },
  ];

  const starPoints = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 46 : 18;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <div>
      <h1 className="font-display text-3xl">Self Avatar</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Your Self Avatar is a truthful, evolving representation of your inner self. Define the five dimensions that shape it so your AI can reflect you back to you.
      </p>

      <form onSubmit={onSave} className="mt-8 grid gap-4 max-w-xl">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Avatar symbol (emoji or short text)</span>
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
                fill="#000000"
                style={{ fontSize: 6.5, fontWeight: 700 }}
              >
                Self Avatar
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
            The Self Avatar and its five dimensions
          </p>
        </div>

        {dims.map((d) => (
          <label key={d.key} className="block">
            <span className="mb-1 block text-xs text-muted-foreground">{d.label}</span>
            <input
              value={form[d.key]}
              onChange={(e) => update(d.key, e.target.value)}
              className="input"
              placeholder={`What defines ${d.label.toLowerCase()} of you?`}
            />
          </label>
        ))}

        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Private note</span>
          <textarea
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            rows={4}
            className="input"
            placeholder="Anything else your Self Avatar should know about you..."
          />
        </label>

        <div className="mt-2 flex items-center gap-3">
          <button className="rounded-full bg-foreground px-5 py-2 text-sm text-background">Save changes</button>
          {saved && <span className="text-xs text-accent">Saved locally.</span>}
        </div>
      </form>

      <style>{`
        .input { width:100%; border-radius:0.75rem; border:1px solid hsl(var(--glass-border, 0 0% 100% / 0.12)); background: hsl(var(--background) / 0.4); padding: 0.625rem 0.75rem; font-size: 0.875rem; outline:none; }
        .input:focus { border-color: hsl(var(--accent)); }
      `}</style>
    </div>
  );
}
