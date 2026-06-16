"use client";

import { ArrowLeft, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RichEditor } from "@/components/page_ui/rich-editor";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MediaPickerDialog } from "@/components/global_ui/MediahanlderPicker";
import type { MediaItem } from "@/components/global_ui/MediahanlderPicker";
import Image from "next/image";
import type { BuildingPermitItemType, BilingualPair, DocumentExample } from "@/api/types/building-permit.types";

interface BuildingPermitFormData {
  type: BuildingPermitItemType;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  stepNumber: number;
  description: BilingualPair;
  duration: string;
  documents: string[];
  label: BilingualPair;
  items: BilingualPair[];
  district: string;
  phone: string;
  documentExamples: DocumentExample[];
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
}

interface Props {
  form: BuildingPermitFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean | number | BilingualPair | BilingualPair[] | string[] | DocumentExample[]) => void;
  onListChange: (listKey: string, items: BilingualPair[]) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY_PAIR = (): BilingualPair => ({ en: "", np: "" });

const EMPTY: BuildingPermitFormData = {
  type: "workflow_step",
  title: "",
  slug: "",
  order: 0,
  isActive: true,
  stepNumber: 0,
  description: { en: "", np: "" },
  duration: "",
  documents: [],
  label: { en: "", np: "" },
  items: [],
  district: "",
  phone: "",
  documentExamples: [],
  metaTitle: "",
  metaKeywords: "",
  metaDescription: "",
};

export { EMPTY, EMPTY_PAIR };
export type { BuildingPermitFormData };

