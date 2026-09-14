import { useState } from "react";
import { Lock } from "lucide-react";
import { ProductName } from "@/components/products/ProductChrome";

export function Caution({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--paper)] p-5">
      <div className="font-mono-cap mb-2 text-[10px] text-[color:var(--royal)]">Caution</div>
      <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">{children}</p>
    </div>
  );
}

export function PinKeypad({
  mode,
  onSubmit,
  error,
  busy,
}: {
  mode: "setup" | "enter";
  onSubmit: (pin: string) => void;
  error?: string | null;
  busy?: boolean;
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [stage, setStage] = useState<"first" | "confirm">("first");
  const [local, setLocal] = useState<string | null>(null);

  const active = stage === "first" ? pin : confirmPin;
  const setActive = stage === "first" ? setPin : setConfirmPin;

  function push(d: string) {
    if (active.length >= 4 || busy) return;
    const next = active + d;
    setActive(next);
    setLocal(null);
    if (next.length === 4) {
      if (mode === "enter") {
        onSubmit(next);
        setTimeout(() => setActive(""), 400);
      } else if (stage === "first") {
        setStage("confirm");
      } else if (next === pin) {
        onSubmit(next);
      } else {
        setLocal("The two PINs do not match. Start again.");
        setPin("");
        setConfirmPin("");
        setStage("first");
      }
    }
  }

  function back() {
    setActive(active.slice(0, -1));
  }

  const label: React.ReactNode =
    mode === "enter"
      ? <>Enter your <ProductName id="self" /> PIN</>
      : stage === "first"
        ? "Choose a 4-digit PIN"
        : "Confirm your PIN";

  return (
    <div className="mx-auto w-full max-w-xs text-center">
      <div className="font-mono-cap mb-3 flex items-center justify-center gap-2 text-[10px] text-[color:var(--muted-foreground)]">
        <Lock className="h-3 w-3" /> {label}
      </div>
      <div className="mb-6 flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full border border-[color:var(--ink)] transition ${
              active.length > i ? "bg-[color:var(--ink)]" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => push(d)}
            className="rounded-full border border-[color:var(--rule)] py-3 font-display text-lg transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
          >
            {d}
          </button>
        ))}
        <span />
        <button
          onClick={() => push("0")}
          className="rounded-full border border-[color:var(--rule)] py-3 font-display text-lg transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
        >
          0
        </button>
        <button
          onClick={back}
          className="rounded-full border border-transparent py-3 text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
        >
          Delete
        </button>
      </div>
      {(local || error) && (
        <p className="mt-4 text-sm text-destructive">{local || error}</p>
      )}
      {busy && <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">Working…</p>}
    </div>
  );
}
