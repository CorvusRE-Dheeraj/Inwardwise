create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  category text not null,
  label text not null
);

create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.admin_role_permissions (
  role_id uuid not null references public.admin_roles(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create type public.employee_status as enum ('active','inactive');

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  phone text,
  role_id uuid references public.admin_roles(id) on delete set null,
  is_super_admin boolean not null default false,
  department text,
  status public.employee_status not null default 'active',
  joining_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index employees_user_id_idx on public.employees(user_id);

create or replace function public.is_active_staff(_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.employees e where e.user_id = _user and e.status = 'active');
$$;

create or replace function public.is_super_admin(_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.employees e where e.user_id = _user and e.status = 'active' and e.is_super_admin);
$$;

create or replace function public.admin_has_perm(_user uuid, _perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin(_user) or exists (
    select 1 from public.employees e
    join public.admin_role_permissions rp on rp.role_id = e.role_id
    join public.admin_permissions p on p.id = rp.permission_id
    where e.user_id = _user and e.status = 'active' and p.key = _perm
  );
$$;

create or replace function public.my_admin_context()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((
    select jsonb_build_object(
      'employee_id', e.id,
      'name', e.name,
      'email', e.email,
      'status', e.status,
      'is_super_admin', e.is_super_admin,
      'role', coalesce(r.name, 'Unassigned'),
      'permissions', coalesce((
        case when e.is_super_admin then (select jsonb_agg(p.key) from public.admin_permissions p)
        else (select coalesce(jsonb_agg(p2.key), '[]'::jsonb)
              from public.admin_role_permissions rp
              join public.admin_permissions p2 on p2.id = rp.permission_id
              where rp.role_id = e.role_id) end), '[]'::jsonb)
    )
    from public.employees e
    left join public.admin_roles r on r.id = e.role_id
    where e.user_id = auth.uid() and e.status = 'active'
  ), 'null'::jsonb);
$$;

create or replace function public.claim_super_admin_if_none()
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); em text;
begin
  if uid is null then return false; end if;
  if exists (select 1 from public.employees) then
    return public.is_active_staff(uid);
  end if;
  select u.email into em from auth.users u where u.id = uid;
  insert into public.employees (user_id, name, email, is_super_admin, status, role_id, joining_date)
  values (uid, coalesce(em, 'Owner'), coalesce(em, uid::text), true, 'active',
          (select id from public.admin_roles where name = 'Super Admin'), current_date);
  return true;
end; $$;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text, industry text, company_size text,
  email text, phone text, address text,
  status text not null default 'active',
  notes text,
  assigned_employee_id uuid references public.employees(id) on delete set null,
  created_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text, phone text, position text,
  company_id uuid references public.companies(id) on delete set null,
  lead_source text,
  tags text[] not null default '{}',
  notes text,
  assigned_employee_id uuid references public.employees(id) on delete set null,
  created_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  campaign_type text not null default 'email',
  description text,
  start_date date, end_date date,
  owner_employee_id uuid references public.employees(id) on delete set null,
  budget numeric(12,2),
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_id uuid references public.companies(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  email text, phone text,
  source text,
  status text not null default 'new',
  priority text not null default 'medium',
  assigned_employee_id uuid references public.employees(id) on delete set null,
  notes text,
  last_activity_at timestamptz,
  next_follow_up_at timestamptz,
  created_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_status_idx on public.leads(status);
create index leads_assigned_idx on public.leads(assigned_employee_id);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_id uuid references public.companies(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  value numeric(12,2) not null default 0,
  probability int not null default 0,
  expected_close_date date,
  stage text not null default 'lead',
  assigned_employee_id uuid references public.employees(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null default 'note',
  subject text not null,
  body text,
  occurred_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now()
);
create index activities_lead_idx on public.activities(lead_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_employee_id uuid references public.employees(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  priority text not null default 'medium',
  status text not null default 'not_started',
  due_date timestamptz,
  created_by uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_status_idx on public.tasks(status);

create table public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  source text, medium text,
  status text not null default 'new',
  converted boolean not null default false,
  assigned_employee_id uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index admin_notifications_employee_idx on public.admin_notifications(employee_id, read_at);

create table public.admin_saved_views (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  module text not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  actor_email text,
  action text not null,
  module text not null,
  record_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

do $$ declare t text;
begin
  foreach t in array array['employees','companies','contacts','campaigns','leads','opportunities','tasks','marketing_leads']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.update_updated_at_column()', 'set_updated_at_'||t, t);
  end loop;
end $$;

grant select, insert, update, delete on public.employees, public.admin_roles, public.admin_permissions,
  public.admin_role_permissions, public.companies, public.contacts, public.campaigns, public.leads,
  public.opportunities, public.activities, public.tasks, public.marketing_leads,
  public.admin_notifications, public.admin_saved_views, public.audit_logs to authenticated;
grant all on public.employees, public.admin_roles, public.admin_permissions,
  public.admin_role_permissions, public.companies, public.contacts, public.campaigns, public.leads,
  public.opportunities, public.activities, public.tasks, public.marketing_leads,
  public.admin_notifications, public.admin_saved_views, public.audit_logs to service_role;

alter table public.employees enable row level security;
alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.marketing_leads enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.admin_saved_views enable row level security;
alter table public.audit_logs enable row level security;

create policy "staff read employees" on public.employees for select to authenticated
  using (public.is_active_staff(auth.uid()));
create policy "manage employees create" on public.employees for insert to authenticated
  with check (public.admin_has_perm(auth.uid(), 'employees.create'));
create policy "manage employees edit" on public.employees for update to authenticated
  using (public.admin_has_perm(auth.uid(), 'employees.edit') and (not is_super_admin or public.is_super_admin(auth.uid())))
  with check (public.admin_has_perm(auth.uid(), 'employees.edit') and (not is_super_admin or public.is_super_admin(auth.uid())));
create policy "no employee deletes" on public.employees for delete to authenticated using (false);

create policy "staff read roles" on public.admin_roles for select to authenticated using (public.is_active_staff(auth.uid()));
create policy "super admin write roles" on public.admin_roles for all to authenticated
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));
create policy "staff read permissions" on public.admin_permissions for select to authenticated using (public.is_active_staff(auth.uid()));
create policy "super admin write permissions" on public.admin_permissions for all to authenticated
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));
create policy "staff read role perms" on public.admin_role_permissions for select to authenticated using (public.is_active_staff(auth.uid()));
create policy "super admin write role perms" on public.admin_role_permissions for all to authenticated
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));

do $$ declare t text;
begin
  foreach t in array array['companies','contacts','leads','opportunities','activities']
  loop
    execute format($f$create policy "crm view %1$s" on public.%1$I for select to authenticated using (public.admin_has_perm(auth.uid(),'crm.view'))$f$, t);
    execute format($f$create policy "crm create %1$s" on public.%1$I for insert to authenticated with check (public.admin_has_perm(auth.uid(),'crm.create'))$f$, t);
    execute format($f$create policy "crm edit %1$s" on public.%1$I for update to authenticated using (public.admin_has_perm(auth.uid(),'crm.edit')) with check (public.admin_has_perm(auth.uid(),'crm.edit'))$f$, t);
    execute format($f$create policy "crm delete %1$s" on public.%1$I for delete to authenticated using (public.admin_has_perm(auth.uid(),'crm.delete'))$f$, t);
  end loop;
  foreach t in array array['campaigns','marketing_leads']
  loop
    execute format($f$create policy "mkt view %1$s" on public.%1$I for select to authenticated using (public.admin_has_perm(auth.uid(),'marketing.view'))$f$, t);
    execute format($f$create policy "mkt create %1$s" on public.%1$I for insert to authenticated with check (public.admin_has_perm(auth.uid(),'marketing.create'))$f$, t);
    execute format($f$create policy "mkt edit %1$s" on public.%1$I for update to authenticated using (public.admin_has_perm(auth.uid(),'marketing.edit')) with check (public.admin_has_perm(auth.uid(),'marketing.edit'))$f$, t);
    execute format($f$create policy "mkt delete %1$s" on public.%1$I for delete to authenticated using (public.admin_has_perm(auth.uid(),'marketing.delete'))$f$, t);
  end loop;
end $$;

create policy "tasks view" on public.tasks for select to authenticated using (public.admin_has_perm(auth.uid(),'tasks.view'));
create policy "tasks create" on public.tasks for insert to authenticated with check (public.admin_has_perm(auth.uid(),'tasks.create'));
create policy "tasks edit" on public.tasks for update to authenticated using (public.admin_has_perm(auth.uid(),'tasks.edit')) with check (public.admin_has_perm(auth.uid(),'tasks.edit'));
create policy "tasks delete" on public.tasks for delete to authenticated using (public.admin_has_perm(auth.uid(),'tasks.delete'));

create policy "own notifications" on public.admin_notifications for select to authenticated
  using (employee_id in (select id from public.employees where user_id = auth.uid()));
create policy "own notifications update" on public.admin_notifications for update to authenticated
  using (employee_id in (select id from public.employees where user_id = auth.uid()))
  with check (employee_id in (select id from public.employees where user_id = auth.uid()));
create policy "staff create notifications" on public.admin_notifications for insert to authenticated
  with check (public.is_active_staff(auth.uid()));
create policy "own saved views" on public.admin_saved_views for all to authenticated
  using (employee_id in (select id from public.employees where user_id = auth.uid()))
  with check (employee_id in (select id from public.employees where user_id = auth.uid()));

create policy "audit view" on public.audit_logs for select to authenticated using (public.admin_has_perm(auth.uid(),'audit.view'));
create policy "staff write audit" on public.audit_logs for insert to authenticated with check (public.is_active_staff(auth.uid()));
create policy "no audit updates" on public.audit_logs for update to authenticated using (false) with check (false);
create policy "no audit deletes" on public.audit_logs for delete to authenticated using (false);

insert into public.admin_permissions (key, category, label) values
  ('crm.view','CRM','View CRM'),('crm.create','CRM','Create CRM records'),('crm.edit','CRM','Edit CRM records'),
  ('crm.delete','CRM','Delete CRM records'),('crm.export','CRM','Export CRM data'),
  ('marketing.view','Marketing','View marketing'),('marketing.create','Marketing','Create campaigns'),
  ('marketing.edit','Marketing','Edit campaigns'),('marketing.delete','Marketing','Delete campaigns'),
  ('marketing.export','Marketing','Export marketing data'),
  ('tasks.view','Tasks','View tasks'),('tasks.create','Tasks','Create tasks'),('tasks.edit','Tasks','Edit tasks'),('tasks.delete','Tasks','Delete tasks'),
  ('reports.view','Reports','View reports'),
  ('employees.view','Employees','View employees'),('employees.create','Employees','Create employees'),
  ('employees.edit','Employees','Edit employees'),('employees.deactivate','Employees','Deactivate employees'),
  ('settings.view','Settings','View settings'),('settings.manage','Settings','Manage settings'),
  ('audit.view','Settings','View audit logs');

insert into public.admin_roles (name, description, is_system) values
  ('Super Admin','Full access to every module and setting.', true),
  ('Admin','Manages CRM, marketing, tasks and reports.', true),
  ('Employee','Day-to-day CRM and task access.', true);

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p where r.name = 'Super Admin';

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p
where r.name = 'Admin' and p.key not in ('employees.create','employees.edit','employees.deactivate','settings.manage');

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p
where r.name = 'Employee' and p.key in ('crm.view','crm.create','crm.edit','tasks.view','tasks.create','tasks.edit','marketing.view','reports.view');