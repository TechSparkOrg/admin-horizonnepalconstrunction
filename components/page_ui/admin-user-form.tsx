"use client";

import { ShieldAlert } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useState, useEffect, useRef } from "react";
import { PasswordInput } from "@/components/global_ui/password-input";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { StaffAdmin } from "@/api/services/staff.service";
import type { StaffMemberListItem } from "@/api/types/staff.types";

interface AdminUserFormData {
  name: string;
  email: string;
  role: string;
  password: string;
  currentPassword: string;
  staffMemberId: string | null;
  isActive: boolean;
}

export interface RoleOption {
  value: string;
  label: string;
}

interface Props {
  form: AdminUserFormData;
  editingId: string | null;
  isSuperuser: boolean;
  saving: boolean;
  onChange: (key: string, value: string | boolean | null) => void;
  onSave: () => void;
  onBack: () => void;
  roleOptions: RoleOption[];
}

const EMPTY: AdminUserFormData = {
  name: "",
  email: "",
  role: "csr",
  password: "",
  currentPassword: "",
  staffMemberId: null,
  isActive: true,
};

export { EMPTY };
export type { AdminUserFormData };

export function AdminUserForm({
  form,
  editingId,
  isSuperuser,
  saving,
  onChange,
  onSave,
  onBack,
  roleOptions,
}: Props) {
  const [coreStaff, setCoreStaff] = useState<StaffMemberListItem[]>([]);
  const [staffSearch, setStaffSearch] = useState("");

  const debounceFetch = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(debounceFetch.current);
    debounceFetch.current = setTimeout(() => {
      StaffAdmin.search({ type: "core", search: staffSearch || undefined, page_size: 10 })
        .then((res) => setCoreStaff(res.results ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(debounceFetch.current);
  }, [staffSearch]);

  const canSave = form.name.trim() && form.email.trim() && form.currentPassword.trim() && !saving;

  return (
    <div>
      <FormHeader
        breadcrumb="Admin Users"
        title={editingId ? form.name || "Edit User" : "New User"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!canSave}
        saveLabel={editingId ? "Update" : "Create"}
      />

      {isSuperuser && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <ShieldAlert className="size-4 shrink-0" />
          <span>Superadmin accounts cannot be modified via this form.</span>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"password","label":"Password"},{"value":"settings","label":"Settings"}]} />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name <span className="text-red-500">*</span></Label>
                           
                    <Input
                      value={form.name}
                      onChange={(e) => onChange("name", e.target.value)}
                      placeholder="Full name"
                      disabled={isSuperuser}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email <span className="text-red-500">*</span></Label>
                           
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => onChange("email", e.target.value)}
                      placeholder="email@company.com"
                      disabled={isSuperuser}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Role <span className="text-red-500">*</span></Label>
                           
                    <Select
                      value={form.role}
                      onValueChange={(v) => onChange("role", v)}
                      disabled={isSuperuser}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Link Staff Member</Label>
                    <SearchableSelect
                      options={[
                        { value: "", label: "None" },
                        ...coreStaff.map((s) => ({
                          value: s.id,
                          label: s.name + (s.designation ? ` — ${s.designation}` : ""),
                        })),
                      ]}
                      value={form.staffMemberId ?? ""}
                      onChange={(v) => onChange("staffMemberId", v || null)}
                      placeholder="Select core team"
                      searchPlaceholder="Search staff..."
                      disabled={isSuperuser}
                      onSearchChange={setStaffSearch}
                    />
                    <p className="text-xs text-gray-400">Link a core team member to grant system access.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>{editingId ? "New Password (optional)" : "Password"} <span className="text-red-500">*</span></Label>
                         
                  <PasswordInput
                    value={form.password}
                    onChange={(v) => onChange("password", v)}
                    placeholder={editingId ? "Leave blank to keep current" : "Min. 8 characters"}
                    disabled={isSuperuser}
                  />
                  {editingId ? (
                    <p className="text-xs text-gray-400">Leave blank to keep the current password unchanged.</p>
                  ) : (
                    <p className="text-xs text-gray-400">Required. Minimum 8 characters.</p>
                  )}
                </div>
                <div className="border-t border-gray-100" />
                <div className="space-y-1.5">
                  <Label>Current Password <span className="text-red-500">*</span></Label>
                  
                  <PasswordInput
                    value={form.currentPassword}
                    onChange={(v) => onChange("currentPassword", v)}
                    placeholder="Enter your password to confirm"
                  />
                  <p className="text-xs text-gray-400">Verify your identity to {editingId ? "update" : "create"} admin users. Required.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <SegmentedToggle
                    value={form.isActive}
                    onChange={(v) => onChange("isActive", v)}
                    options={[
                      { value: true, label: "Active" },
                      { value: false, label: "Inactive" },
                    ]}
                    disabled={isSuperuser}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
