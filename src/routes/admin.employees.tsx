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

export const Route = createFileRoute("/admin/employees")({
  head: () => ({
    meta: [
      { title: "Employees — InwardWise Admin" },
      { name: "description", content: "Staff accounts, roles and access status." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Employees — InwardWise Admin" },
      { property: "og:description", content: "Staff accounts, roles and access status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "employees",
  module: "employees",
  singular: "Employee",
  searchColumn: "name",
  permissions: { view: "employees.view", create: "employees.create", edit: "employees.edit", delete: "employees.deactivate" },
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "Work email", type: "email", required: true },
    { key: "role_id", label: "Role", type: "ref", ref: { table: "admin_roles", labelColumns: ["name"] }, filterable: true },
    { key: "status", label: "Status", type: "select", options: EMPLOYEE_STATUSES, filterable: true },
    { key: "department", label: "Department", type: "text" },
    { key: "phone", label: "Phone", type: "tel", inList: false },
    { key: "joining_date", label: "Joining date", type: "date", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Employees" description="Staff accounts, roles and access status." requirePermission="employees.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
