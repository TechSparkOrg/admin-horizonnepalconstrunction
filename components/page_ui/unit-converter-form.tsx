"use client";

import { FormHeader } from "@/components/global_ui/form-header";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFaqSelector } from "@/api/hooks/use-faq-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAttributeOptions } from "@/api/hooks/use-attribute-query";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { UnitConverterSeoTab } from "@/components/page_ui/unit-converter-seo-tab";
import { UnitConverterMediaTab } from "@/components/page_ui/unit-converter-media-tab";
import type { ConversionRule, BannerImage } from "@/api/types/unit-converter.types";
import { toSlug } from "@/lib/slug";

interface UnitConverterFormData {
  title: string;
  slug: string;
  description: string;
  attributeId: string | null;
  fieldLabel: string;
  baseUnit: string;
  conversions: ConversionRule[];
  faqCategoryId: string | null;
  faqGroupSlug: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  bannerImages: BannerImage[];
  videoUrl: string;
}

interface Props {
  form: UnitConverterFormData;
  editingId: string | null;
  saving: boolean;
  bannerImages: BannerImage[];
  onBannerImagesChange: (images: BannerImage[]) => void;
  onChange: (key: string, value: string | boolean | number | ConversionRule[] | null) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: UnitConverterFormData = {
  title: "",
  slug: "",
  description: "",
  attributeId: null,
  fieldLabel: "",
  baseUnit: "",
  conversions: [],
  faqCategoryId: null,
  faqGroupSlug: "",
  isActive: true,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  bannerImages: [],
  videoUrl: "",
};

export { EMPTY };
export type { UnitConverterFormData };

export function UnitConverterForm({
  form,
  editingId,
  saving,
  bannerImages,
  onBannerImagesChange,
  onChange,
  onSave,
  onBack,
}: Props) {
  const { data: attributes = [] } = useAttributeOptions();
  const { data: faqOptions = [] } = useFaqSelector();

  const selectedAttribute = attributes.find((a) => a.id === form.attributeId);

  const fieldLabels = selectedAttribute ? selectedAttribute.values.map((v) => v.label).filter(Boolean) : [];

  const selectedField = selectedAttribute?.values.find((v) => v.label === form.fieldLabel);

  const allValues = selectedField?.values.filter(Boolean) ?? [];

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
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"content","label":"Content"},{"value":"seo","label":"SEO"},{"value":"media","label":"Media"},{"value":"settings","label":"Settings"}]} />
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

              <div className="mt-5 space-y-1.5">
                <Label>Description</Label>
                <RichEditor value={form.description} onChange={(html) => onChange("description", html)} minHeight={200} />
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

          <TabsContent value="seo" className="mt-4">
            <FormCard>
              <UnitConverterSeoTab
                metaTitle={form.metaTitle}
                metaDescription={form.metaDescription}
                metaKeywords={form.metaKeywords}
                onChange={onChange}
              />
            </FormCard>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <UnitConverterMediaTab
              bannerImages={bannerImages}
              videoUrl={form.videoUrl}
              onBannerImagesChange={onBannerImagesChange}
              onChange={onChange}
            />
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

              <div className="border-t border-gray-200 pt-5 mt-5">
                <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-gray-600 mb-4">
                  FAQ Settings
                </h4>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>FAQ Group</Label>
                    <SearchableSelect
                      options={faqOptions}
                      value={form.faqGroupSlug}
                      onChange={(v) => onChange("faqGroupSlug", v)}
                      placeholder="Select a FAQ group"
                      searchPlaceholder="Search FAQ groups..."
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Select a FAQ group to display related Q&amp;A
                    </p>
                  </div>
                </div>
              </div>
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
