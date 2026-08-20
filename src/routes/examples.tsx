import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

import surgeryPdf from "@/assets/examples/surgery.pdf.asset.json";
import careerPdf from "@/assets/examples/career-pay-cut.pdf.asset.json";
import startupPdf from "@/assets/examples/govt-job-startup.pdf.asset.json";
import sonPdf from "@/assets/examples/son-youtuber.pdf.asset.json";
import spousePdf from "@/assets/examples/spouse-money.pdf.asset.json";
import canadaPdf from "@/assets/examples/move-canada.pdf.asset.json";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: "Example Sessions — InwardWise" },
      {
        name: "description",
        content:
          "Read complete worked examples of the Objective Solution Framework — six real decision sessions, each downloadable as a full PDF transcript.",
      },
      { property: "og:title", content: "Example Sessions — InwardWise" },
      {
        property: "og:description",
        content:
          "Six complete decision sessions worked through all stages of the framework, each with a downloadable PDF transcript.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Examples,
});

type Example = {
  n: string;
  category: string;
  title: string;
  summary: string;
  url: string;
  file: string;
};

const EXAMPLES: Example[] = [
  {
    n: "01",
    category: "Medical",
    title: "Doctor recommends surgery with 85% success rate but 15% risk of permanent disability.",
    summary:
      "Kidney failure with an urgent timeline. The session separates the raw medical facts from the fear driving the question, then works from a pseudo objective (“avoid disability”) toward the deeper objective of a livable, functioning life.",
    url: surgeryPdf.url,
    file: "surgery.pdf",
  },
  {
    n: "02",
    category: "Career",
    title: "I earn ₹45 lakh annually but hate my job. I have another offer for ₹25 lakh doing work I love.",
    summary:
      "A ₹20 lakh pay cut against meaningful work, with existing debt and a two-week deadline. The session tests whether the real objective is income, identity, or stability — and what boundary makes the trade survivable.",
    url: careerPdf.url,
    file: "career-pay-cut.pdf",
  },
  {
    n: "03",
    category: "Entrepreneurship",
    title: "I have a secure government job but dream of launching a startup.",
    summary:
      "Security versus ambition on a one-year horizon, with family responsibilities in the frame. The session abstracts “start a company” into the higher objective it serves, then designs an out-in path that doesn't require a single leap.",
    url: startupPdf.url,
    file: "govt-job-startup.pdf",
  },
  {
    n: "04",
    category: "Parenting",
    title: "My son wants to quit engineering and become a YouTuber.",
    summary:
      "A parent's decision disguised as their child's. The session surfaces whose objective is actually being solved for, and turns a binary confrontation into a set of testable conditions.",
    url: sonPdf.url,
    file: "son-youtuber.pdf",
  },
  {
    n: "05",
    category: "Marriage",
    title: "My spouse has lied to me multiple times about money. Should I divorce?",
    summary:
      "Repeated financial deception, two children, and eroded trust. The session refuses the yes/no framing, isolates trust as the real variable, and builds a verification boundary before any irreversible step.",
    url: spousePdf.url,
    file: "spouse-money.pdf",
  },
  {
    n: "06",
    category: "Relocation",
    title: "Should I move to Canada leaving my aging parents in India?",
    summary:
      "An unstable career, a job offer abroad, independent but ageing parents who are against the move. The session works the obligation and the opportunity as one system rather than two opposing loyalties.",
    url: canadaPdf.url,
    file: "move-canada.pdf",
  },
];

function Examples() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-border/60 pb-10">
          <p className="font-mono-cap text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Example sessions
          </p>
          <h1 className="font-display mt-3 text-4xl leading-[1.1] md:text-5xl">
            Six decisions, worked end to end
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Each example below is a real session carried through every stage of the framework — from the
            raw situation to the final report. Read the summary, then download the complete transcript.
          </p>
        </header>

        <ol className="mt-4">
          {EXAMPLES.map((ex) => (
            <li key={ex.n} className="border-b border-border/60 py-10">
              <div className="flex items-baseline gap-4">
                <span className="font-mono-cap text-xs tracking-[0.18em] text-muted-foreground">
                  {ex.n}
                </span>
                <span className="font-mono-cap text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {ex.category}
                </span>
              </div>
              <h2 className="font-display mt-3 text-2xl leading-snug md:text-[1.75rem]">{ex.title}</h2>
              <p className="mt-3 text-[0.975rem] leading-relaxed text-muted-foreground">{ex.summary}</p>
              <a
                href={ex.url}
                target="_blank"
                rel="noopener noreferrer"
                download={ex.file}
                className="font-mono-cap mt-5 inline-flex items-center gap-2 border-b border-foreground/30 pb-0.5 text-xs uppercase tracking-[0.18em] transition-colors hover:border-foreground hover:text-foreground"
              >
                Download full session (PDF) →
              </a>
            </li>
          ))}
        </ol>
      </div>
    </AppShell>
  );
}
