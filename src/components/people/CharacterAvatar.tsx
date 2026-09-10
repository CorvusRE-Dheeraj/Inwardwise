import merryAsset from "@/assets/plm-merry.png";
import alexAsset from "@/assets/plm-alex.png";

const AVATARS: Record<string, string> = {
  merry: merryAsset,
  alex: alexAsset,
};

/**
 * Stylised avatar for a fictional People Like Me character. Never a photograph
 * of a real person; unknown characters fall back to an initial monogram.
 */
export function CharacterAvatar({
  avatarKey,
  name,
  size = 88,
}: {
  avatarKey: string;
  name: string;
  size?: number;
}) {
  const src = AVATARS[avatarKey];
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-[color:var(--rule)] bg-[color:var(--royal)]/[0.06]"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={`Illustration of ${name}, a fictional character`}
          loading="lazy"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-display text-xl text-[color:var(--royal)]">{name.charAt(0)}</span>
      )}
    </div>
  );
}
