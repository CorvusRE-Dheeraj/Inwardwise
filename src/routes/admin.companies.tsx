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

export const Route = createFileRoute("/admin/companies")({
  head: () => ({
    meta: [
      { title: "Companies, InwardWise Admin" },
      { name: "description", content: "Organisations and accounts in your pipeline." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Companies, InwardWise Admin" },
      { property: "og:description", content: "Organisations and accounts in your pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "companies",
  module: "companies",
  singular: "Company",
  searchColumn: "name",
  permissions: { view: "crm.view", create: "crm.create", edit: "crm.edit", delete: "crm.delete", export: "crm.export" },
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "industry", label: "Industry", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "status", label: "Status", type: "select", options: COMPANY_STATUSES, filterable: true },
    { key: "website", label: "Website", type: "text", inList: false },
    { key: "company_size", label: "Company size", type: "text", inList: false },
    { key: "address", label: "Address", type: "textarea", inList: false },
    { key: "assigned_employee_id", label: "Account owner", type: "ref", ref: { table: "employees", labelColumns: ["name"] }, inList: false },
    { key: "notes", label: "Notes", type: "textarea", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Companies" description="Organisations and accounts in your pipeline." requirePermission="crm.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
