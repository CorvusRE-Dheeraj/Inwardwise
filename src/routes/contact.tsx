import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Inwardwise" },
      {
        name: "description",
        content:
          "Reach the Inwardwise team by email at info@inwardwise.com or write to our Warren Parkway office in Frisco, Texas.",
      },
      { property: "og:title", content: "Contact Us — Inwardwise" },
      { property: "og:description", content: "Email info@inwardwise.com or write to our Frisco, Texas office." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <AppShell>
      <section className="mx-auto w-[min(900px,calc(100%-2rem))] pb-24 pt-10 md:pt-16">
        <span className="font-mono-cap text-[color:var(--muted-foreground)]">Contact Us</span>
        <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-tight md:text-6xl">
          Write to <em className="italic text-[color:var(--royal)]">Inwardwise</em>
        </h1>
        <div className="rule-top mt-8" />

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="paper-card rounded-3xl p-6">
            <div className="flex items-center gap-2 text-[color:var(--muted-foreground)]">
              <Mail className="h-4 w-4" />
              <span className="font-mono-cap">Email</span>
            </div>
            <a
              href="mailto:info@inwardwise.com"
              className="font-display mt-3 block text-2xl text-[color:var(--ink)] hover:text-[color:var(--royal)]"
            >
              info@inwardwise.com
            </a>
            <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
              General questions, partnerships, media and feedback.
            </p>
          </div>

          <div className="paper-card rounded-3xl p-6">
            <div className="flex items-center gap-2 text-[color:var(--muted-foreground)]">
              <MapPin className="h-4 w-4" />
              <span className="font-mono-cap">Mailing address</span>
            </div>
            <address className="mt-3 not-italic text-[16px] leading-relaxed text-[color:var(--ink-2)]">
              Inwardwise
              <br />
              2601 Warren Parkway
              <br />
              Frisco, Texas 75034
              <br />
              United States
            </address>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
