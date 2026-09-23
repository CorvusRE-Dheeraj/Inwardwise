import { Mic, Volume2 } from "lucide-react";

/** Always-visible reminder that the Self build works best by voice. */
export function VoiceReminder() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-[color:var(--royal)]/40 bg-[color:var(--royal)]/5 px-4 py-2.5 text-[13px] text-[color:var(--ink)]">
      <span className="flex items-center gap-1.5">
        <Mic className="h-4 w-4 text-[color:var(--royal)]" /> Turn your microphone on
      </span>
      <span className="flex items-center gap-1.5">
        <Volume2 className="h-4 w-4 text-[color:var(--royal)]" /> Turn your speaker up
      </span>
      <span>Speaking is the fastest way through, tap the mic and just talk.</span>
    </div>
  );
}
