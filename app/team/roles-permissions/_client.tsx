"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PermissionAdmin } from "@/api/services/permission.service";
import type { RoleItem, PermissionGroup, RoleConfig } from "@/api/types/permission.types";
import { RoleTable } from "@/components/page_ui/role-table";
import dynamic from "next/dynamic";
const RoleForm = dynamic(() => import("@/components/page_ui/role-form").then((m) => m.RoleForm), { ssr: false });
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

type View = "list" | "form";

interface RoleFormData {
  name: string;
  permission_ids: number[];
}

const EMPTY_FORM: RoleFormData = {
  name: "",
  permission_ids: [],
};

export function _Client() {
  const [items, setItems] = useState<RoleItem[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [readOnly, setReadOnly] = useState(false);

  const loadData = () =>
    PermissionAdmin.search()
      .then(setItems)
      .catch(() => toast.error("Failed to load roles"));

  const { data: permissionGroups = [] } = useQuery({
    queryKey: ["roles", "permissions"],
    queryFn: async () => (await PermissionAdmin.listPermissions()) ?? [],
    enabled: view === "form",
    staleTime: Infinity,
  });

  const { data: roleConfigs = [] } = useQuery({
    queryKey: ["roles", "config"],
    queryFn: async () => (await PermissionAdmin.getRoleConfig()) ?? [],
    staleTime: Infinity,
  });

  const codenameToId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const group of permissionGroups) {
      for (const perm of group.permissions) {
        map[perm.codename] = perm.id;
      }
    }
    return map;
  }, [permissionGroups]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setReadOnly(false);
    setView("form");
  };

  const openEdit = async (item: RoleItem) => {
    if (item.is_system) {
      const config = roleConfigs.find((c) => c.role === item.name);
      if (config) {
        const ids = config.permissions
          .map((p) => codenameToId[p.codename])
          .filter((id): id is number => id !== undefined);
        setForm({ name: item.name, permission_ids: ids });
        setReadOnly(true);
        setView("form");
      }
      return;
    }
    try {
      const detail = await PermissionAdmin.get(item.id!);
      setForm({ name: detail.name, permission_ids: detail.permissions.map((p) => p.id) });
      setEditingId(item.id);
      setReadOnly(false);
      setView("form");
    } catch {
      toast.error("Failed to load role details");
    }
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setDeleteId(null);
    setReadOnly(false);
    setView("list");
  };

  const handleChange = (field: string, value: string | number[]) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (editingId !== null) return next;
      if (field !== "name" || typeof value !== "string") return next;
      const config = roleConfigs.find((c) => c.role === value);
      if (!config) return next;
      const ids = config.permissions
        .map((p) => codenameToId[p.codename])
        .filter((id): id is number => id !== undefined);
      return { ...next, permission_ids: ids };
    });
  };

  const save = async () => {
    if (readOnly || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await PermissionAdmin.update(editingId, form);
        toast.success("Role updated");
      } else {
        await PermissionAdmin.create(form);
        toast.success("Role created");
      }
      await loadData();
      back();
    } catch (err: unknown) {
      let msg = "Something went wrong";
      if (axios.isAxiosError<{ detail?: string; name?: string[] }>(err) && err.response?.data) {
        msg = err.response.data.detail ?? err.response.data.name?.[0] ?? msg;
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      await PermissionAdmin.delete(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success("Role deleted");
    } catch (err: unknown) {
      let msg = "Failed to delete role";
      if (axios.isAxiosError<{ detail?: string }>(err) && err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      toast.error(msg);
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="px-4 py-12 flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Roles & Permissions</h1>
              <p className="text-xs text-gray-500 mt-1">Manage user roles and their permissions</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-sidebar-primary border-sidebar-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Role
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {items.length} {items.length === 1 ? "item" : "items"} found.
            </p>
          </div>

          <RoleTable
            items={items.filter((r) =>
              !search || r.name.toLowerCase().includes(search.toLowerCase())
            )}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteId={deleteId}
            setDeleteId={setDeleteId}
          />
        </div>
      ) : (
        <div className="px-4">
          <RoleForm
            form={form}
            editingId={editingId}
            saving={saving}
            readOnly={readOnly}
            permissionGroups={permissionGroups}
            roleConfigs={roleConfigs}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
