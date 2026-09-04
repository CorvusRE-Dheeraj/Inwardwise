import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CrudModule, type CrudConfig } from "@/components/admin/CrudModule";
import {
  ACTIVITY_TYPES,
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  COMPANY_STATUSES,
  EMPLOYEE_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  OPPORTUNITY_STAGES,
  PRIORITIES,
  TASK_STATUSES,
} from "@/lib/admin-portal";

export const Route = createFileRoute("/admin/marketing-leads")({
  head: () => ({
    meta: [
      { title: "Marketing leads, InwardWise Admin" },
      { name: "description", content: "Campaign attribution for incoming leads." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Marketing leads, InwardWise Admin" },
      { property: "og:description", content: "Campaign attribution for incoming leads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "marketing_leads",
  module: "marketing_leads",
  singular: "Marketing lead",
  searchColumn: "source",
  permissions: { view: "marketing.view", create: "marketing.create", edit: "marketing.edit", delete: "marketing.delete", export: "marketing.export" },
  fields: [
    { key: "lead_id", label: "Lead", type: "ref", ref: { table: "leads", labelColumns: ["name"] } },
    { key: "campaign_id", label: "Campaign", type: "ref", ref: { table: "campaigns", labelColumns: ["name"] }, filterable: true },
    { key: "source", label: "Source", type: "select", options: LEAD_SOURCES },
    { key: "medium", label: "Medium", type: "text" },
    { key: "status", label: "Status", type: "select", options: LEAD_STATUSES, filterable: true },
  ],
};

function Page() {
  return (
    <AdminShell title="Marketing leads" description="Campaign attribution for incoming leads." requirePermission="marketing.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
