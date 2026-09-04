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

export const Route = createFileRoute("/admin/activities")({
  head: () => ({
    meta: [
      { title: "Activities, InwardWise Admin" },
      { name: "description", content: "Calls, emails, meetings and notes logged against records." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Activities, InwardWise Admin" },
      { property: "og:description", content: "Calls, emails, meetings and notes logged against records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "activities",
  module: "activities",
  singular: "Activity",
  searchColumn: "subject",
  orderBy: { column: "occurred_at", ascending: false },
  permissions: { view: "crm.view", create: "crm.create", edit: "crm.edit", delete: "crm.delete", export: "crm.export" },
  fields: [
    { key: "subject", label: "Subject", type: "text", required: true },
    { key: "activity_type", label: "Type", type: "select", options: ACTIVITY_TYPES, filterable: true },
    { key: "occurred_at", label: "When", type: "datetime", required: true },
    { key: "lead_id", label: "Lead", type: "ref", ref: { table: "leads", labelColumns: ["name"] } },
    { key: "contact_id", label: "Contact", type: "ref", ref: { table: "contacts", labelColumns: ["first_name", "last_name"] }, inList: false },
    { key: "company_id", label: "Company", type: "ref", ref: { table: "companies", labelColumns: ["name"] }, inList: false },
    { key: "body", label: "Details", type: "textarea", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Activities" description="Calls, emails, meetings and notes logged against records." requirePermission="crm.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
