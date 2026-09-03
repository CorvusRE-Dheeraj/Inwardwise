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

export const Route = createFileRoute("/admin/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — InwardWise Admin" },
      { name: "description", content: "Assign work, track due dates and completion." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Tasks — InwardWise Admin" },
      { property: "og:description", content: "Assign work, track due dates and completion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CONFIG: CrudConfig = {
  table: "tasks",
  module: "tasks",
  singular: "Task",
  searchColumn: "title",
  orderBy: { column: "due_date", ascending: true },
  permissions: { view: "tasks.view", create: "tasks.create", edit: "tasks.edit", delete: "tasks.delete" },
  fields: [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "status", label: "Status", type: "select", options: TASK_STATUSES, filterable: true },
    { key: "priority", label: "Priority", type: "select", options: PRIORITIES, filterable: true },
    { key: "due_date", label: "Due", type: "datetime" },
    { key: "assigned_employee_id", label: "Assigned to", type: "ref", ref: { table: "employees", labelColumns: ["name"] }, filterable: true },
    { key: "lead_id", label: "Related lead", type: "ref", ref: { table: "leads", labelColumns: ["name"] }, inList: false },
    { key: "description", label: "Description", type: "textarea", inList: false },
  ],
};

function Page() {
  return (
    <AdminShell title="Tasks" description="Assign work, track due dates and completion." requirePermission="tasks.view">
      <CrudModule config={CONFIG} />
    </AdminShell>
  );
}
