"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { PermissionAdmin } from "@/api/services/permission.service";
import type { RoleItem, PermissionGroup } from "@/api/types/permission.types";
import { RoleTable } from "@/components/page_ui/role-table";
import { RoleForm } from "@/components/page_ui/role-form";
import { Button } from "@/components/ui/button";

type View = "list" | "form";

interface RoleFormData {
  name: string;
  permission_ids: number[];
}

const EMPTY_FORM: RoleFormData = {
  name: "",
  permission_ids: [],
};

export default function RolesPermissionsPage() {
  const [items, setItems] = useState<RoleItem[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () =>
    PermissionAdmin.search()
      .then(setItems)
      .catch(() => toast.error("Failed to load roles"));

  const loadPermissions = () =>
    PermissionAdmin.listPermissions()
      .then(setPermissionGroups)
      .catch(() => toast.error("Failed to load permissions"));

  useEffect(() => {
    Promise.all([loadData(), loadPermissions()])
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = async (item: RoleItem) => {
    try {
      const detail = await PermissionAdmin.get(item.id);
      setForm({ name: detail.name, permission_ids: detail.permissions.map((p) => p.id) });
      setEditingId(item.id);
      setView("form");
    } catch {
      toast.error("Failed to load role details");
    }
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (field: string, value: string | number[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    if (!form.name.trim()) return;
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
              className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
            >
              <Plus className="w-4 h-4" /> Add Role
            </Button>
          </div>

          <RoleTable
            items={items}
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
            permissionGroups={permissionGroups}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
