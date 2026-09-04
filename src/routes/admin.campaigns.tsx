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

export const Route = createFileRoute("/admin/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns, InwardWise Admin" },
      { name: "description", content: "Marketing campaigns, budgets and run dates." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Campaigns, InwardWise Admin" },
      { property: "og:description", content: "Marketing campaigns, budgets and run dates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "campaigns",
  module: "campaigns",
  singular: "Campaign",
  searchColumn: "name",
  permissions: { view: "marketing.view", create: "marketing.create", edit: "marketing.edit", delete: "marketing.delete", export: "marketing.export" },
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "campaign_type", label: "Channel", type: "select", options: CAMPAIGN_TYPES, filterable: true },
    { key: "status", label: "Status", type: "select", options: CAMPAIGN_STATUSES, filterable: true },
    { key: "start_date", label: "Start", type: "date" },
    { key: "end_date", label: "End", type: "date" },
    { key: "budget", label: "Budget", type: "number" },
    { key: "owner_employee_id", label: "Owner", type: "ref", ref: { table: "employees", labelColumns: ["name"] }, inList: false },
    { key: "description", label: "Description", type: "textarea", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Campaigns" description="Marketing campaigns, budgets and run dates." requirePermission="marketing.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
