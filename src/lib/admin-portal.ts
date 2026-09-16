// Shared configuration for the internal Admin / Employee portal.
// Keep this file free of React so it can be imported anywhere.

export type PermissionKey =
  | "crm.view" | "crm.create" | "crm.edit" | "crm.delete" | "crm.export"
  | "marketing.view" | "marketing.create" | "marketing.edit" | "marketing.delete" | "marketing.export"
  | "tasks.view" | "tasks.create" | "tasks.edit" | "tasks.delete"
  | "reports.view"
  | "employees.view" | "employees.create" | "employees.edit" | "employees.deactivate"
  | "settings.view" | "settings.manage"
  | "audit.view";

export type Option = { value: string; label: string };

export const LEAD_STATUSES: Option[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export const PRIORITIES: Option[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const LEAD_SOURCES: Option[] = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "campaign", label: "Campaign" },
  { value: "event", label: "Event" },
  { value: "cold_outreach", label: "Cold outreach" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

export const OPPORTUNITY_STAGES: Option[] = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "discovery", label: "Discovery" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const ACTIVITY_TYPES: Option[] = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "follow_up", label: "Follow-up" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
];

export const TASK_STATUSES: Option[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const CAMPAIGN_STATUSES: Option[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export const CAMPAIGN_TYPES: Option[] = [
  { value: "email", label: "Email" },
  { value: "social", label: "Social media" },
  { value: "google_ads", label: "Google Ads" },
  { value: "meta_ads", label: "Facebook / Instagram Ads" },
  { value: "content", label: "Content" },
  { value: "seo", label: "SEO" },
  { value: "other", label: "Other" },
];

export const COMPANY_STATUSES: Option[] = [
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Active customer" },
  { value: "inactive", label: "Inactive" },
];

export const EMPLOYEE_STATUSES: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function labelOf(options: Option[], value: string | null | undefined): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export type NavItem = {
  label: string;
  to: string;
  permission?: PermissionKey;
  superAdminOnly?: boolean;
};
export type NavGroup = { label: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", to: "/admin/dashboard" }] },
  {
    label: "CRM",
    items: [
      { label: "Leads", to: "/admin/leads", permission: "crm.view" },
      { label: "Contacts", to: "/admin/contacts", permission: "crm.view" },
      { label: "Companies", to: "/admin/companies", permission: "crm.view" },
      { label: "Opportunities", to: "/admin/opportunities", permission: "crm.view" },
      { label: "Activities", to: "/admin/activities", permission: "crm.view" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Campaigns", to: "/admin/campaigns", permission: "marketing.view" },
      { label: "Marketing leads", to: "/admin/marketing-leads", permission: "marketing.view" },
    ],
  },
  { label: "Tasks", items: [{ label: "Tasks", to: "/admin/tasks", permission: "tasks.view" }] },
  {
    label: "My Journey",
    items: [
      { label: "Content library", to: "/admin/journey-content", permission: "settings.manage" },
      { label: "People Like Me", to: "/admin/people-like-me", permission: "settings.view" },
    ],
  },
  { label: "Reports", items: [{ label: "Reports", to: "/admin/reports", permission: "reports.view" }] },
  {
    label: "Team",
    items: [
      { label: "Employees", to: "/admin/employees", permission: "employees.view" },
      { label: "Roles & permissions", to: "/admin/roles", permission: "employees.view" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", to: "/admin/settings", permission: "settings.view" },
      { label: "Audit logs", to: "/admin/audit-logs", permission: "audit.view" },
      { label: "Deep learn memory", to: "/admin/deep-memory", superAdminOnly: true },
    ],
  },
];
