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

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [
      { title: "Leads, InwardWise Admin" },
      { name: "description", content: "Capture, qualify and assign every inbound and outbound lead." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Leads, InwardWise Admin" },
      { property: "og:description", content: "Capture, qualify and assign every inbound and outbound lead." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "leads",
  module: "leads",
  singular: "Lead",
  searchColumn: "name",
  permissions: { view: "crm.view", create: "crm.create", edit: "crm.edit", delete: "crm.delete", export: "crm.export" },
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "status", label: "Status", type: "select", options: LEAD_STATUSES, filterable: true },
    { key: "priority", label: "Priority", type: "select", options: PRIORITIES, filterable: true },
    { key: "source", label: "Source", type: "select", options: LEAD_SOURCES },
    { key: "assigned_employee_id", label: "Assigned to", type: "ref", ref: { table: "employees", labelColumns: ["name"] }, filterable: true, inList: false },
    { key: "company_id", label: "Company", type: "ref", ref: { table: "companies", labelColumns: ["name"] }, inList: false },
    { key: "campaign_id", label: "Campaign", type: "ref", ref: { table: "campaigns", labelColumns: ["name"] }, inList: false },
    { key: "next_follow_up_at", label: "Next follow-up", type: "datetime", inList: false },
    { key: "notes", label: "Notes", type: "textarea", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Leads" description="Capture, qualify and assign every inbound and outbound lead." requirePermission="crm.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
