import { AlertTriangle } from "lucide-react";
import { MI_CRISIS_RESOURCES, type MiCrisisCategory } from "@/lib/mi-filter";

export function CrisisNotice({ categories }: { categories: MiCrisisCategory[] }) {
  if (categories.length === 0) return null;
  const list = categories.includes("imminent_danger")
    ? categories
    : (["imminent_danger", ...categories] as MiCrisisCategory[]);

  return (
    <div
      role="alert"
      className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm"
    >
      <div className="mb-2 flex items-center gap-2 font-medium text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Your safety comes before this process.
      </div>
      <ul className="list-disc space-y-1 pl-5 text-foreground">
        {list.map((c) => (
          <li key={c}>{MI_CRISIS_RESOURCES[c]}</li>
        ))}
        <li>If you need medical care, go to the nearest emergency room or call 911.</li>
      </ul>
      <p className="mt-2 text-justify text-xs text-muted-foreground">
        These are US services. Elsewhere, contact your local emergency number or crisis line. None
        of what happened is your fault. You can pause this session and come back any time.
      </p>
    </div>
  );
}