function ListEditor({ items, onChange, label }: {
  items: BilingualPair[];
  onChange: (items: BilingualPair[]) => void;
  label: string;
}) {
  const add = () => onChange([...items, EMPTY_PAIR()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: "en" | "np", value: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">
          No items added yet
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item {i + 1}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 h-7"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">English</Label>
                <Textarea
                  value={item.en}
                  onChange={(e) => update(i, "en", e.target.value)}
                  placeholder="English text"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-500">नेपाली</Label>
                <Textarea
                  value={item.np}
                  onChange={(e) => update(i, "np", e.target.value)}
                  placeholder="नेपाली पाठ"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StringListEditor({ items, onChange, label, placeholder }: {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
}) {
  const add = () => onChange([...items, ""]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, value: string) => {
    const next = items.map((item, idx) => idx === i ? value : item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">
          No items added yet
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder || `Item ${i + 1}`}
                className="text-sm flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 h-9 shrink-0"
                onClick={() => remove(i)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TYPE_LABELS: Record<BuildingPermitItemType, string> = {
  workflow_step: "Workflow Step",
  doc_category: "Doc Category",
  regulation: "Regulation",
  municipality: "Municipality",
};

export function BuildingPermitForm({
  form,
  editingId,
  saving,
  onChange,
  onListChange,
  onSave,
  onBack,
}: Props) {
  const typeLabel = TYPE_LABELS[form.type];
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (item: MediaItem) => {
    if (mediaPickerTarget === null) return;
    const next = form.documentExamples.map((ex, i) =>
      i === mediaPickerTarget ? { ...ex, image_url: item.url } : ex
    );
    onChange("documentExamples", next);
    setMediaPickerTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Building Permit</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingId ? form.title || `Edit ${typeLabel}` : `New ${typeLabel}`}
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
            <TabsTrigger value="seo" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">
              SEO
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
                      onChange={(e) => onChange("title", e.target.value)}
                      placeholder={`${typeLabel} title`}
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
                        placeholder="item-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {form.type === "workflow_step" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Step Number</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.stepNumber}
                        onChange={(e) => onChange("stepNumber", parseInt(e.target.value) || 0)}
                        placeholder="1"
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Duration</Label>
                      <Input
                        value={form.duration}
                        onChange={(e) => onChange("duration", e.target.value)}
                        placeholder="e.g. 2-3 weeks"
                      />
                    </div>
                  </div>
                )}

                {form.type === "municipality" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>District</Label>
                      <Input
                        value={form.district}
                        onChange={(e) => onChange("district", e.target.value)}
                        placeholder="District name"
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
                )}

                {(form.type === "doc_category" || form.type === "regulation") && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Label (English)</Label>
                      <Input
                        value={form.label.en}
                        onChange={(e) => onChange("label", { ...form.label, en: e.target.value })}
                        placeholder="English label"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Label (नेपाली)</Label>
                      <Input
                        value={form.label.np}
                        onChange={(e) => onChange("label", { ...form.label, np: e.target.value })}
                        placeholder="नेपाली लेबल"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-6">
                {form.type === "workflow_step" && (
                  <>
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">Description</p>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-500">English</Label>
                        <RichEditor
                          value={form.description.en}
                          onChange={(html) => onChange("description", { ...form.description, en: html })}
                          minHeight={120}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-500">नेपाली</Label>
                        <Textarea
                          value={form.description.np}
                          onChange={(e) => onChange("description", { ...form.description, np: e.target.value })}
                          placeholder="नेपाली विवरण"
                          rows={4}
                          className="text-sm resize-none"
                        />
                      </div>
                    </div>
                    <StringListEditor
                      items={form.documents}
                      onChange={(items) => onChange("documents", items)}
                      label="Documents"
                      placeholder="Document name"
                    />
                  </>
                )}

                {(form.type === "doc_category" || form.type === "regulation") && (
                  <>
                    <ListEditor
                      items={form.items}
                      onChange={(items) => onListChange("items", items)}
                      label={form.type === "doc_category" ? "Items" : "Regulations"}
                    />
                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-sm font-semibold text-gray-900 mb-4">Government Document Examples</p>
                      {form.documentExamples.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">
                          No document examples added yet
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {form.documentExamples.map((ex, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Example {i + 1}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 border-red-200 hover:bg-red-50 h-7"
                                  onClick={() => {
                                    const next = form.documentExamples.filter((_, idx) => idx !== i);
                                    onChange("documentExamples", next);
                                  }}
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Document Name</Label>
                                <Input
                                  value={ex.document_name}
                                  onChange={(e) => {
                                    const next = form.documentExamples.map((doc, idx) =>
                                      idx === i ? { ...doc, document_name: e.target.value } : doc
                                    );
                                    onChange("documentExamples", next);
                                  }}
                                  placeholder="Enter document name"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Example Image</Label>
                                <div className="flex items-start gap-4">
                                  {ex.image_url ? (
                                    <div className="relative w-32 h-24 rounded-lg border border-gray-200 overflow-hidden group shrink-0">
                                      <Image src={ex.image_url} alt="Document example" fill className="object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = form.documentExamples.map((e, idx) =>
                                            idx === i ? { ...e, image_url: "" } : e
                                          );
                                          onChange("documentExamples", next);
                                        }}
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
                                    onClick={() => {
                                      setMediaPickerTarget(i);
                                      setMediaPickerOpen(true);
                                    }}
                                  >
                                    <Upload className="size-3.5" />
                                    Pick Image
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onChange("documentExamples", [...form.documentExamples, { document_name: "", image_url: "" }]);
                        }}
                        className="mt-4"
                      >
                        <Plus className="size-4" />
                        Add Example
                      </Button>
                    </div>
                  </>
                )}

                {form.type === "municipality" && (
                  <div className="rounded-lg border border-dashed border-gray-200 py-8 flex items-center justify-center text-sm text-gray-400">
                    No content fields for municipalities
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Meta Title</Label>
                  <Input
                    value={form.metaTitle}
                    onChange={(e) => onChange("metaTitle", e.target.value)}
                    placeholder="Defaults to title"
                  />
                  <p className="text-right text-[11px] text-gray-400">{form.metaTitle.length} / 60</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Meta Description</Label>
                  <RichEditor
                    value={form.metaDescription}
                    onChange={(html) => onChange("metaDescription", html)}
                    minHeight={120}
                  />
                  <p className="text-right text-[11px] text-gray-400">{form.metaDescription.length} / 160</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Meta Keywords</Label>
                  <Input
                    value={form.metaKeywords}
                    onChange={(e) => onChange("metaKeywords", e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-xs text-gray-400">Comma-separated keywords for search engines.</p>
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
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={(o) => { setMediaPickerOpen(o); if (!o) setMediaPickerTarget(null); }}
        onSelect={(item) => handleMediaSelect(item)}
      />
    </div>
  );
}
