import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Areas — Decision Philosophy" },
      { name: "description", content: "Explore areas where the Decision Philosophy framework can help — from individual development to business, medical, and family decisions." },
      { property: "og:title", content: "Areas — Decision Philosophy" },
      { property: "og:description", content: "Structured decision help across life, work and society." },
    ],
  }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
