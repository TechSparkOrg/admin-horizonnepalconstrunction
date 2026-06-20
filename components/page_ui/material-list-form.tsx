"use client";

import { ImagePlus, X } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { useState, useEffect } from "react";
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
import { CategoryAdmin } from "@/api/services/category.service";
import { useAttributeOptions } from "@/api/hooks/use-attribute-query";
import { BlogAdmin } from "@/api/services/blog.service";
import type { Category } from "@/api/types/category.types";
import type { BlogPost } from "@/api/types/blog.types";

interface MaterialListFormData {
  name: string;
  pricePerUnit: number | "";
  attributeId: string | null;
  unitValue: string;
  companyValue: string;
  photo: string;
  serviceCategoryId: string | null;
  isActive: boolean;
  blogId: string;
}

interface Props {
  form: MaterialListFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean | number | null) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: MaterialListFormData = {
  name: "",
  pricePerUnit: "",
  attributeId: null,
  unitValue: "",
  companyValue: "",
  photo: "",
  serviceCategoryId: null,
  isActive: true,
  blogId: "",
};

export { EMPTY };
export type { MaterialListFormData };

export function MaterialListForm({
  form,
  editingId,
  saving,
  onChange,
  onSave,
  onBack,
}: Props) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const { data: attributes = [] } = useAttributeOptions();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [unitLabel, setUnitLabel] = useState("");
  const [companyLabel, setCompanyLabel] = useState("");

  useEffect(() => {
    CategoryAdmin.listServices()
      .then((res) => setServiceCategories(res.results ?? []))
      .catch(() => {});
    BlogAdmin.list()
      .then((res) => setBlogs(res.results ?? []))
      .catch(() => {});
  }, []);

  const selectedAttribute = attributes.find((a) => a.id === form.attributeId);

  useEffect(() => {
    if (!selectedAttribute || !editingId) return;
    const findLabel = (value: string) => {
      for (const f of selectedAttribute.values) {
        if (f.values.includes(value)) return f.label;
      }
      return "";
    };
    if (form.unitValue && !unitLabel) setUnitLabel(findLabel(form.unitValue));
    if (form.companyValue && !companyLabel) setCompanyLabel(findLabel(form.companyValue));
  }, [selectedAttribute, editingId]);

  const fieldLabels = selectedAttribute ? selectedAttribute.values.map((v) => v.label) : [];

  const selectedUnitField = selectedAttribute?.values.find((v) => v.label === unitLabel);
  const selectedCompanyField = selectedAttribute?.values.find((v) => v.label === companyLabel);

  const handleMediaSelect = (item: PickerMediaItem) => {
    onChange("photo", item.url);
    setMediaPickerOpen(false);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Material List"
        title={editingId ? form.name || "Edit Material" : "New Material"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.name.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"usecase","label":"Use Case"},{"value":"settings","label":"Settings"}]} />
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
                      placeholder="Material name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price Per Unit</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.pricePerUnit}
                      onChange={(e) => onChange("pricePerUnit", e.target.value === "" ? "" : parseFloat(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Attribute Type</Label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None" },
                      ...attributes.map((a) => ({ value: a.id, label: a.title })),
                    ]}
                    value={form.attributeId ?? ""}
                    onChange={(v) => {
                      const id = v || null;
                      onChange("attributeId", id);
                      setUnitLabel("");
                      setCompanyLabel("");
                      onChange("unitValue", "");
                      onChange("companyValue", "");
                    }}
                    placeholder="Select an attribute"
                    searchPlaceholder="Search attributes..."

                  />
                </div>

                {selectedAttribute && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-900">Unit</Label>
                      <div className="flex items-center gap-2">
                        <Select value={unitLabel} onValueChange={(v) => { setUnitLabel(v); onChange("unitValue", ""); }}>
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Pick a field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldLabels.map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-gray-300 select-none shrink-0 text-sm font-medium">|</span>
                        <Select
                          value={form.unitValue}
                          onValueChange={(v) => onChange("unitValue", v)}
                          disabled={!unitLabel}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedUnitField?.values.map((val) => (
                              <SelectItem key={val} value={val}>{val}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-900">Company</Label>
                      <div className="flex items-center gap-2">
                        <Select value={companyLabel} onValueChange={(v) => { setCompanyLabel(v); onChange("companyValue", ""); }}>
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Pick a field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldLabels.map((l) => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-gray-300 select-none shrink-0 text-sm font-medium">|</span>
                        <Select
                          value={form.companyValue}
                          onValueChange={(v) => onChange("companyValue", v)}
                          disabled={!companyLabel}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCompanyField?.values.map((val) => (
                              <SelectItem key={val} value={val}>{val}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usecase" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Service Category</Label>
                    <Select
                      value={form.serviceCategoryId ?? "all"}
                      onValueChange={(v) => onChange("serviceCategoryId", v === "all" ? null : v)}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="All Services" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Photo</Label>
                  <div className="flex items-start gap-4">
                    {form.photo ? (
                      <div className="relative w-32 h-24 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
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
                      <div className="w-32 h-24 rounded-lg border border-dashed border-gray-200 grid place-items-center text-gray-400 shrink-0">
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

          <TabsContent value="settings" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
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

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Linked Blog</p>
                  <div className="space-y-1.5 max-w-md">
                    <Label>Blog Post</Label>
                    <Select value={form.blogId} onValueChange={(v) => onChange("blogId", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        {blogs.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">Link this material to a blog post for public rendering.</p>
                  </div>
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
