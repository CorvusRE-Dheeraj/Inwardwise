import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sketchFromFile, sketchFromImage } from "@/lib/avatar-sketch";

const BUCKET = "avatar-portraits";

type Props = {
  userId: string;
  /** How many of the five factors are complete. */
  complete: number;
  total: number;
};

/**
 * Upload a photograph, keep it private, and render it as an ink sketch whose
 * definition sharpens as more factors are answered.
 */
export function AvatarPortrait({ userId, complete, total }: Props) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sketch, setSketch] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const detail = total > 0 ? complete / total : 0;
  const path = `${userId}/source`;

  // Fetch the stored photograph (private bucket → signed URL).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (!cancelled && data?.signedUrl) setSourceUrl(data.signedUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  // Re-sketch whenever the photo or the factor progress changes.
  useEffect(() => {
    if (!sourceUrl) return;
    let cancelled = false;
    void (async () => {
      try {
        const png = await sketchFromImage(sourceUrl, detail);
        if (!cancelled) setSketch(png);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not draw the sketch.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceUrl, detail]);

  async function onPick(file: File) {
    setBusy(true);
    setError(null);
    try {
      const preview = await sketchFromFile(file, detail);
      setSketch(preview);
      const { error: err } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (err) throw new Error(err.message);
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (data?.signedUrl) setSourceUrl(data.signedUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    await supabase.storage.from(BUCKET).remove([path]);
    setSketch(null);
    setSourceUrl(null);
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-center rounded-lg border border-[color:var(--rule)] p-8">
      <div className="relative grid h-40 w-40 place-items-center overflow-hidden rounded-full bg-[color:var(--royal)]/12 ring-1 ring-[color:var(--royal)]/25">
        {sketch ? (
          <img
            src={sketch}
            alt="Ink sketch of your Avatar portrait"
            className="h-full w-full object-cover"
            style={{ opacity: 0.55 + 0.45 * detail, transition: "opacity 600ms ease" }}
          />
        ) : (
          <span className="font-display text-4xl italic text-[color:var(--royal)]">
            {complete}/{total}
          </span>
        )}
      </div>

      <div className="font-mono-cap mt-5 text-[10px] text-[color:var(--muted-foreground)]">
        Avatar Portrait · {complete}/{total} factors
      </div>
      <p className="mt-2 text-center text-sm text-[color:var(--muted-foreground)]">
        {sketch
          ? "Your sketch sharpens as each factor is answered."
          : "Attach a photograph — it is drawn as a private ink sketch."}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onPick(f);
          e.target.value = "";
        }}
      />
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-[color:var(--rule)] px-5 py-2 text-[13px] transition hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] disabled:opacity-50"
        >
          {busy ? "Working…" : sketch ? "Replace photo" : "Attach photo"}
        </button>
        {sketch && (
          <button
            disabled={busy}
            onClick={() => void onRemove()}
            className="text-[13px] text-[color:var(--muted-foreground)] underline-offset-4 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
