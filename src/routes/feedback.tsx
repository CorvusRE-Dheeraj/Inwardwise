import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Give Us Feedback — Decision Philosophy" },
      {
        name: "description",
        content:
          "Help us improve the Decision Philosophy framework by sharing your feedback.",
      },
      { property: "og:title", content: "Give Us Feedback — Decision Philosophy" },
      { property: "og:description", content: "Share your feedback on the Decision Philosophy framework." },
    ],
  }),
  component: Feedback,
});

function Feedback() {
  const [answers, setAnswers] = useState({
    name: "",
    improved: "",
    paid: "",
    recommend: "",
    suggestions: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function updateAnswer(key: keyof typeof answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const isComplete = answers.improved && answers.paid && answers.recommend;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || status === "submitting") return;
    setStatus("submitting");
    setErrorMsg(null);
    const { error } = await supabase.from("feedback").insert({
      author_name: answers.name.trim() || null,
      improved: answers.improved,
      paid: answers.paid,
      recommend: answers.recommend,
      suggestions: answers.suggestions.trim() || null,
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }
    setStatus("done");
    setAnswers({ name: "", improved: "", paid: "", recommend: "", suggestions: "" });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Feedback</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Give us feedback</h1>
        <p className="mt-3 text-muted-foreground">
          Your answers help us improve the framework. Submitted feedback appears on the{" "}
          <Link to="/testimonials" className="text-accent hover:underline">
            Testimonials
          </Link>{" "}
          page.
        </p>

        {status === "done" ? (
          <div className="glass-strong mt-8 flex flex-col items-start gap-3 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Thank you — your feedback was submitted.</span>
            </div>
            <p className="text-sm text-muted-foreground">
              It will now show up on the Testimonials page.
            </p>
            <div className="mt-2 flex gap-2">
              <Link
                to="/testimonials"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                View Testimonials
              </Link>
              <button
                onClick={() => setStatus("idle")}
                className="inline-flex items-center gap-2 rounded-full border border-glass-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Submit another
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="glass-strong rounded-2xl p-5">
              <label htmlFor="name" className="font-medium">
                Your name <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={answers.name}
                onChange={(e) => updateAnswer("name", e.target.value)}
                placeholder="How should we credit you?"
                className="mt-3 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <YesNoQuestion
              label="Is the final decision improved from what you originally thought?"
              value={answers.improved}
              onChange={(v) => updateAnswer("improved", v)}
            />
            <YesNoQuestion
              label="Would you use it if it is a paid subscription?"
              value={answers.paid}
              onChange={(v) => updateAnswer("paid", v)}
            />
            <YesNoQuestion
              label="Would you recommend this to others?"
              value={answers.recommend}
              onChange={(v) => updateAnswer("recommend", v)}
            />

            <div className="glass-strong rounded-2xl p-5">
              <label htmlFor="suggestions" className="font-medium">
                Any other suggestions?
              </label>
              <textarea
                id="suggestions"
                rows={4}
                value={answers.suggestions}
                onChange={(e) => updateAnswer("suggestions", e.target.value)}
                placeholder="Tell us anything else you’d like us to know..."
                className="mt-3 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!isComplete || status === "submitting"}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {status === "submitting" ? "Submitting…" : "Submit feedback"}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

function YesNoQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="font-medium">{label}</div>
      <div className="mt-4 flex flex-wrap gap-4">
        {["Yes", "No"].map((option) => {
          const inputId = `${id}-${option.toLowerCase()}`;
          return (
            <label
              key={option}
              htmlFor={inputId}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                value === option
                  ? "border-transparent bg-foreground text-background"
                  : "border-glass-border hover:bg-foreground/5"
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span className="grid h-4 w-4 place-items-center rounded-full border border-current">
                {value === option && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}
