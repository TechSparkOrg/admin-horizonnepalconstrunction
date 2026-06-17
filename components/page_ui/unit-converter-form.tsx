"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
import { AttributeAdmin } from "@/api/services/attribute.service";
import type { AttributeItem } from "@/api/types/attribute.types";
import type { ConversionRule } from "@/api/types/unit-converter.types";
import { toSlug } from "@/lib/slug";

interface UnitConverterFormData {
  title: string;
  slug: string;
  attributeId: string | null;
  fieldLabel: string;
  baseUnit: string;
  conversions: ConversionRule[];
  isActive: boolean;
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
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);

  useEffect(() => {
    AttributeAdmin.search({ used_in: "all", page_size: 100 })
      .then((res) => setAttributes(res.results ?? []))
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Unit Converter</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingId ? form.title || "Edit Conversion" : "New Conversion"}
            </h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.title.trim() || saving} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              Content
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
                    <Label>Title</Label>
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
                    <Label>Slug</Label>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label>Attribute Type</Label>
                  <Select
                    value={form.attributeId ?? "none"}
                    onValueChange={handleAttributeChange}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Select an attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {attributes.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
