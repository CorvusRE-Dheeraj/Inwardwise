// Client-side PIN handling for Avatar data.
// The PIN never leaves the browser: we store only a salted hash server-side,
// and encrypt sensitive answers with an AES-GCM key derived from the PIN.

const ITERATIONS = 200_000;

function b64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function unb64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export function randomSalt(): string {
  return b64(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

async function baseKey(pin: string) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, [
    "deriveBits",
    "deriveKey",
  ]);
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const key = await baseKey(pin);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: unb64(salt + "").slice(),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return b64(bits);
}

export async function deriveKey(pin: string, salt: string): Promise<CryptoKey> {
  const key = await baseKey(pin);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("avatar-enc:" + salt),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(key: CryptoKey, text: string): Promise<string> {
  if (!text) return "";
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text),
  );
  return `${b64(iv.buffer)}.${b64(ct)}`;
}

export async function decryptText(key: CryptoKey, payload: string): Promise<string> {
  if (!payload) return "";
  const [ivPart, ctPart] = payload.split(".");
  if (!ivPart || !ctPart) return "";
  try {
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unb64(ivPart) },
      key,
      unb64(ctPart),
    );
    return new TextDecoder().decode(pt);
  } catch {
    return "";
  }
}

// Session-scoped PIN (cleared when the tab closes).
const SESSION_KEY = "avatar-pin:session";

export function rememberPin(pin: string) {
  try {
    sessionStorage.setItem(SESSION_KEY, pin);
  } catch {
    /* ignore */
  }
}

export function recallPin(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function forgetPin() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
