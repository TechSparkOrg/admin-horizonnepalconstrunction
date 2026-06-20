"use client";

import { Plus, Trash2, X } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useState } from "react";
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
import type { AttributeValue, UsedIn } from "@/api/types/attribute.types";
import { USED_IN_OPTIONS } from "@/api/types/attribute.types";

interface AttributeFormData {
  title: string;
  slug: string;
  usedIn: UsedIn;
  values: AttributeValue[];
  isActive: boolean;
}

interface Props {
  form: AttributeFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean | number | AttributeValue[] | null) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_VALUE = (): AttributeValue => ({ label: "", values: [] });

const EMPTY: AttributeFormData = {
  title: "",
  slug: "",
  usedIn: "all",
  values: [],
  isActive: true,
};

export { EMPTY };
export type { AttributeFormData };

export function AttributeForm({
  form,
  editingId,
  saving,
  onChange,
  onSave,
  onBack,
}: Props) {
  const addValue = () => {
    onChange("values", [...form.values, EMPTY_VALUE()]);
  };

  const removeValue = (i: number) => {
    onChange("values", form.values.filter((_, idx) => idx !== i));
  };

  const updateValue = (i: number, field: keyof AttributeValue, val: string | string[]) => {
    const next = form.values.map((v, idx) =>
      idx === i ? { ...v, [field]: val } : v
    );
    onChange("values", next);
  };

  const addValueOption = (i: number) => {
    const v = form.values[i];
    updateValue(i, "values", [...v.values, ""]);
  };

  const updateValueOption = (i: number, optIdx: number, val: string) => {
    const v = form.values[i];
    const next = v.values.map((o, idx) => (idx === optIdx ? val : o));
    updateValue(i, "values", next);
  };

  const removeValueOption = (i: number, optIdx: number) => {
    const v = form.values[i];
    updateValue(i, "values", v.values.filter((_, idx) => idx !== optIdx));
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Attributes"
        title={editingId ? form.title || "Edit Attribute" : "New Attribute"}
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
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => onChange("title", e.target.value)}
                      placeholder="Attribute title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                      <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
                        /
                      </span>
                      <Input
                        value={form.slug}
                        onChange={(e) => onChange("slug", e.target.value)}
                        placeholder="attribute-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Used Where</Label>
                  <Select
                    value={form.usedIn}
                    onValueChange={(v) => onChange("usedIn", v)}
                  >
                    <SelectTrigger className="w-full h-9 text-sm max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USED_IN_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900">Fields</p>
                  <Button type="button" variant="outline" size="sm" onClick={addValue}>
                    <Plus className="size-4" />
                    Add Field
                  </Button>
                </div>
                {form.values.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">
                    No fields added yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.values.map((v, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Field {i + 1}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 h-7"
                            onClick={() => removeValue(i)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-500">Label</Label>
                            <Input
                              value={v.label}
                              onChange={(e) => updateValue(i, "label", e.target.value)}
                              placeholder="Field label"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-[11px] text-gray-500">Values</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => addValueOption(i)}
                              >
                                <Plus className="size-3" />
                                Add Value
                              </Button>
                            </div>
                            {v.values.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-gray-200 py-3 flex items-center justify-center text-xs text-gray-400">
                                No values yet
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {v.values.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1">
                                    <Input
                                      value={opt}
                                      onChange={(e) => updateValueOption(i, optIdx, e.target.value)}
                                      className="border-0 p-0 h-auto text-sm w-20 focus-visible:ring-0"
                                      placeholder="Value"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeValueOption(i, optIdx)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <X className="size-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
