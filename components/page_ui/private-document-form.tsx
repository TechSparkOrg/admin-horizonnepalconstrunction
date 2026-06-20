"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, X, Eye, ImagePlus, FileText, Check, Upload, Trash2 } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import { AgreementAdmin } from "@/api/services/agreement.service";
import { ProjectAdmin } from "@/api/services/project.service";
import type { Project } from "@/api/types/project.types";
import type { AgreementItem } from "@/api/types/agreement.types";
import type {
  PrivateDocDocumentItem,
  PrivateDocProposalItem,
} from "@/api/types/private-document.types";

const ITEMS_PER_PAGE = 5;

function emptyDocItem(): PrivateDocDocumentItem {
  return { type: "government", title: "", image: "" };
}

function emptyPropItem(): PrivateDocProposalItem {
  return { type: "company", title: "", document_url: "", agreement_id: "", agreement_name: "" };
}

interface PrivateDocumentFormData {
  title: string;
  slug: string;
  project_id: string;
  documents: PrivateDocDocumentItem[];
  proposals: PrivateDocProposalItem[];
  status: "active" | "inactive";
  contract_closed: boolean;
  date: string;
}

interface Props {
  form: PrivateDocumentFormData;
  editingId: string | null;
  saving: boolean;
  projects: Project[];
  onChange: (key: string, value: string | boolean) => void;
  onDocumentsChange: (docs: PrivateDocDocumentItem[]) => void;
  onProposalsChange: (props: PrivateDocProposalItem[]) => void;
  onSave: () => void;
  onBack: () => void;
}

const EMPTY: PrivateDocumentFormData = {
  title: "",
  slug: "",
  project_id: "",
  documents: [],
  proposals: [],
  status: "active",
  contract_closed: false,
  date: "",
};

export { EMPTY };
export type { PrivateDocumentFormData };

