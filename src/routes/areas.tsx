import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Areas — Inwardwise" },
      { name: "description", content: "Explore areas where the Inwardwise framework can help — from individual development to business, medical, and family decisions." },
      { property: "og:title", content: "Areas — Inwardwise" },
      { property: "og:description", content: "Structured decision help across life, work and society." },
    ],
  }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
