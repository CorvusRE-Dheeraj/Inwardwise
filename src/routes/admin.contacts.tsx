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

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts, InwardWise Admin" },
      { name: "description", content: "People you talk to, linked to their companies." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Contacts, InwardWise Admin" },
      { property: "og:description", content: "People you talk to, linked to their companies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "contacts",
  module: "contacts",
  singular: "Contact",
  searchColumn: "first_name",
  permissions: { view: "crm.view", create: "crm.create", edit: "crm.edit", delete: "crm.delete", export: "crm.export" },
  fields: [
    { key: "first_name", label: "First name", type: "text", required: true },
    { key: "last_name", label: "Last name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "position", label: "Position", type: "text" },
    { key: "company_id", label: "Company", type: "ref", ref: { table: "companies", labelColumns: ["name"] }, filterable: true },
    { key: "lead_source", label: "Source", type: "select", options: LEAD_SOURCES, inList: false },
    { key: "assigned_employee_id", label: "Assigned to", type: "ref", ref: { table: "employees", labelColumns: ["name"] }, inList: false },
    { key: "notes", label: "Notes", type: "textarea", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Contacts" description="People you talk to, linked to their companies." requirePermission="crm.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
