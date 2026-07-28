// Simple per-user local profile storage. Not synced to server yet.
export type PersonalDetails = {
  name: string;
  phone: string;
  reachOutEnabled: boolean;
  emailEnabled: boolean;
};

export type SelfAvatar = {
  avatar: string; // emoji or short symbol
  dimension1: string;
  dimension2: string;
  dimension3: string;
  dimension4: string;
  dimension5: string;
  note: string;
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
export const selfAvatarDefaults: SelfAvatar = {
  avatar: "✦",
  dimension1: "",
  dimension2: "",
  dimension3: "",
  dimension4: "",
  dimension5: "",
  note: "",
};

export const loadPersonal = (uid: string) => read(key(uid, "personal"), personalDefaults);
export const savePersonal = (uid: string, v: PersonalDetails) => write(key(uid, "personal"), v);
export const loadSelfAvatar = (uid: string) => read(key(uid, "selfAvatar"), selfAvatarDefaults);
export const saveSelfAvatar = (uid: string, v: SelfAvatar) => write(key(uid, "selfAvatar"), v);
