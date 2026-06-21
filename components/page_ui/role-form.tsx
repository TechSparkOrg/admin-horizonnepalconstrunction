"use client";

import { ChevronDown } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
              <span className="text-xs text-gray-400">{ids.length} selected</span>
            </div>
            <ScrollArea className="h-[500px] pr-3">
              <div className="space-y-2">
                {permissionGroups.map((group) => {
                  const collapsedGroup = collapsed.has(group.resource);
                  const selectedPerms = group.permissions.filter((p) => ids.includes(p.id));
                  const selectedCount = selectedPerms.length;
                  const fullySelected = groupFullySelected(group);
                  const partiallySelected = groupPartiallySelected(group);

                  return (
                    <div key={group.resource} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group)}
                            className={cn(
                              "text-sm font-medium transition",
                              fullySelected
                                ? "text-sidebar-primary"
                                : partiallySelected
                                ? "text-sidebar-primary/70"
                                : "text-gray-900 hover:text-sidebar-primary"
                            )}
                          >
                            {group.label}
                          </button>
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
                        <button
                          type="button"
                          onClick={() => toggleCollapse(group.resource)}
                          className="shrink-0 p-1 -m-1 text-gray-400 hover:text-gray-600 transition"
                        >
                          <ChevronDown className={cn("size-4 transition-transform", !collapsedGroup && "rotate-180")} />
                        </button>
                      </div>
                      {!collapsedGroup && (
                        <div className="px-4 py-2.5 flex flex-wrap gap-1.5">
                          {group.permissions.map((perm) => {
                            const isSelected = ids.includes(perm.id);
                            return (
                              <button
                                key={perm.id}
                                type="button"
                                onClick={() => togglePermission(perm.id)}
                                className={cn(
                                  "text-xs px-2.5 py-1 rounded-lg border transition text-left",
                                  isSelected
                                    ? "border-sidebar-primary/30 bg-sidebar-primary/5 text-sidebar-primary font-medium"
                                    : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                                )}
                              >
                                {perm.name}
                              </button>
                            );
                          })}
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