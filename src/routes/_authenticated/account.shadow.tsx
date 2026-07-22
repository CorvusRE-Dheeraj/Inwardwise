import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadShadow, saveShadow, shadowDefaults, type ShadowProfile } from "@/lib/profile-storage";

export const Route = createFileRoute("/_authenticated/account/shadow")({
  component: ShadowPage,
});

function ShadowPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [form, setForm] = useState<ShadowProfile>(shadowDefaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      setForm(loadShadow(data.user.id));
    });
  }, []);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    saveShadow(uid, form);
    setSaved(true);
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Shadow</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Your Shadow carries who you were growing up. Show it love and acceptance — the traits you
        identify here define your personality in a way, and can change over time.
      </p>

      <form onSubmit={onSave} className="mt-8 grid max-w-xl gap-4">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Shadow avatar (emoji or short symbol)</span>
          <input value={form.avatar} onChange={(e) => { setForm({ ...form, avatar: e.target.value }); setSaved(false); }} className="input w-24 text-center text-2xl" maxLength={4} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Shadows that define you</span>
          <textarea
            value={form.traits}
            onChange={(e) => { setForm({ ...form, traits: e.target.value }); setSaved(false); }}
            rows={5}
            className="input"
            placeholder="e.g. The child who needed to be seen, the perfectionist, the caretaker…"
          />
        </label>
        <div className="mt-2 flex items-center gap-3">
          <button className="rounded-full bg-foreground px-5 py-2 text-sm text-background">Save changes</button>
          {saved && <span className="text-xs text-accent">Saved locally.</span>}
        </div>
      </form>
      <style>{`.input{width:100%;border-radius:.75rem;border:1px solid hsl(var(--glass-border,0 0% 100% / .12));background:hsl(var(--background)/.4);padding:.625rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:hsl(var(--accent))}`}</style>
    </div>
  );
}
