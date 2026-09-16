import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { chatWithAvatar } from "@/lib/avatar.functions";
import { buildAvatarSystemPrompt } from "@/lib/avatar-prompt";
import {
  assessmentFor,
  type DemonstrationCharacterId,
} from "@/lib/people-assessments";

export function CharacterPersonaPrompt({ id }: { id: DemonstrationCharacterId }) {
  const character = assessmentFor(id);
  const chat = useServerFn(chatWithAvatar);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const question = prompt.trim();
    if (!question || loading) return;

    setLoading(true);
    setError(null);
    try {
      const result = await chat({
        data: {
          systemPrompt: `${buildAvatarSystemPrompt(character.answers, character.name)}\n\nThis is a fictional demonstration. Answer as ${character.name}'s InwardWise Self and never imply that ${character.name} is a real person.`,
          messages: [{ role: "user", content: question }],
        },
      });
      setResponse(result.reply);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The response is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 border-t border-[color:var(--rule)] pt-8" aria-labelledby="persona-prompt-heading">
      <h2 id="persona-prompt-heading" className="font-display text-2xl leading-tight">
        Try out {character.name}&apos;s Persona. Find out what {id === "mary" ? "her" : "his"} persona reveals.
      </h2>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="font-mono-cap text-[10px] text-[color:var(--royal)]">Prompt</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={8}
            maxLength={8000}
            placeholder={`Ask a question on ${character.name}'s behalf…`}
            className="mt-3 w-full resize-y rounded-lg border border-[color:var(--rule)] bg-transparent p-4 text-[15px] leading-relaxed outline-none focus:border-[color:var(--royal)]"
          />
          <Button
            type="button"
            onClick={submit}
            disabled={!prompt.trim() || loading}
            className="mt-3 min-h-11 rounded-full bg-[color:var(--ink)] px-6 text-[color:var(--paper)]"
          >
            {loading ? "Considering…" : `Ask ${character.name}'s Self Aware`}
          </Button>
        </label>

        <div aria-live="polite">
          <div className="font-mono-cap text-[10px] text-[color:var(--royal)]">Response to prompt</div>
          <div className="mt-3 min-h-52 rounded-lg border border-[color:var(--rule)] p-4">
            {error ? (
              <p className="text-[15px] leading-relaxed">{error}</p>
            ) : response ? (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{response}</p>
            ) : (
              <p className="text-[15px] leading-relaxed">
                {character.name}&apos;s response will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}