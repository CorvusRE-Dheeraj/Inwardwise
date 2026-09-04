import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Services, InwardWise" },
      { name: "description", content: "Explore the services where InwardWise helps, from individual development and wellbeing to business, medical, and family decisions." },
      { property: "og:title", content: "Services, InwardWise" },
      { property: "og:description", content: "Structured decision help across life, work and society." },
    ],
  }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
