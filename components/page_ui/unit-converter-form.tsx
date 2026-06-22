"use client";

import { FormHeader } from "@/components/global_ui/form-header";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAttributeOptions } from "@/api/hooks/use-attribute-query";
import { BlogAdmin } from "@/api/services/blog.service";
import type { ConversionRule } from "@/api/types/unit-converter.types";
import type { BlogPost } from "@/api/types/blog.types";
import { toSlug } from "@/lib/slug";

interface UnitConverterFormData {
  title: string;
  slug: string;
  attributeId: string | null;
  fieldLabel: string;
  baseUnit: string;
  conversions: ConversionRule[];
  isActive: boolean;
  blogId: string;
}

interface Props {
  form: UnitConverterFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean | number | ConversionRule[] | null) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: UnitConverterFormData = {
  title: "",
  slug: "",
  attributeId: null,
  fieldLabel: "",
  baseUnit: "",
  conversions: [],
  isActive: true,
  blogId: "",
};

export { EMPTY };
export type { UnitConverterFormData };

export function UnitConverterForm({
  form,
  editingId,
  saving,
  onChange,
  onSave,
  onBack,
}: Props) {
  const { data: attributes = [] } = useAttributeOptions();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    BlogAdmin.list()
      .then((res) => setBlogs(res.results ?? []))
      .catch(() => {});
  }, []);

  const selectedAttribute = attributes.find((a) => a.id === form.attributeId);

  const fieldLabels = selectedAttribute ? selectedAttribute.values.map((v) => v.label) : [];

  const selectedField = selectedAttribute?.values.find((v) => v.label === form.fieldLabel);

  const allValues = selectedField?.values ?? [];

  const otherValues = allValues.filter((v) => v !== form.baseUnit);

  const handleAttributeChange = (v: string) => {
    const id = v === "none" ? null : v;
    onChange("attributeId", id);
    onChange("fieldLabel", "");
    onChange("baseUnit", "");
    onChange("conversions", []);
  };

  const handleFieldLabelChange = (v: string) => {
    onChange("fieldLabel", v);
    onChange("baseUnit", "");
    onChange("conversions", []);
  };

  const handleBaseUnitChange = (v: string) => {
    onChange("baseUnit", v);
    const field = selectedAttribute?.values.find((fv) => fv.label === form.fieldLabel);
    if (!field) return;
    const others = field.values.filter((fv) => fv !== v);
    const existing = form.conversions;
    const next = others.map((to) => {
      const match = existing.find((c) => c.to === to);
      return { to, factor: match ? match.factor : 0 as number };
    });
    onChange("conversions", next);
  };

  const updateFactor = (to: string, factor: number) => {
    const next = form.conversions.map((c) =>
      c.to === to ? { ...c, factor } : c
    );
    onChange("conversions", next);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Unit Converter"
        title={editingId ? form.title || "Edit Conversion" : "New Conversion"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"content","label":"Content"},{"value":"settings","label":"Settings"}]} />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <FormCard>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input
                    value={form.title}
                    onChange={(e) => {
                      onChange("title", e.target.value);
                      if (!editingId) onChange("slug", toSlug(e.target.value));
                    }}
                    placeholder="Conversion title"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug <span className="text-red-500">*</span></Label>
                  <div className="flex rounded-md border border-gray-200 overflow-hidden">
                    <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
                      /convert/
                    </span>
                    <Input
                      value={form.slug}
                      onChange={(e) => onChange("slug", e.target.value)}
                      placeholder="conversion-slug"
                      className="border-0 rounded-none font-mono focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
            </FormCard>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <FormCard>
              <div className="space-y-5">
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
                  <div className="space-y-1.5">
                    <Label>Field Label</Label>
                    <Select
                      value={form.fieldLabel}
                      onValueChange={handleFieldLabelChange}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Pick a field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldLabels.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedField && (
                  <div className="space-y-1.5">
                    <Label>Base Unit</Label>
                    <Select
                      value={form.baseUnit}
                      onValueChange={handleBaseUnitChange}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Select base unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {allValues.map((val) => (
                          <SelectItem key={val} value={val}>{val}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {form.baseUnit && otherValues.length > 0 && (
                  <div className="space-y-3">
                    <Label>Conversion Factors</Label>
                    <div className="space-y-2">
                      {otherValues.map((to) => {
                        const conv = form.conversions.find((c) => c.to === to);
                        return (
                          <div
                            key={to}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              1 {form.baseUnit}
                            </span>
                            <span className="text-gray-300">=</span>
                            <Input
                              type="number"
                              min={0}
                              step="any"
                              value={conv?.factor || ""}
                              onChange={(e) => updateFactor(to, e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-28 h-9 text-sm text-center"
                            />
                            <span className="text-sm font-medium text-gray-900">{to}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </FormCard>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <FormCard>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <SegmentedToggle<boolean>
                  value={form.isActive}
                  onChange={(v) => onChange("isActive", v)}
                  options={[
                    { value: true, label: "Active" },
                    { value: false, label: "Inactive" },
                  ]}
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Linked Blog</p>
                <div className="space-y-1.5 max-w-md">
                  <Label>Blog Post</Label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None" },
                      ...blogs.map((b) => ({ value: b.id, label: b.title })),
                    ]}
                    value={form.blogId}
                    onChange={(v) => onChange("blogId", v)}
                    placeholder="None"
                    searchPlaceholder="Search blog posts..."
                  />
                  <p className="text-xs text-gray-400">Link this conversion to a blog post for public rendering.</p>
                </div>
              </div>
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
