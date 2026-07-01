"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuthStore } from "@/app/store/auth-store";
import { AdminUserAdmin } from "@/api/services/admin-user.service";
import { PermissionAdmin } from "@/api/services/permission.service";
import type { AdminUser } from "@/api/types/admin-user.types";
import { AdminUserTable } from "@/components/page_ui/admin-user-table";
import dynamic from "next/dynamic";
import type { AdminUserFormData, RoleOption } from "@/components/page_ui/admin-user-form";
const AdminUserForm = dynamic(() => import("@/components/page_ui/admin-user-form").then((m) => m.AdminUserForm), { ssr: false });
const EMPTY_FORM: AdminUserFormData = { name: "", email: "", role: "csr", password: "", currentPassword: "", staffMemberId: null, isActive: true };
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function itemToForm(item: AdminUser): AdminUserFormData {
  return {
    name: item.name,
    email: item.email,
    role: item.role,
    password: "",
    currentPassword: "",
    staffMemberId: item.staff_member_id,
    isActive: item.is_active,
  };
}

function formToPayload(form: AdminUserFormData) {
  const payload: Record<string, unknown> = {
    name: form.name,
    email: form.email,
    role: form.role,
    current_password: form.currentPassword,
    staff_member_id: form.staffMemberId,
    is_active: form.isActive,
  };
  if (form.password) payload.password = form.password;
  return payload;
}

export function _Client() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSuperuser, setEditingSuperuser] = useState(false);
  const [form, setForm] = useState<AdminUserFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const currentUser = useAuthStore((s) => s.user);
  const canDelete = currentUser?.is_superuser === true;

  const searchParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [debouncedSearch, roleFilter, currentPage]);

  const loadData = () =>
    AdminUserAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load data"));

  useEffect(() => {
    loadData();
  }, [searchParams]);

  useEffect(() => {
    PermissionAdmin.search().then((roles) => {
      setRoleOptions(roles.map((r) => ({ value: r.name, label: r.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) })));
    }).catch(() => {});
  }, []);

  const refetch = loadData;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setEditingSuperuser(false);
    setView("form");
  };

  const openEdit = (item: AdminUser) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setEditingSuperuser(item.is_superuser);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | null) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (!form.currentPassword.trim()) {
      toast.error("Current password is required for verification");
      return;
    }
    if (!editingId && !form.password) {
      toast.error("Password is required for new users");
      return;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await AdminUserAdmin.update(editingId, payload);
        toast.success("Admin user updated");
      } else {
        await AdminUserAdmin.create(payload);
        toast.success("Admin user created");
      }
      await refetch();
      back();
    } catch (err: unknown) {
      let msg = "Something went wrong";
      if (axios.isAxiosError<{ current_password?: string[]; detail?: string }>(err) && err.response?.data) {
        msg = err.response.data.current_password?.[0] ?? err.response.data.detail ?? msg;
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await AdminUserAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Admin user deleted");
    } catch (err: unknown) {
      let msg = "Failed to delete";
      if (axios.isAxiosError<{ detail?: string }>(err) && err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      toast.error(msg);
    }
    setDeleteId(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (v: string) => {
    setRoleFilter(v);
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Admin Users</h1>
              <p className="text-xs text-gray-500 mt-1">Manage system admin users and roles</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-sidebar-primary border-sidebar-primary/20"
            >
              <Plus className="w-4 h-4" /> Add User
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <Select
              value={roleFilter}
              onValueChange={handleRoleFilterChange}
            >
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <AdminUserTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteId={deleteId}
            setDeleteId={setDeleteId}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            canDelete={canDelete}
          />
        </div>
      ) : (
        <div className="px-4">
          <AdminUserForm
            form={form}
            editingId={editingId}
            isSuperuser={editingSuperuser}
            saving={saving}
            onChange={handleChange}
            onSave={save}
            onBack={back}
            roleOptions={roleOptions}
          />
        </div>
      )}
    </>
  );
}
