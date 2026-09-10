import { motion, useReducedMotion } from "framer-motion";
import merryAsset from "@/assets/plm-merry.png";
import alexAsset from "@/assets/plm-alex.png";
import {
  ENVIRONMENT_WASH,
  STATE_MOTION,
  toCharacterState,
  type CharacterState,
} from "@/lib/character-states";

/**
 * Avatar registry. Keys are `${avatarKey}-${state}` with a `${avatarKey}` base
 * fallback, so extra characters or per-state artwork can be added later without
 * touching any page. Illustrations only, never photographs of real people.
 */
const AVATARS: Record<string, string> = {
  merry: merryAsset,
  alex: alexAsset,
};

function resolveAvatar(avatarKey: string, state: CharacterState): string | undefined {
  return AVATARS[`${avatarKey}-${state}`] ?? AVATARS[avatarKey];
}

/**
 * Reusable animated character. All behaviour comes from scenario data; pages
 * never hard-code animation.
 */
export function AnimatedCharacter({
  avatarKey,
  name,
  state,
  environment,
  animation,
  size = 132,
  className = "",
}: {
  avatarKey: string;
  name: string;
  state?: string | null;
  environment?: string | null;
  /** Optional override from scenario data, e.g. a different state's motion. */
  animation?: string | null;
  size?: number;
  className?: string;
}) {
  const resolved = toCharacterState(state);
  const motionKey = toCharacterState(animation ?? state);
  const cfg = STATE_MOTION[motionKey];
  const reduce = useReducedMotion();
  const src = resolveAvatar(avatarKey, resolved);
  const wash = environment ? ENVIRONMENT_WASH[environment.toLowerCase()] : undefined;

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-[color:var(--rule)] ${className}`}
      style={{
        width: size,
        height: size,
        background: wash ?? "color-mix(in srgb, var(--royal) 6%, transparent)",
      }}
      role="img"
      aria-label={`Illustration of ${name}, a fictional character, ${cfg.label}${
        environment ? `, in a ${environment} setting` : ""
      }`}
    >
      <motion.div
        className="h-full w-full"
        initial={false}
        animate={
          reduce
            ? { y: cfg.rest.y, rotate: cfg.rest.rotate, opacity: cfg.rest.opacity }
            : {
                y: cfg.y.map((v) => v + cfg.rest.y),
                rotate: cfg.rotate.map((v) => v + cfg.rest.rotate),
                scale: cfg.scale,
                opacity: cfg.rest.opacity,
              }
        }
        transition={
          reduce
            ? { duration: 0.6, ease: "easeOut" }
            : {
                y: { duration: cfg.duration, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: cfg.duration * 1.6, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: cfg.duration, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.8, ease: "easeOut" },
              }
        }
      >
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            width={size}
            height={size}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-2xl text-[color:var(--royal)]">
            {name.charAt(0)}
          </span>
        )}
      </motion.div>

      {/* Quiet blink: a brief soft veil, never a cartoon expression. */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[color:var(--ink)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.14, 0] }}
          transition={{
            duration: cfg.blinkEvery,
            times: [0, 0.94, 0.97, 1],
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
}
