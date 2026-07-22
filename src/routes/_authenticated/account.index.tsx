import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadPersonal, personalDefaults, savePersonal, type PersonalDetails } from "@/lib/profile-storage";

export const Route = createFileRoute("/_authenticated/account/")({
  component: PersonalDetailsPage,
});

function PersonalDetailsPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [form, setForm] = useState<PersonalDetails>(personalDefaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setUid(u.id);
      setEmail(u.email ?? "");
      setForm(loadPersonal(u.id));
    });
  }, []);

  function update<K extends keyof PersonalDetails>(k: K, v: PersonalDetails[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    savePersonal(uid, form);
    setSaved(true);
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Personal details</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A personal connection between your <em>Shadow</em> and <em>Inner Enemy</em> is established here.
      </p>

      <form onSubmit={onSave} className="mt-8 grid gap-4 max-w-xl">
        <Field label="Email"><input value={email} disabled className="input opacity-70" /></Field>
        <Field label="Name">
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className="input" placeholder="Your name" />
        </Field>
        <Field label="Phone (for personal text with your Self-AI, optional)">
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" placeholder="+1 555 000 0000" />
        </Field>

        <Toggle
          label="Allow my Self to reach out to me"
          desc="Occasional check-ins when your Self-AI feels you need one."
          value={form.reachOutEnabled}
          onChange={(v) => update("reachOutEnabled", v)}
        />
        <Toggle
          label="Email me insights"
          desc="Session summaries and reminders."
          value={form.emailEnabled}
          onChange={(v) => update("emailEnabled", v)}
        />

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="glass flex items-start justify-between gap-4 rounded-2xl px-4 py-3 text-left">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
      <span className={`mt-1 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${value ? "bg-accent" : "bg-foreground/15"}`}>
        <span className={`h-4 w-4 rounded-full bg-background transition ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
