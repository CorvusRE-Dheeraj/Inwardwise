import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Flag } from "lucide-react";
import { reportConnectContent } from "@/lib/connect.functions";
import type { PathwayAnalysis } from "./PathwayPrompt";

type Story = PathwayAnalysis["stories"][number];

function StoryBlock({ story }: { story: Story }) {
  const report = useServerFn(reportConnectContent);
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);

  return (
    <div className="rounded-md border border-[color:var(--rule)] p-4">
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        {story.pseudonym ?? "Anonymous Member"} · {story.category}
      </div>
      <p className="mt-2 text-[15px] leading-relaxed">{story.situation}</p>

      {story.audio_url && (
        <audio controls preload="none" src={story.audio_url} className="mt-3 w-full">
          Your browser cannot play this recording.
        </audio>
      )}

      {open && (
        <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-[color:var(--muted-foreground)]">
          {story.fear && <p>{story.fear}</p>}
          {story.action_taken && <p>{story.action_taken}</p>}
          {story.outcome && <p>{story.outcome}</p>}
          {story.lesson && <p>{story.lesson}</p>}
          {story.advice && <p>{story.advice}</p>}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4">
        {(story.fear || story.action_taken || story.outcome || story.lesson || story.advice) && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="font-mono-cap text-[10px] text-[color:var(--royal)]"
          >
            {open ? "Show less" : "Read the whole story"}
          </button>
        )}
        <button
          disabled={reported}
          onClick={async () => {
            try {
              await report({
                data: { target_type: "story", target_id: story.id, reason: "Reported by a member" },
              });
            } finally {
              setReported(true);
            }
          }}
          className="inline-flex items-center gap-1 font-mono-cap text-[10px] text-[color:var(--muted-foreground)] disabled:opacity-60"
        >
          <Flag className="h-3 w-3" /> {reported ? "Reported" : "Report"}
        </button>
      </div>
    </div>
  );
}

/** Reviewed, anonymous experiences shared by other members. */
export function MemberStories({ stories }: { stories: Story[] }) {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="rounded-lg border border-[color:var(--rule)] p-6 sm:p-8">
      <div className="font-mono-cap text-[10px] text-[color:var(--muted-foreground)]">
        What other members have lived through
      </div>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[color:var(--muted-foreground)]">
        These are anonymous experiences shared by other members and reviewed before anyone sees
        them. Names are never attached.
      </p>
      <div className="mt-4 grid gap-4">
        {stories.map((s) => (
          <StoryBlock key={s.id} story={s} />
        ))}
      </div>
    </div>
  );
}
