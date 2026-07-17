"use client";

import { Minus, Eye, FileText, ExternalLink } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FormCard } from "@/components/global_ui/form-card";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { TemplateAdmin } from "@/api/services/template.service";
import { DocumentPicker } from "@/components/global_ui/document-picker";

interface TemplateFormData {
  attributeId: string;
  title: string;
  slug: string;
  isActive: boolean;
  content: string;
  masterTemplateFile: string;
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
  content: "",
  masterTemplateFile: "",
};

export { EMPTY };
export type { TemplateFormData };

export function TemplateForm({ form, editingId, saving, attributes, onChange, onSave, onBack }: Props) {
  const [docPickerOpen, setDocPickerOpen] = useState(false);

  const handlePreview = async () => {
    if (!editingId) return;
    try {
      const html = await TemplateAdmin.previewHtml(editingId);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:0;left:-100vw;width:210mm;height:297mm;border:0;visibility:hidden";
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      };
      iframe.srcdoc = html;
    } catch {
      toast.error("Failed to generate preview");
    }
  };

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
    () => selectedAttribute?.values.map((g) => ({
      label: g.label || selectedAttribute.title,
      values: g.values,
    })) ?? [],
    [selectedAttribute]
  );

  return (
    <div>
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
          <FormTabs tabs={[{ value: "overview", label: "Overview" }, { value: "content", label: "Content" }]} />
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

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Master Theme File</p>
                <p className="text-xs text-gray-500 mb-3">Upload a PDF or DOCX file to use as the master background/theme for this template.</p>

                {form.masterTemplateFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <FileText className="size-5 text-blue-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{form.masterTemplateFile.split("/").pop()}</p>
                      <p className="text-xs text-gray-500 truncate">{form.masterTemplateFile}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs" asChild>
                        <a href={form.masterTemplateFile} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-3" /> View
                        </a>
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => onChange("masterTemplateFile", "")}>
                        <Minus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => setDocPickerOpen(true)}>
                    <FileText className="size-3.5" /> Choose Theme
                  </Button>
                )}
              </div>

              {docPickerOpen && (
                <DocumentPicker
                  open={docPickerOpen}
                  onOpenChange={setDocPickerOpen}
                  onSelect={(item) => {
                    onChange("masterTemplateFile", item.url);
                    setDocPickerOpen(false);
                  }}
                />
              )}
            </FormCard>
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <FormCard>
              <div className="space-y-2 mb-4">
                <Label className="text-[11px] text-gray-500">Available Tokens</Label>
                {attributeGroups.length === 0 ? (
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
                  </div>
                )}
              </div>

              <div className="space-y-1.5 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Body</p>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={handlePreview}>
                      <Eye className="size-3" /> Preview
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={insertPageBreak}>
                      <Minus className="size-3" /> Page Break
                    </Button>
                  </div>
                </div>
                <RichEditor value={form.content} onChange={(html) => onChange("content", html)} minHeight={300} />
              </div>
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
