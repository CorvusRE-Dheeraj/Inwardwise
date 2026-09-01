// Orientation panel shown next to the decision intro. Presentation only:
// it describes what happens at each stage in plain language.

export const SEVEN_STAGES: { label: string; text: string }[] = [
  {
    label: "Stage 1",
    text: "Describe your situation, issue, or the decision to be made.",
  },
  {
    label: "Stage 2",
    text: "Define your objective clearly. Not what you feel, expect, or what the solution is. Just what the real objective is, crisply defined in one to four sentences, without any reference to solutions and answers.",
  },
  {
    label: "Stage 3",
    text: "This is what you think the solutions might look like. We usually jump to solutions, and typically this is what our normal process looks like. You can define some solutions, but don't expect to reach solutions here. In fact, if you don't know the solutions, that is better — you will be guided to them.",
  },
  {
    label: "Stage 4",
    text: "At this stage the AI will remove fears and biases and start cleaning up your objective. You can contribute, especially if you have completed your InwardWise Self build; that information will be used to clean up your objective.",
  },
  {
    label: "Stage 5",
    text: "This is the stage where the magic happens and your objective is modified based on various heuristics of the model.",
  },
  {
    label: "Stage 6",
    text: "Here you carefully observe the objective being rewritten and redefined after filtering through everything.",
  },
  {
    label: "Stage 7",
    text: "At this stage the objective is divided into sub-objectives and smaller solutions. Each solution of the sub-objectives added together becomes the total solution that you need.",
  },
  {
    label: "Action Stage",
    text: "This is not a stage. Using the sub-objectives above, come up with answers to all of them so your solution is comprehensive and bound inside the broad objective definition. By working through all of the sub-objectives, you will find better solutions, or your objective itself might have changed and you are now reaching a solution that is different than before.",
  },
];

export function SevenStagePanel() {
  return (
    <aside className="py-6">
      <h2 className="font-display text-2xl md:text-3xl">7-Stage Process and What to Expect</h2>
      <ol className="mt-6 border-t border-glass-border">
        {SEVEN_STAGES.map((s) => (
          <li key={s.label} className="border-b border-glass-border py-4">
            <div className="text-xs uppercase tracking-[0.18em] text-accent">{s.label}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-justify text-muted-foreground">
              {s.text}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
