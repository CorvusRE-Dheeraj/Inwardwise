import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "User Feedback, InwardWise" },
      {
        name: "description",
        content:
          "Share your feedback on the InwardWise framework, short or long version.",
      },
      { property: "og:title", content: "User Feedback, InwardWise" },
      { property: "og:description", content: "Short or long feedback for the InwardWise framework." },
    ],
  }),
  component: Feedback,
});

const SHORT_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSd-short-placeholder/viewform?embedded=true";
const LONG_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSd-long-placeholder/viewform?embedded=true";

// Using the doc-ID viewform variant which Google serves for embedded forms
const SHORT_URL =
  "https://docs.google.com/forms/d/1FdfVFW4FxFkAzwT6r1zRm8GQK3BSknYJlM5g_SpKxdg/viewform?embedded=true";
const LONG_URL =
  "https://docs.google.com/forms/d/1OKvdZtqvC-Xkbn4d3wcUB6XDt-o5idTuSmRTQ67G0r4/viewform?embedded=true";

void SHORT_FORM;
void LONG_FORM;

function Feedback() {
  const [version, setVersion] = useState<"short" | "long">("short");
  const url = version === "short" ? SHORT_URL : LONG_URL;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">User Feedback</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Share your feedback</h1>
        <p className="mt-3 text-muted-foreground">
          Pick the version that suits you. The short version takes about a minute;
          the long version goes deeper.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setVersion("short")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
              version === "short"
                ? "bg-foreground text-background"
                : "border border-glass-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Short Version
          </button>
          <button
            onClick={() => setVersion("long")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
              version === "long"
                ? "bg-foreground text-background"
                : "border border-glass-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Long Version
          </button>
        </div>

        <div className="glass-strong mt-6 overflow-hidden rounded-3xl p-2">
          <iframe
            key={version}
            src={url}
            title={version === "short" ? "Short feedback form" : "Long feedback form"}
            className="h-[1400px] w-full rounded-2xl bg-white"
            loading="lazy"
          >
            Loading…
          </iframe>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Trouble loading the form?{" "}
          <a
            href={url.replace("?embedded=true", "")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Open it in a new tab
          </a>
          .
        </p>
      </div>
    </AppShell>
  );
}
