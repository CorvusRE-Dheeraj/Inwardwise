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

export const Route = createFileRoute("/admin/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities, InwardWise Admin" },
      { name: "description", content: "Deals in flight, with value, stage and expected close." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Opportunities, InwardWise Admin" },
      { property: "og:description", content: "Deals in flight, with value, stage and expected close." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "opportunities",
  module: "opportunities",
  singular: "Opportunity",
  searchColumn: "name",
  permissions: { view: "crm.view", create: "crm.create", edit: "crm.edit", delete: "crm.delete", export: "crm.export" },
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "stage", label: "Stage", type: "select", options: OPPORTUNITY_STAGES, filterable: true },
    { key: "value", label: "Value", type: "number" },
    { key: "probability", label: "Probability %", type: "number" },
    { key: "expected_close_date", label: "Expected close", type: "date" },
    { key: "company_id", label: "Company", type: "ref", ref: { table: "companies", labelColumns: ["name"] }, inList: false },
    { key: "contact_id", label: "Contact", type: "ref", ref: { table: "contacts", labelColumns: ["first_name", "last_name"] }, inList: false },
    { key: "assigned_employee_id", label: "Owner", type: "ref", ref: { table: "employees", labelColumns: ["name"] }, filterable: true, inList: false },
    { key: "notes", label: "Notes", type: "textarea", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Opportunities" description="Deals in flight, with value, stage and expected close." requirePermission="crm.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
