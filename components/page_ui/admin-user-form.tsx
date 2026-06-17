"use client";

import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { PasswordInput } from "@/components/global_ui/password-input";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StaffAdmin } from "@/api/services/staff.service";
import type { StaffMember } from "@/api/types/staff.types";

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
  const [coreStaff, setCoreStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    StaffAdmin.search({ type: "core", page_size: 200 })
      .then((res) => setCoreStaff(res.results ?? []))
      .catch(() => {});
  }, []);

  const canSave = form.name.trim() && form.email.trim() && form.currentPassword.trim() && !saving;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Admin Users</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingId ? form.name || "Edit User" : "New User"}
            </h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!canSave} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      {isSuperuser && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <ShieldAlert className="size-4 shrink-0" />
          <span>Superadmin accounts cannot be modified via this form.</span>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="password" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Password
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => onChange("name", e.target.value)}
                      placeholder="Full name"
                      disabled={isSuperuser}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
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
                    <Label>Role</Label>
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
                    <Select
                      value={form.staffMemberId ?? "none"}
                      onValueChange={(v) => onChange("staffMemberId", v === "none" ? null : v)}
                      disabled={isSuperuser}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Select core team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {coreStaff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} {s.designation ? `— ${s.designation}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <Label>{editingId ? "New Password (optional)" : "Password"}</Label>
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
                  <Label>Current Password</Label>
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
