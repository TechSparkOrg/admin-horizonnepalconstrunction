"use client";

import { ImagePlus, X, Plus, Trash2 } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { useState } from "react";
import Image from "next/image";
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
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import type { StaffType, StaffSocialLink } from "@/api/types/staff.types";
import { STAFF_TYPE_OPTIONS, SOCIAL_PLATFORMS } from "@/api/types/staff.types";
import { useAttributeOptions } from "@/api/hooks/use-attribute-query";

interface StaffFormData {
  name: string;
  employeeId: string;
  type: StaffType;
  attributeId: string | null;
  designationLabel: string;
  designationValue: string;
  departmentLabel: string;
  departmentValue: string;
  joiningDate: string;
  currentlyWorking: boolean;
  endDate: string;
  photo: string;
  email: string;
  phone: string;
  socialLinks: StaffSocialLink[];
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
  attributeId: null,
  designationLabel: "",
  designationValue: "",
  departmentLabel: "",
  departmentValue: "",
  joiningDate: "",
  currentlyWorking: true,
  endDate: "",
  photo: "",
  email: "",
  phone: "",
  socialLinks: [],
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

  const selectedAttribute = attributes.find((a) => a.id === form.attributeId);
  const fieldLabels = selectedAttribute ? selectedAttribute.values.map((v) => v.label) : [];

  const selectedDesigField = selectedAttribute?.values.find((v) => v.label === form.designationLabel);
  const selectedDeptField = selectedAttribute?.values.find((v) => v.label === form.departmentLabel);

  const availableDesigLabels = fieldLabels.filter((l) => l !== form.departmentLabel);
  const availableDeptLabels = fieldLabels.filter((l) => l !== form.designationLabel);

  const handleAttributeChange = (v: string) => {
    const id = v === "none" ? null : v;
    onChange("attributeId", id);
    onChange("designationLabel", "");
    onChange("designationValue", "");
    onChange("departmentLabel", "");
    onChange("departmentValue", "");
  };

  const handleMediaSelect = (item: PickerMediaItem) => {
    onChange("photo", item.url);
    setMediaPickerOpen(false);
  };

  const addSocialLink = () => {
    onChange("socialLinks", [...form.socialLinks, { platform: "facebook", url: "" }]);
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
                    <Label>Name</Label>
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
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    {STAFF_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange("type", opt.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.type === opt.value
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Attribute Type</Label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None" },
                      ...attributes.map((a) => ({ value: a.id, label: a.title })),
                    ]}
                    value={form.attributeId ?? ""}
                    onChange={(v) => handleAttributeChange(v || "none")}
                    placeholder="Select an attribute"
                    searchPlaceholder="Search attributes..."

                  />
                </div>

                {selectedAttribute && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Designation</Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={form.designationLabel}
                          onValueChange={(v) => {
                            onChange("designationLabel", v);
                            onChange("designationValue", "");
                          }}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Pick a field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDesigLabels.map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-gray-300 select-none shrink-0 text-sm font-medium">|</span>
                        <Select
                          value={form.designationValue}
                          onValueChange={(v) => onChange("designationValue", v)}
                          disabled={!form.designationLabel}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDesigField?.values.map((val) => (
                              <SelectItem key={val} value={val}>{val}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Department</Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={form.departmentLabel}
                          onValueChange={(v) => {
                            onChange("departmentLabel", v);
                            onChange("departmentValue", "");
                          }}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Pick a field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDeptLabels.map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-gray-300 select-none shrink-0 text-sm font-medium">|</span>
                        <Select
                          value={form.departmentValue}
                          onValueChange={(v) => onChange("departmentValue", v)}
                          disabled={!form.departmentLabel}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDeptField?.values.map((val) => (
                              <SelectItem key={val} value={val}>{val}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

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
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                      <button
                        type="button"
                        onClick={() => onChange("currentlyWorking", true)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.currentlyWorking
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange("currentlyWorking", false)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          !form.currentlyWorking
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        No
                      </button>
                    </div>
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

                <div className="space-y-1.5">
                  <Label>Photo</Label>
                  <div className="flex items-start gap-4">
                    {form.photo ? (
                      <div className="relative w-24 h-24 rounded-full border border-gray-200 overflow-hidden group shrink-0">
                        <Image src={form.photo} alt={form.name} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => onChange("photo", "")}
                          className="absolute top-1 right-1 w-6 h-6 grid place-items-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full border border-dashed border-gray-200 grid place-items-center text-gray-400 shrink-0">
                        <span className="text-[11px]">No image</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaPickerOpen(true)}
                    >
                      <ImagePlus className="size-3.5" />
                      Choose Image
                    </Button>
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
                      <Plus className="size-3" />
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
                            value={link.platform}
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
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button
                      type="button"
                      onClick={() => onChange("isActive", true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.isActive
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("isActive", false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        !form.isActive
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Show on Public Team</Label>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button
                      type="button"
                      onClick={() => onChange("showOnPublic", true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.showOnPublic
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Visible
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("showOnPublic", false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        !form.showOnPublic
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Hidden
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">When visible, this member appears on the public website team section.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={(o) => { setMediaPickerOpen(o); }}
        onSelect={(item) => handleMediaSelect(item)}
      />
    </div>
  );
}
