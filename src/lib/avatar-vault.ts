import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  deriveKey,
  forgetPin,
  hashPin,
  randomSalt,
  recallPin,
  rememberPin,
} from "@/lib/avatar-crypto";

export type AvatarProfile = {
  user_id: string;
  pin_hash: string | null;
  pin_salt: string | null;
  voice_enabled: boolean;
  phone_number: string | null;
  scheduled_call_at: string | null;
};

export type VaultStatus = "loading" | "needs-setup" | "locked" | "unlocked";

export function useAvatarVault() {
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [profile, setProfile] = useState<AvatarProfile | null>(null);
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    let { data } = await supabase
      .from("avatar_profiles")
      .select("user_id, pin_hash, pin_salt, voice_enabled, phone_number, scheduled_call_at")
      .eq("user_id", uid)
      .maybeSingle();

    if (!data) {
      const inserted = await supabase
        .from("avatar_profiles")
        .insert({ user_id: uid })
        .select("user_id, pin_hash, pin_salt, voice_enabled, phone_number, scheduled_call_at")
        .maybeSingle();
      data = inserted.data;
    }
    const p = (data as AvatarProfile | null) ?? null;
    setProfile(p);

    if (!p?.pin_hash || !p?.pin_salt) {
      setStatus("needs-setup");
      return;
    }
    const cached = recallPin();
    if (cached) {
      const h = await hashPin(cached, p.pin_salt);
      if (h === p.pin_hash) {
        setKey(await deriveKey(cached, p.pin_salt));
        setStatus("unlocked");
        return;
      }
      forgetPin();
    }
    setStatus("locked");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setupPin = useCallback(
    async (pin: string) => {
      if (!profile) return;
      setBusy(true);
      setError(null);
      try {
        const salt = randomSalt();
        const hash = await hashPin(pin, salt);
        const { error: err } = await supabase
          .from("avatar_profiles")
          .update({ pin_hash: hash, pin_salt: salt, last_active_at: new Date().toISOString() })
          .eq("user_id", profile.user_id);
        if (err) throw new Error(err.message);
        rememberPin(pin);
        setKey(await deriveKey(pin, salt));
        setProfile({ ...profile, pin_hash: hash, pin_salt: salt });
        setStatus("unlocked");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not set your PIN.");
      } finally {
        setBusy(false);
      }
    },
    [profile],
  );

  const unlock = useCallback(
    async (pin: string) => {
      if (!profile?.pin_hash || !profile.pin_salt) return false;
      setBusy(true);
      setError(null);
      try {
        const h = await hashPin(pin, profile.pin_salt);
        if (h !== profile.pin_hash) {
          setError("That PIN is not correct.");
          return false;
        }
        rememberPin(pin);
        setKey(await deriveKey(pin, profile.pin_salt));
        setStatus("unlocked");
        return true;
      } finally {
        setBusy(false);
      }
    },
    [profile],
  );

  const lock = useCallback(() => {
    forgetPin();
    setKey(null);
    setStatus("locked");
  }, []);

  const selfDestruct = useCallback(async () => {
    if (!profile) return;
    await supabase.from("avatar_answers").delete().eq("user_id", profile.user_id);
    await supabase.from("avatar_dimensions").delete().eq("user_id", profile.user_id);
    await supabase.from("avatar_profiles").delete().eq("user_id", profile.user_id);
    forgetPin();
    setKey(null);
    setProfile(null);
    setStatus("loading");
    await load();
  }, [profile, load]);

  return { status, profile, setProfile, key, error, busy, setupPin, unlock, lock, selfDestruct, reload: load };
}