export function PrivateDocumentForm({
  form, editingId, saving, projects,
  onChange, onDocumentsChange, onProposalsChange,
  onSave, onBack,
}: Props) {
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const [docPickerTarget, setDocPickerTarget] = useState<"doc" | "prop" | null>(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ tab: "documents"; index: number } | { tab: "proposals"; index: number } | null>(null);
  const [docPage, setDocPage] = useState(1);
  const [propPage, setPropPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [agreementSearch, setAgreementSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectOptions, setProjectOptions] = useState<Project[]>(projects);

  useEffect(() => {
    setProjectOptions(projects);
  }, [projects]);

  const debounceAgreements = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(debounceAgreements.current);
    debounceAgreements.current = setTimeout(() => {
      AgreementAdmin.search({ search: agreementSearch || undefined, page_size: 10 })
        .then((res) => setAgreements(res.results ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(debounceAgreements.current);
  }, [agreementSearch]);

  const debounceProjects = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(debounceProjects.current);
    debounceProjects.current = setTimeout(() => {
      ProjectAdmin.list({ search: projectSearch || undefined, page_size: 10 })
        .then((res) => setProjectOptions(res.results ?? []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(debounceProjects.current);
  }, [projectSearch]);

  const totalDocPages = Math.ceil(form.documents.length / ITEMS_PER_PAGE);
  const paginatedDocs = form.documents.slice(
    (docPage - 1) * ITEMS_PER_PAGE,
    docPage * ITEMS_PER_PAGE
  );

  const totalPropPages = Math.ceil(form.proposals.length / ITEMS_PER_PAGE);
  const paginatedProps = form.proposals.slice(
    (propPage - 1) * ITEMS_PER_PAGE,
    propPage * ITEMS_PER_PAGE
  );

  const addDocument = () => {
    setDocPage(Math.ceil((form.documents.length + 1) / ITEMS_PER_PAGE));
    onDocumentsChange([...form.documents, emptyDocItem()]);
  };

  const removeDocument = (i: number) => {
    const realIndex = (docPage - 1) * ITEMS_PER_PAGE + i;
    onDocumentsChange(form.documents.filter((_, idx) => idx !== realIndex));
  };

  const updateDocument = (i: number, key: string, value: string) => {
    const realIndex = (docPage - 1) * ITEMS_PER_PAGE + i;
    onDocumentsChange(form.documents.map((d, idx) => idx === realIndex ? { ...d, [key]: value } : d));
  };

  const addProposal = () => {
    setPropPage(Math.ceil((form.proposals.length + 1) / ITEMS_PER_PAGE));
    onProposalsChange([...form.proposals, emptyPropItem()]);
  };

  const removeProposal = (i: number) => {
    const realIndex = (propPage - 1) * ITEMS_PER_PAGE + i;
    onProposalsChange(form.proposals.filter((_, idx) => idx !== realIndex));
  };

  const updateProposal = (i: number, key: string, value: string) => {
    const realIndex = (propPage - 1) * ITEMS_PER_PAGE + i;
    onProposalsChange(form.proposals.map((p, idx) => idx === realIndex ? { ...p, [key]: value } : p));
  };

  const handleAgreementSelect = (i: number, agreementId: string) => {
    const realIndex = (propPage - 1) * ITEMS_PER_PAGE + i;
    const agreement = agreements.find((a) => a.id === agreementId);
    onProposalsChange(form.proposals.map((p, idx) =>
      idx === realIndex ? {
        ...p,
        agreement_id: agreementId,
        agreement_name: agreement ? `${agreement.name} \u2014 ${agreement.client_name}` : "",
      } : p
    ));
  };

  const handleMediaSelect = (item: PickerMediaItem) => {
    if (mediaPickerTarget?.tab === "documents") {
      const idx = mediaPickerTarget.index;
      onDocumentsChange(form.documents.map((d, i) =>
        i === idx ? { ...d, image: item.url, title: d.title || item.name } : d
      ));
    } else if (mediaPickerTarget?.tab === "proposals") {
      const idx = mediaPickerTarget.index;
      onProposalsChange(form.proposals.map((p, i) =>
        i === idx ? { ...p, document_url: item.url, title: p.title || item.name } : p
      ));
    }
    setDocPickerOpen(false);
    setMediaPickerTarget(null);
  };

  const openDocMediaPicker = (realIndex: number) => {
    setMediaPickerTarget({ tab: "documents", index: realIndex });
    setDocPickerOpen(true);
  };

  const openPropMediaPicker = (realIndex: number) => {
    setMediaPickerTarget({ tab: "proposals", index: realIndex });
    setDocPickerOpen(true);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Private Documents"
        title={editingId ? form.title || "Edit Document" : "New Document"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingId ? "Update" : "Create"}
      />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"overview","label":"Overview"},{"value":"documents","label":"Documents"},{"value":"proposals","label":"Proposals"},{"value":"settings","label":"Settings"}]} />
        </div>

        <div>
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title <span className="text-red-500">*</span></Label>
                    <Input value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="e.g. Land Registration" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug <span className="text-red-500">*</span></Label>
                    <Input value={form.slug} onChange={(e) => onChange("slug", e.target.value)} placeholder="auto-generated" />
                  </div>
                </div>
                <div className="space-y-1.5 max-w-md">
                  <Label>Project</Label>
                  <SearchableSelect
                    options={[
                      { value: "", label: "None" },
                      ...projectOptions.map((p) => ({ value: p.slug, label: p.title })),
                    ]}
                    value={form.project_id}
                    onChange={(v) => onChange("project_id", v)}
                    placeholder="Select a project..."
                    searchPlaceholder="Search projects..."
                    onSearchChange={setProjectSearch}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900">Document Items</p>
                  <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                    <ImagePlus className="size-4" /> Add Document
                  </Button>
                </div>

                {form.documents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <ImagePlus className="size-6" />
                    <span className="text-sm">No documents added yet</span>
                  </div>
                ) : (
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-900 font-semibold">Image</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Title</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Type</TableHead>
                          <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedDocs.map((doc, i) => {
                          const realIndex = (docPage - 1) * ITEMS_PER_PAGE + i;
                          return (
                            <TableRow key={realIndex} className="border-gray-200 hover:bg-gray-50">
                              <TableCell>
                                <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative cursor-pointer" onClick={() => openDocMediaPicker(realIndex)}>
                                  {doc.image ? (
                                    <Image src={doc.image} alt="" fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Upload className="size-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={doc.title}
                                  onChange={(e) => updateDocument(i, "title", e.target.value)}
                                  placeholder="Document title"
                                  className="h-8 text-sm border-0 bg-transparent focus:border focus:border-gray-200 focus:bg-white px-0 focus:px-2 -ml-2"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                                  <button type="button" onClick={() => updateDocument(i, "type", "government")}
                                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                                      doc.type === "government" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                                    }`}>Gov</button>
                                  <button type="button" onClick={() => updateDocument(i, "type", "personal")}
                                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                                      doc.type === "personal" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                                    }`}>Per</button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => doc.image && setPreviewUrl(doc.image)}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeDocument(i)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {totalDocPages > 1 && (
                      <div className="mt-3">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setDocPage((p) => Math.max(1, p - 1))}
                                className={docPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: totalDocPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === docPage}
                                  onClick={() => setDocPage(page)}
                                  className="cursor-pointer"
                                >{page}</PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setDocPage((p) => Math.min(totalDocPages, p + 1))}
                                className={docPage === totalDocPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900">Proposal Items</p>
                  <Button type="button" variant="outline" size="sm" onClick={addProposal}>
                    <Plus className="size-4" /> Add Proposal
                  </Button>
                </div>

                {form.proposals.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <FileText className="size-6" />
                    <span className="text-sm">No proposals added yet</span>
                  </div>
                ) : (
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-transparent">
                          <TableHead className="text-gray-900 font-semibold">File</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Title</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Type</TableHead>
                          <TableHead className="text-gray-900 font-semibold">Reference</TableHead>
                          <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProps.map((prop, i) => {
                          const realIndex = (propPage - 1) * ITEMS_PER_PAGE + i;
                          return (
                            <TableRow key={realIndex} className="border-gray-200 hover:bg-gray-50">
                              <TableCell>
                                {prop.type === "client" ? (
                                  <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative cursor-pointer" onClick={() => openPropMediaPicker(realIndex)}>
                                    {prop.document_url ? (
                                      prop.document_url.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i) ? (
                                        <Image src={prop.document_url} alt="" fill className="object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="size-5 text-gray-400" />
                                        </div>
                                      )
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Upload className="size-4 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="size-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                    <FileText className="size-5 text-gray-400" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={prop.title}
                                  onChange={(e) => updateProposal(i, "title", e.target.value)}
                                  placeholder="Proposal title"
                                  className="h-8 text-sm border-0 bg-transparent focus:border focus:border-gray-200 focus:bg-white px-0 focus:px-2 -ml-2"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                                  <button type="button" onClick={() => updateProposal(i, "type", "company")}
                                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                                      prop.type === "company" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                                    }`}>Comp</button>
                                  <button type="button" onClick={() => updateProposal(i, "type", "client")}
                                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition ${
                                      prop.type === "client" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                                    }`}>Client</button>
                                </div>
                              </TableCell>
                              <TableCell>
                                {prop.type === "company" ? (
                                  prop.agreement_id ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                                      <Check className="size-3.5 text-green-600 shrink-0" />
                                      <span className="text-xs text-green-700 font-medium truncate max-w-[160px]">{prop.agreement_name}</span>
                                      <button type="button" onClick={() => { updateProposal(i, "agreement_id", ""); updateProposal(i, "agreement_name", ""); }}
                                        className="ml-1 text-green-500 hover:text-green-700">
                                        <X className="size-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <SearchableSelect
                                      options={[
                                        { value: "", label: "None" },
                                        ...agreements.map((a) => ({ value: a.id, label: `${a.name} — ${a.client_name}` })),
                                      ]}
                                      value={prop.agreement_id || ""}
                                      onChange={(v) => handleAgreementSelect(i, v)}
                                      placeholder="Agreement..."
                                      searchPlaceholder="Search agreements..."
                                      triggerClassName="h-8 text-xs w-[180px]"
                                    />
                                  )
                                ) : prop.document_url ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-gray-500 truncate max-w-[140px]">{prop.document_url.split("/").pop()}</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => updateProposal(i, "document_url", "")}>
                                      <X className="size-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => openPropMediaPicker(realIndex)}>
                                    <Upload className="size-3 mr-1" /> Upload
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="outline" size="sm" className={`${prop.type === "company" ? (prop.agreement_id ? "text-gray-500 border-gray-200" : "opacity-30 pointer-events-none") : prop.document_url ? "text-gray-500 border-gray-200" : "opacity-30 pointer-events-none"} hover:bg-gray-100`}
                                    onClick={() => {
                                      if (prop.type === "client" && prop.document_url) setPreviewUrl(prop.document_url);
                                    }}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeProposal(i)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {totalPropPages > 1 && (
                      <div className="mt-3">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setPropPage((p) => Math.max(1, p - 1))}
                                className={propPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: totalPropPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === propPage}
                                  onClick={() => setPropPage(page)}
                                  className="cursor-pointer"
                                >{page}</PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setPropPage((p) => Math.min(totalPropPages, p + 1))}
                                className={propPage === totalPropPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
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
                    <button type="button" onClick={() => onChange("status", "active")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.status === "active" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Active</button>
                    <button type="button" onClick={() => onChange("status", "inactive")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.status === "inactive" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                      }`}>Inactive</button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Contract</p>
                  <div className="space-y-1.5">
                    <Label>Contract Closed</Label>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                      <button type="button" onClick={() => onChange("contract_closed", true)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.contract_closed === true ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>Yes</button>
                      <button type="button" onClick={() => onChange("contract_closed", false)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          form.contract_closed === false ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"
                        }`}>No</button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-1.5 max-w-xs">
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="!max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-3 pb-0">
            <DialogTitle className="text-sm font-semibold text-gray-800">Preview</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex items-center justify-center min-h-[300px]">
            {previewUrl && (
              previewUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i)
                ? <img src={previewUrl} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                : <iframe src={previewUrl} className="w-full h-[80vh] rounded-lg" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={docPickerOpen}
        onOpenChange={(o) => { setDocPickerOpen(o); if (!o) setMediaPickerTarget(null); }}
        mode="image"
        title="Select Image"
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
