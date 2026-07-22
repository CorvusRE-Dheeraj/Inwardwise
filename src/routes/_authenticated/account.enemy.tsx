import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { enemyDefaults, loadEnemy, saveEnemy, type EnemyProfile } from "@/lib/profile-storage";

export const Route = createFileRoute("/_authenticated/account/enemy")({
  component: EnemyPage,
});

function EnemyPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [form, setForm] = useState<EnemyProfile>(enemyDefaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUid(data.user.id);
      setForm(loadEnemy(data.user.id));
    });
  }, []);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    saveEnemy(uid, form);
    setSaved(true);
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Inner Enemy</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Your Inner Enemy is what pulls you off course — pride, anger, jealousy, fear. Name it, so
        you can watch it and choose against it.
      </p>

      <form onSubmit={onSave} className="mt-8 grid max-w-xl gap-4">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Enemy avatar (emoji or short symbol)</span>
          <input value={form.avatar} onChange={(e) => { setForm({ ...form, avatar: e.target.value }); setSaved(false); }} className="input w-24 text-center text-2xl" maxLength={4} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Inner enemies that control you</span>
          <textarea
            value={form.traits}
            onChange={(e) => { setForm({ ...form, traits: e.target.value }); setSaved(false); }}
            rows={5}
            className="input"
            placeholder="e.g. Ego, Narcissism, Anger, Jealousy, Fear of missing out…"
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
