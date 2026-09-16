import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adb } from "@/lib/admin-db";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/deep-memory")({
  head: () => ({
    meta: [
      { title: "Deep learn memory, InwardWise Admin" },
      {
        name: "description",
        content: "Every prompt asked, every AI response given and site activity, kept for deep learning.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Deep learn memory, InwardWise Admin" },
      { property: "og:description", content: "Prompts, AI responses and site activity in one record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeepMemory,
});

type Exchange = {
  id: string;
  user_id: string | null;
  surface: string;
  model: string | null;
  prompt: string | null;
  response: string | null;
  ok: boolean;
  latency_ms: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type Activity = {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function DeepMemory() {
  const { context } = useAdmin();
  const [term, setTerm] = useState("");
  const [tab, setTab] = useState<"ai" | "activity">("ai");
  const [openId, setOpenId] = useState<string | null>(null);
  const isSuper = !!context?.is_super_admin;

  const exchanges = useQuery<Exchange[]>({
    queryKey: ["admin-portal", "deep-memory", "ai", term],
    enabled: isSuper && tab === "ai",
    queryFn: async () => {
      const t = term.trim();
      let q = adb
        .from("ai_memory_log")
        .select("id,user_id,surface,model,prompt,response,ok,latency_ms,metadata,created_at");
      if (t) q = q.or(`surface.ilike.%${t}%,prompt.ilike.%${t}%,response.ilike.%${t}%`);
      const { data } = await q.order("created_at", { ascending: false }).limit(200);
      return (data ?? []) as Exchange[];
    },
  });

  const activity = useQuery<Activity[]>({
    queryKey: ["admin-portal", "deep-memory", "activity", term],
    enabled: isSuper && tab === "activity",
    queryFn: async () => {
      const t = term.trim();
      let q = adb.from("activity_events").select("id,user_id,event_type,metadata,created_at");
      if (t) q = q.ilike("event_type", `%${t}%`);
      const { data } = await q.order("created_at", { ascending: false }).limit(200);
      return (data ?? []) as Activity[];
    },
  });

  return (
    <AdminShell
      title="Deep learn memory"
      description="Every prompt asked, every AI response given and site activity, kept for deep learning."
    >
      {!isSuper ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm">This record is available to Super Admins only.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-border bg-card p-1">
              {(["ai", "activity"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`rounded px-3 py-1 text-sm ${tab === k ? "bg-muted font-medium" : ""}`}
                >
                  {k === "ai" ? "Prompts & responses" : "Site activity"}
                </button>
              ))}
            </div>
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={tab === "ai" ? "Search prompts, responses or source…" : "Filter by event type…"}
              className="h-9 w-full sm:w-72"
            />
          </div>

          {tab === "ai" ? (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="border-b border-border bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Member</th>
                    <th className="px-3 py-2 font-medium">Prompt</th>
                    <th className="px-3 py-2 font-medium">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {(exchanges.data ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center">
                        {exchanges.isLoading ? "Loading…" : "Nothing recorded yet."}
                      </td>
                    </tr>
                  ) : (
                    (exchanges.data ?? []).map((e) => {
                      const open = openId === e.id;
                      return (
                        <tr
                          key={e.id}
                          onClick={() => setOpenId(open ? null : e.id)}
                          className="cursor-pointer border-b border-border align-top last:border-0 hover:bg-muted/40"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            {new Date(e.created_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {e.surface}
                            {!e.ok && <span className="ml-1 text-xs">(failed)</span>}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {e.user_id ? e.user_id.slice(0, 8) : "signed out"}
                          </td>
                          <td className={`px-3 py-2 ${open ? "whitespace-pre-wrap" : "max-w-[240px] truncate"}`}>
                            {e.prompt ?? "—"}
                          </td>
                          <td className={`px-3 py-2 ${open ? "whitespace-pre-wrap" : "max-w-[320px] truncate"}`}>
                            {e.response ?? "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Event</th>
                    <th className="px-3 py-2 font-medium">Member</th>
                    <th className="px-3 py-2 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(activity.data ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center">
                        {activity.isLoading ? "Loading…" : "Nothing recorded yet."}
                      </td>
                    </tr>
                  ) : (
                    (activity.data ?? []).map((a) => (
                      <tr key={a.id} className="border-b border-border align-top last:border-0">
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2">{a.event_type}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {a.user_id ? a.user_id.slice(0, 8) : "signed out"}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{JSON.stringify(a.metadata ?? {})}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs">
            Showing the 200 most recent entries. Records are kept permanently and cannot be edited from here.
          </p>
        </>
      )}
    </AdminShell>
  );
}
