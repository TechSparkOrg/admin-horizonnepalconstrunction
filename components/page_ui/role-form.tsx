"use client";

import { CheckSquare, Square, ChevronDown } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PermissionGroup } from "@/api/types/permission.types";

interface RoleFormData {
  name: string;
  permission_ids: number[];
}

interface Props {
  form: RoleFormData;
  editingId: number | null;
  saving: boolean;
  permissionGroups: PermissionGroup[];
  onChange: (field: string, value: string | number[]) => void;
  onSave: () => void;
  onBack: () => void;
}

export function RoleForm({
  form,
  editingId,
  saving,
  permissionGroups,
  onChange,
  onSave,
  onBack,
}: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (resource: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(resource)) next.delete(resource);
      else next.add(resource);
      return next;
    });
  };

  const allPermIds = (group: PermissionGroup) => group.permissions.map((p) => p.id);

  const ids = form.permission_ids ?? [];

  const groupFullySelected = (group: PermissionGroup) =>
    allPermIds(group).every((id) => ids.includes(id));

  const groupPartiallySelected = (group: PermissionGroup) =>
    allPermIds(group).some((id) => ids.includes(id)) && !groupFullySelected(group);

  const toggleGroup = (group: PermissionGroup) => {
    const groupIds = allPermIds(group);
    if (groupFullySelected(group)) {
      onChange("permission_ids", ids.filter((id) => !groupIds.includes(id)));
    } else {
      const existing = new Set(ids);
      groupIds.forEach((id) => existing.add(id));
      onChange("permission_ids", Array.from(existing));
    }
  };

  const togglePermission = (permId: number) => {
    const set = new Set(ids);
    if (set.has(permId)) set.delete(permId);
    else set.add(permId);
    onChange("permission_ids", Array.from(set));
  };

  const canSave = form.name.trim() && !saving;

  return (
    <div>
      <FormHeader
        breadcrumb="Roles & Permissions"
        title={editingId ? form.name || "Edit Role" : "New Role"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!canSave}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <div className="space-y-4">
        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Role Name</Label>
              <Input
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="e.g. editor, moderator"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Permissions</Label>
              <span className="text-xs text-gray-400">{(form.permission_ids ?? []).length} selected</span>
            </div>
            <ScrollArea className="h-[500px] pr-3">
              <div className="space-y-2">
                {permissionGroups.map((group) => {
                  const collapsedGroup = collapsed.has(group.resource);
                  const selectedPerms = group.permissions.filter((p) => ids.includes(p.id));
                  const selectedCount = selectedPerms.length;
                  return (
                    <div key={group.resource} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(group.resource)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition text-left"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleGroup(group); }}
                            className="text-gray-400 hover:text-sidebar-primary transition shrink-0"
                          >
                            {groupFullySelected(group) ? (
                              <CheckSquare className="size-4 text-sidebar-primary" />
                            ) : groupPartiallySelected(group) ? (
                              <CheckSquare className="size-4 text-sidebar-primary/60" />
                            ) : (
                              <Square className="size-4" />
                            )}
                          </button>
                          <span className="text-sm font-medium text-gray-900">{group.label}</span>
                          <span className="text-xs text-gray-400">({selectedCount}/{group.permissions.length})</span>
                          {selectedPerms.slice(0, 3).map((p) => (
                            <span
                              key={p.id}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-primary/10 text-sidebar-primary font-medium whitespace-nowrap"
                            >
                              {p.name.replace(/^Can\s+/i, "")}
                            </span>
                          ))}
                          {selectedPerms.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                              +{selectedPerms.length - 3}
                            </span>
                          )}
                        </div>
                        <ChevronDown className={`size-4 text-gray-400 transition ${collapsedGroup ? "" : "rotate-180"}`} />
                      </button>
                      {!collapsedGroup && (
                        <div className="px-4 py-2 space-y-1">
                          {group.permissions.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 py-1 cursor-pointer hover:text-gray-900 transition"
                            >
                              <input
                                type="checkbox"
                                checked={ids.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="accent-sidebar-primary w-3.5 h-3.5"
                              />
                              <span className="text-xs text-gray-600">{perm.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
