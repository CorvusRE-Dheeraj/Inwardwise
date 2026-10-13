// Raw fetch access to Supabase Edge Functions, for the calls
// supabase.functions.invoke doesn't fit: streamed chat replies, audio bytes
// and multipart uploads.
import { supabase } from "@/integrations/supabase/client";

/** The URL of an Edge Function on the site's Supabase project. */
export function edgeFunctionUrl(name: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`;
}

/** Headers that identify the signed-in member to an Edge Function. */
export async function edgeFunctionHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
