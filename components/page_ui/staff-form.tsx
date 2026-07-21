"use client";

import { ImagePlus, X, Plus, Trash2 } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import type { StaffType, StaffSocialLink } from "@/api/types/staff.types";
import { STAFF_TYPE_OPTIONS } from "@/api/types/staff.types";

import { useAttributeOptions } from "@/api/hooks/use-attribute-query";
import { cn } from "@/lib/utils";
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";

interface StaffFormData {
  name: string;
  employeeId: string;
  type: StaffType;
  role: string;
  department: string;
  joiningDate: string;
  currentlyWorking: boolean;
  endDate: string;
  photo: string;
  email: string;
  phone: string;
  socialLinks: StaffSocialLink[];
  salaryAmount: string;
  isActive: boolean;
  showOnPublic: boolean;
}

interface Props {
  form: StaffFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean | StaffSocialLink[] | null) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: StaffFormData = {
  name: "",
  employeeId: "",
  type: "core",
  role: "",
  department: "",
  joiningDate: "",
  currentlyWorking: true,
  endDate: "",
  photo: "",
  email: "",
  phone: "",
  socialLinks: [],
  salaryAmount: "",
  isActive: true,
  showOnPublic: false,
};

export { EMPTY };
export type { StaffFormData };

export function StaffForm({
  form,
  editingId,
  saving,
  onChange,
  onSave,
  onBack,
}: Props) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const { data: attributes = [] } = useAttributeOptions();

  const allLabels = useMemo(() => {
    return attributes.map(a => a.title).filter(t => t.trim()).sort();
  }, [attributes]);

  const [roleLabel, setRoleLabel] = useState("");
  const [deptLabel, setDeptLabel] = useState("");

  const detectedRoleLabel = useMemo(() => {
    if (!form.role) return "";
    const found = attributes.find(a => a.values.flatMap(v => v.values).includes(form.role));
    return found?.title ?? "";
  }, [attributes, form.role]);

  const detectedDeptLabel = useMemo(() => {
    if (!form.department) return "";
    const found = attributes.find(a => a.values.flatMap(v => v.values).includes(form.department));
    return found?.title ?? "";
  }, [attributes, form.department]);

  const effectiveRoleLabel = roleLabel || detectedRoleLabel;
  const effectiveDeptLabel = deptLabel || detectedDeptLabel;

  const roleValues = useMemo(() => {
    if (!effectiveRoleLabel) return [];
    const attr = attributes.find(a => a.title === effectiveRoleLabel);
    return (attr?.values.flatMap(v => v.values).filter(v => v.trim()).sort()) ?? [];
  }, [attributes, effectiveRoleLabel]);

  const deptValues = useMemo(() => {
    if (!effectiveDeptLabel) return [];
    const attr = attributes.find(a => a.title === effectiveDeptLabel);
    return (attr?.values.flatMap(v => v.values).filter(v => v.trim()).sort()) ?? [];
  }, [attributes, effectiveDeptLabel]);

  const normalizePlatform = (p: string) =>
    SOCIAL_PLATFORMS.find((sp) => sp.toLowerCase() === p.toLowerCase()) ?? p;

  const handleMediaSelect = (item: PickerMediaItem) => {
    onChange("photo", item.url);
    setMediaPickerOpen(false);
  };

  const addSocialLink = () => {
    onChange("socialLinks", [...form.socialLinks, { platform: "Facebook", url: "" }]);
  };

  const updateSocialLink = (i: number, field: "platform" | "url", val: string) => {
    const next = form.socialLinks.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    );
    onChange("socialLinks", next);
  };

  const removeSocialLink = (i: number) => {
    onChange("socialLinks", form.socialLinks.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Staff"
        title={editingId ? form.name || "Edit Member" : "New Member"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.name.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"details","label":"Details"},{"value":"contact","label":"Contact"},{"value":"settings","label":"Settings"}]} />
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
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employee ID</Label>
                    <Input
                      value={form.employeeId}
                      onChange={(e) => onChange("employeeId", e.target.value)}
                      placeholder="EMP-001"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <ToggleGroup
                    type="single"
                    value={form.type}
                    onValueChange={(v) => v && onChange("type", v)}
                    variant="outline"
                    size="sm"
                  >
                    {STAFF_TYPE_OPTIONS.map((opt) => (
                      <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label}>
                        {opt.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2">
                      <Select value={effectiveRoleLabel} onValueChange={(v) => { setRoleLabel(v); onChange("role", ""); }}>
                        <SelectTrigger className="w-1/2 h-9 text-sm">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          {allLabels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={form.role} onValueChange={(v) => onChange("role", v)} disabled={!effectiveRoleLabel}>
                        <SelectTrigger className="w-1/2 h-9 text-sm">
                          <SelectValue placeholder="Value" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <div className="flex items-center gap-2">
                      <Select value={effectiveDeptLabel} onValueChange={(v) => { setDeptLabel(v); onChange("department", ""); }}>
                        <SelectTrigger className="w-1/2 h-9 text-sm">
                          <SelectValue placeholder="Label" />
                        </SelectTrigger>
                        <SelectContent>
                          {allLabels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={form.department} onValueChange={(v) => onChange("department", v)} disabled={!effectiveDeptLabel}>
                        <SelectTrigger className="w-1/2 h-9 text-sm">
                          <SelectValue placeholder="Value" />
                        </SelectTrigger>
                        <SelectContent>
                          {deptValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5 max-w-xs">
                    <Label>Joining Date</Label>
                    <Input
                      type="date"
                      value={form.joiningDate}
                      onChange={(e) => onChange("joiningDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currently Working</Label>
                    <ToggleGroup
                      type="single"
                      value={form.currentlyWorking ? "yes" : "no"}
                      onValueChange={(v) => v && onChange("currentlyWorking", v === "yes")}
                      variant="outline"
                      size="sm"
                    >
                      <ToggleGroupItem value="yes" aria-label="Yes">Yes</ToggleGroupItem>
                      <ToggleGroupItem value="no" aria-label="No">No</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>

                {!form.currentlyWorking && (
                  <div className="space-y-1.5 max-w-xs">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => onChange("endDate", e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1.5 max-w-xs">
                  <Label>Salary Amount (NPR)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rs.</span>
                    <Input
                      type="number"
                      value={form.salaryAmount}
                      onChange={(e) => onChange("salaryAmount", e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                      min={0}
                      step="0.01"
                    />
                  </div>
                </div>

              <div className="space-y-1.5">
  <Label>Photo</Label>
  <div className="flex items-center gap-4">
    <div className="group relative shrink-0">
      <Avatar className="size-24 rounded-lg">
        {form.photo && <AvatarImage src={form.photo} alt={form.name} className="object-cover" />}
        <AvatarFallback
          className={cn(
            "rounded-lg",
            !form.photo && "border border-dashed border-gray-200 bg-gray-50 text-gray-400 text-[11px]"
          )}
        >
          {form.photo ? form.name.charAt(0).toUpperCase() : "No image"}
        </AvatarFallback>
      </Avatar>

      {form.photo && (
        <button
          type="button"
          onClick={() => onChange("photo", "")}
          className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-gray-900 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      )}
    </div>

    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-lg"
        onClick={() => setMediaPickerOpen(true)}
      >
        <ImagePlus data-icon="inline-start" />
        {form.photo ? "Change Image" : "Choose Image"}
      </Button>
      <p className="text-[11px] text-gray-400">PNG, JPG up to 5MB</p>
    </div>
  </div>
</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => onChange("email", e.target.value)}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => onChange("phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Social Links</p>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                      <Plus data-icon="inline-start" />
                      Add Platform
                    </Button>
                  </div>
                  {form.socialLinks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 py-6 flex items-center justify-center text-xs text-gray-400">
                      No social links added
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.socialLinks.map((link, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Select
                            value={normalizePlatform(link.platform)}
                            onValueChange={(v) => updateSocialLink(i, "platform", v)}
                          >
                            <SelectTrigger className="w-32 h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={link.url}
                            onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                            placeholder="https://"
                            className="flex-1 h-9 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeSocialLink(i)}
                            className="size-9 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <ToggleGroup
                    type="single"
                    value={form.isActive ? "active" : "inactive"}
                    onValueChange={(v) => v && onChange("isActive", v === "active")}
                    variant="outline"
                    size="sm"
                  >
                    <ToggleGroupItem value="active" aria-label="Active">Active</ToggleGroupItem>
                    <ToggleGroupItem value="inactive" aria-label="Inactive">Inactive</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-1.5">
                  <Label>Show on Public Team</Label>
                  <ToggleGroup
                    type="single"
                    value={form.showOnPublic ? "visible" : "hidden"}
                    onValueChange={(v) => v && onChange("showOnPublic", v === "visible")}
                    variant="outline"
                    size="sm"
                  >
                    <ToggleGroupItem value="visible" aria-label="Visible">Visible</ToggleGroupItem>
                    <ToggleGroupItem value="hidden" aria-label="Hidden">Hidden</ToggleGroupItem>
                  </ToggleGroup>
                  <p className="text-xs text-gray-400">When visible, this member appears on the public website team section.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {mediaPickerOpen && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(o) => { setMediaPickerOpen(o); }}
          mode="image"
          defaultCategory="Images"
          onSelect={(item) => handleMediaSelect(item)}
        />
      )}
    </div>
  );
}
