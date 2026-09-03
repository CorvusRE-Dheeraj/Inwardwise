import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { adb, logAudit } from "@/lib/admin-db";
import { useAdmin } from "@/hooks/useAdmin";
import { labelOf, type Option, type PermissionKey } from "@/lib/admin-portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type Field = {
  key: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "number" | "date" | "datetime" | "select" | "ref";
  options?: Option[];
  ref?: { table: string; labelColumns: string[] };
  required?: boolean;
  inList?: boolean;
  filterable?: boolean;
  placeholder?: string;
};

export type CrudConfig = {
  table: string;
  module: string;
  singular: string;
  searchColumn: string;
  orderBy?: { column: string; ascending?: boolean };
  fields: Field[];
  permissions: { view: PermissionKey; create: PermissionKey; edit: PermissionKey; delete: PermissionKey; export?: PermissionKey };
};

type Row = Record<string, unknown>;

function useRefOptions(fields: Field[]) {
  const refs = fields.filter((f) => f.type === "ref" && f.ref);
  return useQuery({
    queryKey: ["admin-portal", "refs", refs.map((r) => r.ref!.table).join(",")],
    enabled: refs.length > 0,
    staleTime: 120_000,
    queryFn: async () => {
      const map: Record<string, Option[]> = {};
      await Promise.all(
        refs.map(async (f) => {
          const cols = ["id", ...f.ref!.labelColumns].join(",");
          const { data } = await adb.from(f.ref!.table).select(cols).limit(500);
          map[f.key] = ((data ?? []) as Row[]).map((r) => ({
            value: String(r.id),
            label: f.ref!.labelColumns.map((c) => r[c]).filter(Boolean).join(" ") || String(r.id),
          }));
        }),
      );
      return map;
    },
  });
}

function formatCell(field: Field, value: unknown, refOptions: Record<string, Option[]>) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "select") return labelOf(field.options ?? [], String(value));
  if (field.type === "ref") return labelOf(refOptions[field.key] ?? [], String(value));
  if (field.type === "date") return new Date(String(value)).toLocaleDateString();
  if (field.type === "datetime") return new Date(String(value)).toLocaleString();
  return String(value);
}

export function CrudModule({ config }: { config: CrudConfig }) {
  const { context, can } = useAdmin();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const refQuery = useRefOptions(config.fields);
  const refOptions = refQuery.data ?? {};

  const listFields = useMemo(() => config.fields.filter((f) => f.inList !== false).slice(0, 6), [config.fields]);
  const filterFields = useMemo(() => config.fields.filter((f) => f.filterable), [config.fields]);

  const queryKey = ["admin-portal", config.table, search, filters];
  const { data: rows = [], isLoading } = useQuery<Row[]>({
    queryKey,
    queryFn: async () => {
      let q = adb.from(config.table).select("*");
      if (search.trim()) q = q.ilike(config.searchColumn, `%${search.trim()}%`);
      for (const [k, v] of Object.entries(filters)) if (v) q = q.eq(k, v);
      const order = config.orderBy ?? { column: "created_at", ascending: false };
      q = q.order(order.column, { ascending: order.ascending ?? false }).limit(200);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });

  const openCreate = () => {
    setForm({});
    setCreating(true);
  };
  const openEdit = (row: Row) => {
    const next: Record<string, string> = {};
    for (const f of config.fields) {
      const v = row[f.key];
      next[f.key] = v === null || v === undefined ? "" : String(v).slice(0, f.type === "date" ? 10 : undefined);
    }
    setForm(next);
    setEditing(row);
  };

  const save = async () => {
    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = form[f.key];
      if (f.required && !raw) {
        toast.error(`${f.label} is required.`);
        return;
      }
      payload[f.key] = raw === "" || raw === undefined ? null : f.type === "number" ? Number(raw) : raw;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await adb.from(config.table).update(payload).eq("id", editing.id as string);
        if (error) throw new Error(error.message);
        await logAudit({
          employeeId: context?.employee_id ?? null,
          actorEmail: context?.email,
          action: "update",
          module: config.module,
          recordId: String(editing.id),
        });
        toast.success(`${config.singular} updated.`);
      } else {
        const { data, error } = await adb.from(config.table).insert(payload).select("id").single();
        if (error) throw new Error(error.message);
        await logAudit({
          employeeId: context?.employee_id ?? null,
          actorEmail: context?.email,
          action: "create",
          module: config.module,
          recordId: data?.id ?? null,
        });
        toast.success(`${config.singular} created.`);
      }
      setEditing(null);
      setCreating(false);
      qc.invalidateQueries({ queryKey: ["admin-portal", config.table] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      const { error } = await adb.from(config.table).delete().eq("id", deleting.id as string);
      if (error) throw new Error(error.message);
      await logAudit({
        employeeId: context?.employee_id ?? null,
        actorEmail: context?.email,
        action: "delete",
        module: config.module,
        recordId: String(deleting.id),
      });
      toast.success(`${config.singular} deleted.`);
      qc.invalidateQueries({ queryKey: ["admin-portal", config.table] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setDeleting(null);
    }
  };

  const exportCsv = () => {
    const cols = config.fields.map((f) => f.key);
    const head = config.fields.map((f) => f.label).join(",");
    const body = rows
      .map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.table}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dialogOpen = creating || !!editing;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="h-9 w-full sm:w-64"
        />
        {filterFields.map((f) => (
          <select
            key={f.key}
            value={filters[f.key] ?? ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">All {f.label.toLowerCase()}</option>
            {(f.options ?? refOptions[f.key] ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        <div className="ml-auto flex gap-2">
          {config.permissions.export && can(config.permissions.export) && (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          )}
          {can(config.permissions.create) && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> New {config.singular.toLowerCase()}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              {listFields.map((f) => (
                <th key={f.key} className="px-3 py-2 font-medium">
                  {f.label}
                </th>
              ))}
              <th className="w-24 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={listFields.length + 1} className="px-3 py-8 text-center">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={listFields.length + 1} className="px-3 py-8 text-center text-muted-foreground">
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={String(row.id)} className="border-b border-border last:border-0 hover:bg-muted/40">
                  {listFields.map((f) => (
                    <td key={f.key} className="px-3 py-2 align-top">
                      {formatCell(f, row[f.key], refOptions)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    {can(config.permissions.edit) && (
                      <button className="rounded p-1 hover:bg-muted" onClick={() => openEdit(row)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {can(config.permissions.delete) && (
                      <button
                        className="rounded p-1 text-destructive hover:bg-muted"
                        onClick={() => setDeleting(row)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}
            </DialogTitle>
            <DialogDescription>All changes are recorded in the audit log.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {config.fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.key}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                ) : f.type === "select" || f.type === "ref" ? (
                  <select
                    id={f.key}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Not set</option>
                    {(f.options ?? refOptions[f.key] ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={f.key}
                    type={
                      f.type === "datetime"
                        ? "datetime-local"
                        : f.type === "date"
                          ? "date"
                          : f.type === "number"
                            ? "number"
                            : f.type
                    }
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {config.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
