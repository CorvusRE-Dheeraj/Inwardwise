import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const FEEDBACK_EMAIL = "feedback@objectivephilosophy.com";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Give Us Feedback — Objective Solution Framework" },
      {
        name: "description",
        content:
          "Help us improve the Objective Solution Framework by sharing your feedback.",
      },
      { property: "og:title", content: "Give Us Feedback — Objective Solution Framework" },
      { property: "og:description", content: "Share your feedback on the Objective Solution Framework." },
    ],
  }),
  component: Feedback,
});

function Feedback() {
  const [answers, setAnswers] = useState({
    improved: "",
    paid: "",
    recommend: "",
    suggestions: "",
  });

  function updateAnswer(key: keyof typeof answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function buildMailto() {
    const subject = encodeURIComponent("Feedback on Objective Solution Framework");
    const body = encodeURIComponent(
      `1. Is the final decision improved from what you originally thought?\n${answers.improved || "No answer"}\n\n` +
        `2. Would you use it if it is a paid subscription?\n${answers.paid || "No answer"}\n\n` +
        `3. Would you recommend this to others?\n${answers.recommend || "No answer"}\n\n` +
        `Any other suggestions?\n${answers.suggestions || "No answer"}`
    );
    return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
  }

  const isComplete = answers.improved && answers.paid && answers.recommend;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Feedback</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Give us feedback</h1>
        <p className="mt-3 text-muted-foreground">
          Your answers help us improve the framework. Send your feedback directly to{" "}
          <a href={`mailto:${FEEDBACK_EMAIL}`} className="text-accent hover:underline">
            {FEEDBACK_EMAIL}
          </a>
          .
        </p>

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = buildMailto();
          }}
        >
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

          <button
            type="submit"
            disabled={!isComplete}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send feedback
          </button>
        </form>
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
