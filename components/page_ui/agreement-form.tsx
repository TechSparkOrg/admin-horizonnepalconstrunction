"use client";

import { FileText, Printer, FileDown, TriangleAlert } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { apiPrivate } from "@/api/ServiceHelper";
import { TemplateAdmin } from "@/api/services/template.service";
import { ProjectAdmin } from "@/api/services/project.service";
import type { TemplateItem } from "@/api/types/template.types";
import type { Project } from "@/api/types/project.types";

interface AgreementFormData {
  name: string;
  clientName: string;
  templateId: string;
  variables: Record<string, string>;
  projectId: string;
  status: "draft" | "completed";
}

interface Props {
  form: AgreementFormData;
  editingId: string | null;
  saving: boolean;
  onChange: (key: string, value: string | boolean) => void;
  onVariablesChange: (vars: Record<string, string>) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: AgreementFormData = {
  name: "",
  clientName: "",
  templateId: "",
  variables: {},
  projectId: "",
  status: "draft",
};

export { EMPTY };
export type { AgreementFormData };

export function AgreementForm({ form, editingId, saving, onChange, onVariablesChange, onSave, onBack }: Props) {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [exportFormat, setExportFormat] = useState("docx");
  const [templateSearch, setTemplateSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const fetchTemplates = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fetchProjects = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(fetchTemplates.current);
    fetchTemplates.current = setTimeout(() => {
      TemplateAdmin.search({ search: templateSearch || undefined, page_size: 10 })
        .then((res) => setTemplates(res.results ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(fetchTemplates.current);
  }, [templateSearch]);

  useEffect(() => {
    clearTimeout(fetchProjects.current);
    fetchProjects.current = setTimeout(() => {
      ProjectAdmin.list({ search: projectSearch || undefined, page_size: 10 })
        .then((res) => setProjects(res.results ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(fetchProjects.current);
  }, [projectSearch]);

  useEffect(() => {
    if (!form.templateId) {
      setSelectedTemplate(null);
      return;
    }
    const tmpl = templates.find((t) => t.id === form.templateId);
    if (!tmpl) return;
    setSelectedTemplate(tmpl);
  }, [form.templateId, templates]);

  const handleTemplateChange = (value: string) => {
    onChange("templateId", value);
    onVariablesChange({});
  };

  const handleVariableChange = (token: string, value: string) => {
    onVariablesChange({ ...form.variables, [token]: value });
  };

  const contentTokens = useMemo(() => {
    const content = selectedTemplate?.content || "";
    const matches = content.match(/\{(\w+)\}/g);
    if (!matches) return [];
    const seen = new Set<string>();
    return matches
      .map((m) => m.slice(1, -1))
      .filter((t) => {
        if (seen.has(t)) return false;
        seen.add(t);
        if (t === "stamp" || t === "signature") return false;
        return true;
      });
  }, [selectedTemplate]);

  const templateHasNewTokens = useMemo(() => {
    if (!editingId || contentTokens.length === 0) return false;
    const savedKeys = Object.keys(form.variables);
    return contentTokens.some((t) => !savedKeys.includes(t));
  }, [contentTokens, form.variables, editingId]);

  const downloadFile = useCallback(async (format: string, ext: string) => {
    if (!editingId) {
      toast.error("Save the agreement first");
      return;
    }
    try {
      const blob = await apiPrivate.get<Blob>(`/admin/agreements/${editingId}?download=${format}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.name || "agreement"}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  }, [editingId, form.name]);

  const handlePrint = useCallback(async () => {
    if (!editingId) {
      toast.error("Save the agreement first");
      return;
    }
    try {
      const html = await apiPrivate.get<string>(`/admin/agreements/${editingId}?download=html`, {
        responseType: "text",
      });
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "-9999px";
      iframe.style.bottom = "-9999px";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
      }
    } catch {
      toast.error("Print failed");
    }
  }, [editingId]);

  const saveAsPdf = useCallback(async () => {
    if (!editingId) {
      toast.error("Save the agreement first");
      return;
    }
    try {
      const blob = await apiPrivate.get<Blob>(`/admin/agreements/${editingId}?download=pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.name || "agreement"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("PDF download failed");
    }
  }, [editingId, form.name]);

  return (
    <div>
      <FormHeader
        breadcrumb="Project Agreements"
        title={editingId ? form.name || "Edit Agreement" : "New Agreement"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.name.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"variables","label":"Variables"},{"value":"settings","label":"Settings"}]} />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <FormCard>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name <span className="text-red-500">*</span></Label>
                  <Input value={form.name} onChange={(e) => onChange("name", e.target.value)} placeholder="e.g. Construction Contract" />
                </div>
                <div className="space-y-1.5">
                  <Label>Client Name</Label>
                  <Input value={form.clientName} onChange={(e) => onChange("clientName", e.target.value)} placeholder="e.g. Mr. Sharma" />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Template</p>
                <div className="space-y-1.5 max-w-md">
                  <Label>Select Template</Label>
                  <SearchableSelect
                    options={templates.map((t) => ({ value: t.id, label: t.title }))}
                    value={form.templateId}
                    onChange={handleTemplateChange}
                    placeholder="Choose a document template..."
                    searchPlaceholder="Search templates..."
                    onSearchChange={setTemplateSearch}
                  />
                  {selectedTemplate && (
                    <p className="text-xs text-gray-500">Attribute: {selectedTemplate.attribute_name}</p>
                  )}
                  {templateHasNewTokens && (
                    <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                      <TriangleAlert className="size-3.5 shrink-0" />
                      Template updated — review variables
                    </div>
                  )}
                </div>
              </div>
            </FormCard>
          </TabsContent>

          <TabsContent value="variables" className="mt-4">
            <FormCard>
              <p className="text-sm font-semibold text-gray-900">Template Variables</p>
              {!form.templateId ? (
                <p className="text-sm text-gray-400">Select a template in Overview to see its variables.</p>
              ) : contentTokens.length === 0 ? (
                <p className="text-sm text-gray-400">This template has no variables.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contentTokens.map((token) => (
                    <div key={token} className="space-y-1">
                      <Label className="text-xs text-gray-600 font-mono">{`{${token}}`}</Label>
                      <Input
                        value={form.variables[token] ?? ""}
                        onChange={(e) => handleVariableChange(token, e.target.value)}
                        placeholder={`Enter ${token}...`}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </FormCard>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <FormCard>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-gray-900 mb-3">Status</p>
                <SegmentedToggle<string>
                  value={form.status}
                  onChange={(v) => onChange("status", v)}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Link to Project</p>
                <div className="space-y-1.5 max-w-md">
                  <Label>Project</Label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None" },
                      ...projects.map((p) => ({ value: p.slug, label: p.title })),
                    ]}
                    value={form.projectId}
                    onChange={(v) => onChange("projectId", v)}
                    placeholder="Select a project..."
                    searchPlaceholder="Search projects..."
                    onSearchChange={setProjectSearch}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Download & Export</p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger className="w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docx">Word (.docx)</SelectItem>
                        <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => downloadFile(exportFormat, exportFormat === "docx" ? "docx" : "txt")}>
                      <FileDown className="size-3.5" /> Download
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={saveAsPdf}>
                    <FileText className="size-3.5" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="size-3.5" /> Print
                  </Button>
                </div>
              </div>
            </FormCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
