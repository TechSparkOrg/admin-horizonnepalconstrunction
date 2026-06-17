"use client";

import { ArrowLeft, Loader2, FileText, Printer, FileDown, TriangleAlert } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";

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

  useEffect(() => {
    TemplateAdmin.search({ page_size: 100 })
      .then((res) => setTemplates(res.results ?? []))
      .catch(() => {});
    ProjectAdmin.list({ page_size: 100 })
      .then((res) => setProjects(res.results ?? []))
      .catch(() => {});
  }, []);

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
      const res = await apiPrivate.get(`/admin/agreements/${editingId}?download=${format}`, {
        responseType: "blob",
      });
      const blob = res.data;
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
      const res = await apiPrivate.get(`/admin/agreements/${editingId}?download=html`, {
        responseType: "text",
      });
      const html = res.data;
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
      const res = await apiPrivate.get(`/admin/agreements/${editingId}?download=pdf`, {
        responseType: "blob",
      });
      const blob = res.data;
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="size-4" /></Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Project Agreements</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">{editingId ? form.name || "Edit Agreement" : "New Agreement"}</h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.name.trim() || saving}
          className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Overview</TabsTrigger>
            <TabsTrigger value="variables" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Variables</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Settings</TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
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
                    <Select value={form.templateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a document template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variables" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Status</p>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button type="button" onClick={() => onChange("status", "draft")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.status === "draft" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Draft</button>
                    <button type="button" onClick={() => onChange("status", "completed")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.status === "completed" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Completed</button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Link to Project</p>
                  <div className="space-y-1.5 max-w-md">
                    <Label>Project</Label>
                    <Select
                      value={form.projectId || "none"}
                      onValueChange={(v) => onChange("projectId", v === "none" ? "" : v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a project..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
