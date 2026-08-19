import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Services — Inwardwise" },
      { name: "description", content: "Explore the services where Inwardwise helps — from individual development and wellbeing to business, medical, and family decisions." },
      { property: "og:title", content: "Services — Inwardwise" },
      { property: "og:description", content: "Structured decision help across life, work and society." },
    ],
  }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
