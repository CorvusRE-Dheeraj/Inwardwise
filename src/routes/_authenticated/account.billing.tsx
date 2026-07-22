import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account/billing")({
  component: BillingPage,
});

function BillingPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Billing</h1>
      <p className="mt-2 text-sm text-muted-foreground">You&rsquo;re on the <span className="text-foreground">Beta</span> plan — free.</p>
      <div className="mt-6 glass rounded-3xl p-6">
        <div className="text-sm">No invoices yet. See <Link to="/pricing" className="text-accent hover:underline">Pricing</Link> for corporate options.</div>
      </div>
    </div>
  );
}
