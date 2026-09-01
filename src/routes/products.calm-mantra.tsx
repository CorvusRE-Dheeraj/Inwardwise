import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CtaRow, Disclaimer, ProductHeader, ProductName } from "@/components/products/ProductChrome";
import { SELF_DISCLAIMER } from "@/lib/products";

export const Route = createFileRoute("/products/calm-mantra")({
  head: () => ({
    meta: [
      { title: "InwardWise Calm & Mantra — Quiet the mind | InwardWise" },
      {
        name: "description",
        content:
          "InwardWise Calm and InwardWise Mantra sit under Self: AI-guided meditation and reflection, and personal messages worth repeating.",
      },
      { property: "og:title", content: "InwardWise Calm & Mantra | InwardWise" },
      {
        property: "og:description",
        content: "Quiet the mental noise, and make the messages you repeat worth repeating.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalmMantra,
});

function CalmMantra() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] py-14 md:py-20">

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <section>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] tracking-tight">
              <ProductName id="calm" />
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--ink)]">
              Quiet the mental noise. Create space to reconnect with yourself.
            </p>
            <div className="mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
              <p>
                Our minds continuously process thoughts, emotions, decisions, memories, and
                information from the world around us. <ProductName id="calm" /> provides{" "}
                <strong className="font-medium text-[color:var(--ink)]">
                  AI-guided meditation and reflection
                </strong>{" "}
                designed to create intentional periods of quiet within that activity. The approach was
                developed by the founder through the study of meditation, contemplative practices,
                stress, mental activity, and mind-body interactions, while drawing on scientific
                research into meditation and its relationship with stress responses, emotional
                regulation, attention, and patterns of brain activity. You don&apos;t need meditation
                experience or a particular spiritual belief — only a willingness to pause and reflect.
              </p>
              <p>
                What makes <ProductName id="calm" /> different is its connection to{" "}
                <ProductName id="self" />. Rather than offering only generic meditation scripts, AI can
                use the personal context you have chosen to provide through your five dimensions to make
                reflection more relevant to you. Practices can incorporate gratitude, self-compassion,
                forgiveness, and constructive reflection — including a modified four-part practice built
                around “I am sorry,” “Please forgive me,” “Thank you,” and “I love you” — with prompts
                grounded in your own experiences and reflections.
              </p>
              <p>
                The objective isn&apos;t to eliminate thoughts or promise constant happiness. It is to
                regularly create enough mental space to observe what you are thinking and feeling with
                greater calm and perspective. Over time, these moments can become opportunities for
                reflection, self-awareness, and more intentional responses to everyday life.{" "}
                <strong className="font-medium text-[color:var(--ink)]">
                  <ProductName id="self" /> helps you understand yourself.{" "}
                  <ProductName id="calm" /> gives you a quiet place to spend time with that understanding.
                </strong>
              </p>
            </div>
            <p className="mt-8 max-w-3xl text-base leading-relaxed text-[color:var(--ink)]">
              Pause → Quiet the noise → Reflect → Reconnect → Return with greater clarity.
            </p>
            <CtaRow actions={[{ label: "Start Calm", to: "/meditation/schedule", primary: true }]} />
          </section>

          <section>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] tracking-tight">
              <ProductName id="mantra" />
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--ink)]">
              The messages you repeatedly tell yourself can influence how you approach your day. Make
              them worth repeating.
            </p>
            <div className="mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
              <p>
                We all carry an internal dialogue — about what we can do, what we cannot do, who we
                are, what others think of us, and what may be possible in our future. Some of these
                beliefs come from experience; others may come from fear, setbacks, social
                expectations, or assumptions we have carried for years.{" "}
                <strong className="font-medium text-[color:var(--ink)]">
                  <ProductName id="mantra" /> helps you identify the messages that matter to you and create
                  personalized reminders and affirmations designed to reinforce the mindset,
                  intentions, and behaviors you want to cultivate.
                </strong>{" "}
                Where appropriate, those messages can be grounded in credible research rather than
                unsupported positive thinking.
              </p>
              <p>
                Because Mantra can work with the personal context you choose to build through{" "}
                <ProductName id="self" />, the message doesn&apos;t have to be generic. If age, fear of failure,
                confidence, persistence, forgiveness, gratitude, a difficult transition, or another
                recurring thought is holding you back, Mantra can help you develop constructive
                language around that specific challenge and deliver it according to your schedule and
                circumstances. The objective isn&apos;t to convince yourself that something false is true.{" "}
                <strong className="font-medium text-[color:var(--ink)]">
                  It is to question limiting assumptions, reinforce what evidence and experience
                  reasonably support, and repeatedly remind yourself of what you have consciously
                  chosen to believe, pursue, or change.
                </strong>
              </p>
              <p>
                <ProductName id="mantra" /> becomes a bridge between insight and repetition. Self helps you
                understand your patterns. Decision helps you examine what you want and why. Calm
                creates space for reflection.{" "}
                <strong className="font-medium text-[color:var(--ink)]">
                  Mantra helps keep important intentions from disappearing when everyday life takes
                  over.
                </strong>{" "}
                You define what success and happiness mean to you; InwardWise helps you create
                personally meaningful messages that bring those intentions back into focus.
              </p>
            </div>
            <p className="mt-8 max-w-3xl text-base leading-relaxed text-[color:var(--ink)]">
              Understand the pattern → Question the belief → Create the message → Reinforce the
              intention → Act with greater awareness.
            </p>
            <CtaRow actions={[{ label: "Start Mantra", to: "/meditation/practice", primary: true }]} />
          </section>
        </div>

        <Disclaimer>{SELF_DISCLAIMER}</Disclaimer>
      </div>
    </AppShell>
  );
}
