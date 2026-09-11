import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FactorSharingPreference = {
  classification: "internal_only" | "external_approved";
  acknowledged: boolean;
  acknowledgedAt: string | null;
};

export const INTERNAL_ONLY_NOTICE =
  "This information can be used internally but should not be shared externally with anyone.";

export const DO_NOT_SHARE_WARNING =
  "We recommend that you do not share this information with anyone.";

export function defaultFactorSharingPreference(): FactorSharingPreference {
  return {
    classification: "internal_only",
    acknowledged: false,
    acknowledgedAt: null,
  };
}

export function FactorSharingControl({
  factor,
  preference,
  saving = false,
  onChange,
}: {
  factor: number;
  preference: FactorSharingPreference;
  saving?: boolean;
  onChange: (next: FactorSharingPreference) => void | Promise<void>;
}) {
  const sensitive = factor === 1 || factor === 2;
  const approved =
    preference.classification === "external_approved" && preference.acknowledged;

  return (
    <div
      className={`rounded-lg border p-5 ${
        sensitive ? "border-destructive/40 bg-destructive/5" : "border-[color:var(--rule)] bg-secondary/30"
      }`}
    >
      <div className="flex items-start gap-3">
        {sensitive ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        ) : (
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--royal)]" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
            Sharing classification · Factor {factor}
          </p>
          <p className="mt-2 text-sm font-medium text-[color:var(--ink)]">
            {approved ? "External sharing approved by you" : "Internal use only"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
            {INTERNAL_ONLY_NOTICE}
          </p>

          {sensitive ? (
            <div className="mt-3 border-l-2 border-destructive pl-3">
              <p className="text-sm font-semibold text-destructive">{DO_NOT_SHARE_WARNING}</p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--muted-foreground)]">
                Sensitive Inner Shadow information includes childhood experiences, inner fears,
                and inner enemies.
              </p>
            </div>
          ) : null}

          <div className="mt-4">
            {approved ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() =>
                  onChange({
                    classification: "internal_only",
                    acknowledged: false,
                    acknowledgedAt: null,
                  })
                }
              >
                {saving ? "Saving…" : "Keep internal only"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                className={sensitive ? "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" : undefined}
                onClick={() =>
                  onChange({
                    classification: "external_approved",
                    acknowledged: true,
                    acknowledgedAt: new Date().toISOString(),
                  })
                }
              >
                {saving
                  ? "Saving…"
                  : "I understand the recommendation, but I still want to share it externally."}
              </Button>
            )}
          </div>

          {approved ? (
            <p className="mt-3 text-xs font-medium text-destructive">
              Your choice is recorded. {DO_NOT_SHARE_WARNING}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}