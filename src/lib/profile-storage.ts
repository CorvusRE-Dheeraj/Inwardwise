// Simple per-user local profile storage. Not synced to server yet.
export type PersonalDetails = {
  name: string;
  phone: string;
  reachOutEnabled: boolean;
  emailEnabled: boolean;
};

export type ShadowProfile = {
  avatar: string; // emoji or short text
  traits: string; // freeform text
};

export type EnemyProfile = {
  avatar: string;
  traits: string; // e.g. "Egoistic, Narcissist, Anger, Jealousy"
};

const key = (uid: string, ns: string) => `dp.profile.${ns}.${uid}`;

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
}

export const personalDefaults: PersonalDetails = { name: "", phone: "", reachOutEnabled: false, emailEnabled: true };
export const shadowDefaults: ShadowProfile = { avatar: "🌱", traits: "" };
export const enemyDefaults: EnemyProfile = { avatar: "🔥", traits: "" };

export const loadPersonal = (uid: string) => read(key(uid, "personal"), personalDefaults);
export const savePersonal = (uid: string, v: PersonalDetails) => write(key(uid, "personal"), v);
export const loadShadow = (uid: string) => read(key(uid, "shadow"), shadowDefaults);
export const saveShadow = (uid: string, v: ShadowProfile) => write(key(uid, "shadow"), v);
export const loadEnemy = (uid: string) => read(key(uid, "enemy"), enemyDefaults);
export const saveEnemy = (uid: string, v: EnemyProfile) => write(key(uid, "enemy"), v);
