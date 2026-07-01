"use client";

import { Image, ImagePlus, Stamp, Signature, Minus } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useState, useCallback, useMemo } from "react";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FormCard } from "@/components/global_ui/form-card";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";

interface TemplateFormData {
  attributeId: string;
  title: string;
  slug: string;
  isActive: boolean;
  backgroundImage: boolean;
  backgroundImageUrl: string;
  showStamp: boolean;
  stampImageUrl: string;
  showSignature: boolean;
  signatureImageUrl: string;
  content: string;
}

interface AttributeOption {
  id: string;
  title: string;
  values: { label: string; values: string[] }[];
}

interface Props {
  form: TemplateFormData;
  editingId: string | null;
  saving: boolean;
  attributes: AttributeOption[];
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: TemplateFormData = {
  attributeId: "",
  title: "",
  slug: "",
  isActive: true,
  backgroundImage: false,
  backgroundImageUrl: "",
  showStamp: false,
  stampImageUrl: "",
  showSignature: false,
  signatureImageUrl: "",
  content: "",
};

export { EMPTY };
export type { TemplateFormData };

export function TemplateForm({ form, editingId, saving, attributes, onChange, onSave, onBack }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState<"backgroundImageUrl" | "stampImageUrl" | "signatureImageUrl">("backgroundImageUrl");

  const openPicker = (field: typeof pickerField) => { setPickerField(field); setPickerOpen(true); };
  const handleMediaSelect = useCallback((item: PickerMediaItem) => { onChange(pickerField, item.url); }, [pickerField, onChange]);

  const insertToken = (token: string) => {
    onChange("content", (form.content || "") + ` {${token}}`);
  };

  const insertPageBreak = () => {
    onChange("content", (form.content || "") + `<hr />`);
  };

  const selectedAttribute = useMemo(
    () => attributes.find((a) => a.id === form.attributeId),
    [attributes, form.attributeId]
  );

  const attributeGroups = useMemo(
    () => selectedAttribute?.values.map((g) => ({ label: g.label, values: g.values })) ?? [],
    [selectedAttribute]
  );

  const systemTokenGroups = useMemo(() => [
    ...(form.showStamp ? [{ label: "Stamp", tokens: ["stamp"] }] : []),
    ...(form.showSignature ? [{ label: "Signature", tokens: ["signature"] }] : []),
  ], [form.showStamp, form.showSignature]);

  return (
    <div>
      {pickerOpen && <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} mode="image" defaultCategory="Images" title="Choose Image" onSelect={handleMediaSelect} />}

      <FormHeader
        breadcrumb="Templates"
        title={editingId ? form.title || "Edit Template" : "New Template"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"content","label":"Content"},{"value":"media","label":"Media"}]} />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <FormCard>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Template title" />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug <span className="text-red-500">*</span></Label>
                  <div className="flex rounded-md border border-gray-200 overflow-hidden">
                    <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">/</span>
                    <Input value={form.slug} onChange={(e) => onChange("slug", e.target.value)} placeholder="template-slug"
                      className="border-0 rounded-none font-mono focus-visible:ring-0" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-1.5 mb-4">
                  <Label>Attribute <span className="text-red-500">*</span></Label>
                  <SearchableSelect
                    options={attributes.map((a) => ({ value: a.id, label: a.title }))}
                    value={form.attributeId}
                    onChange={(v) => onChange("attributeId", v)}
                    placeholder="Select attribute..."
                    searchPlaceholder="Search attributes..."
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Status</p>
                <SegmentedToggle<boolean>
                  value={form.isActive}
                  onChange={(v) => onChange("isActive", v)}
                  options={[
                    { value: true, label: "Active" },
                    { value: false, label: "Inactive" },
                  ]}
                />
              </div>
            </FormCard>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <FormCard>
                <p className="text-sm font-semibold text-gray-900">Template Body</p>

                <div className="space-y-2">
                  <Label className="text-[11px] text-gray-500">Available Tokens</Label>
                  {attributeGroups.length === 0 && systemTokenGroups.length === 0 ? (
                    <p className="text-xs text-gray-400">No tokens available. Select an attribute first.</p>
                  ) : (
                    <div className="space-y-2">
                      {attributeGroups.map((g) => (
                        <div key={g.label}>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{g.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {g.values.map((v) => (
                              <button key={v} type="button" onClick={() => insertToken(v)}
                                className="text-[11px] px-2 py-1 rounded bg-sidebar-primary/10 text-sidebar-primary font-medium hover:bg-sidebar-primary/20 transition cursor-pointer whitespace-nowrap">
                                {`{${v}}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {systemTokenGroups.length > 0 && (
                        <div className="pt-1 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">System Fields</p>
                          <div className="flex flex-wrap gap-1.5">
                            {systemTokenGroups.flatMap((g) => g.tokens).map((t) => (
                              <button key={t} type="button" onClick={() => insertToken(t)}
                                className="text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 transition cursor-pointer whitespace-nowrap">
                                {`{${t}}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] text-gray-500">Content</Label>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={insertPageBreak}>
                      <Minus className="size-3" /> Page Break
                    </Button>
                  </div>
                  <RichEditor value={form.content} onChange={(html) => onChange("content", html)} minHeight={400} />
                </div>
            </FormCard>
          </TabsContent>

          <TabsContent value="media" className="mt-4 space-y-4">
            <FormCard>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Image className="size-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Background Image</p>
                  </div>
                  <SegmentedToggle<boolean>
                    value={form.backgroundImage}
                    onChange={(v) => onChange("backgroundImage", v)}
                    options={[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ]}
                  />
                </div>
                {form.backgroundImage && (
                  <div className="space-y-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => openPicker("backgroundImageUrl")}>
                      <ImagePlus className="size-3.5" /> Choose Image
                    </Button>
                    {form.backgroundImageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={form.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => onChange("backgroundImageUrl", "")}
                          className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    )}
                  </div>
                )}
            </FormCard>

            <FormCard>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Stamp className="size-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Stamp</p>
                  </div>
                  <SegmentedToggle<boolean>
                    value={form.showStamp}
                    onChange={(v) => onChange("showStamp", v)}
                    options={[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ]}
                  />
                </div>
                {form.showStamp && (
                  <div className="space-y-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => openPicker("stampImageUrl")}>
                      <ImagePlus className="size-3.5" /> Choose Image
                    </Button>
                    {form.stampImageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={form.stampImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => onChange("stampImageUrl", "")}
                          className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    )}
                  </div>
                )}
            </FormCard>

            <FormCard>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Signature className="size-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">Signature</p>
                  </div>
                  <SegmentedToggle<boolean>
                    value={form.showSignature}
                    onChange={(v) => onChange("showSignature", v)}
                    options={[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ]}
                  />
                </div>
                {form.showSignature && (
                  <div className="space-y-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => openPicker("signatureImageUrl")}>
                      <ImagePlus className="size-3.5" /> Choose Image
                    </Button>
                    {form.signatureImageUrl && (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={form.signatureImageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button type="button" onClick={() => onChange("signatureImageUrl", "")}
                          className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      </div>
                    )}
                  </div>
                )}
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
