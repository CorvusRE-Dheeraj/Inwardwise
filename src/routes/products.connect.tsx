import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CtaRow, ProductHeader, ProductName } from "@/components/products/ProductChrome";
import { getProduct } from "@/lib/products";

const product = getProduct("connect");

export const Route = createFileRoute("/products/connect")({
  head: () => ({
    meta: [
      { title: "InwardWise Connect — Find where you belong | InwardWise" },
      { name: "description", content: product.tagline },
      { property: "og:title", content: "InwardWise Connect | InwardWise" },
      { property: "og:description", content: product.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConnectProduct,
});

function ConnectProduct() {
  return (
    <AppShell>
      <div className="mx-auto w-[min(1100px,calc(100%-2rem))] py-14 md:py-20">
        <ProductHeader
          eyebrow="Product III · Connect"
          name={<ProductName id="connect" />}
          tagline="Understand how you connect. Find where you belong. Build connections that matter."
        />

        <div className="mt-10 max-w-2xl space-y-5 text-base leading-relaxed text-justify text-[color:var(--muted-foreground)]">
          <p>
            We can be surrounded by people, connected across social media, and still feel
            surprisingly alone. Meaningful connection depends on more than simply meeting more
            people — it can depend on our personality, interests, experiences, communication style,
            priorities, and willingness to invest in relationships.{" "}
            <strong className="font-medium text-[color:var(--ink)]">
              InwardWise Connect begins with understanding you.
            </strong>{" "}
            With insights from your InwardWise Self, it helps you reflect on why some connections
            feel natural, why others are difficult to sustain, and what kinds of people, interests,
            and communities may create a stronger sense of belonging.
          </p>
          <p>
            InwardWise Connect combines{" "}
            <strong className="font-medium text-[color:var(--ink)]">
              AI-guided reflection, shared experiences, and Special Interest Groups
            </strong>{" "}
            built around common interests, professions, activities, experiences, and life pursuits.
            Rather than functioning as another social-media feed or matching strangers for direct
            online interaction, it is designed to help you discover communities where meaningful
            participation can develop naturally. You can explore how others navigate similar
            experiences, learn what has worked for them, contribute what has worked for you, and
            discover that many challenges that feel uniquely personal are often shared by others.
          </p>
          <p>
            Connection also begins with how we respond to loneliness, rejection, disappointment, and
            other difficult emotions. InwardWise can work alongside Self, Calm, and Mantra to help
            you reflect, regain perspective, reinforce personally meaningful intentions, and
            identify constructive ways to reconnect with the world around you. The objective isn't
            to give you more followers or contacts. It is to help you understand how you connect,
            discover where you may belong, and create opportunities for relationships and
            communities that add meaning to your life.
          </p>
        </div>

        <p className="mt-10 max-w-3xl text-base leading-relaxed text-[color:var(--ink)]">
          Understand yourself → Discover where you belong → Participate → Contribute → Connect
          meaningfully.
        </p>

        <CtaRow actions={[{ label: "Use InwardWise Connect", to: "/connect", primary: true }]} />
      </div>
    </AppShell>
  );
}
