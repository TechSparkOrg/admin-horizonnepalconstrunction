"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PrivateDocumentAdmin } from "@/api/services/private-document.service";
import { ProjectAdmin } from "@/api/services/project.service";
import type { PrivateDocument } from "@/api/types/private-document.types";
import type { Project } from "@/api/types/project.types";
import { PrivateDocumentTable } from "@/components/page_ui/private-document-table";
import { PrivateDocumentForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/private-document-form";
import type { PrivateDocumentFormData } from "@/components/page_ui/private-document-form";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toSlug } from "@/lib/slug";

const ITEMS_PER_PAGE = 10;
type View = "list" | "form";

function apiToForm(item: PrivateDocument): PrivateDocumentFormData {
  return {
    title: item.title,
    slug: item.slug,
    project_id: item.project_id ?? "",
    documents: item.documents,
    proposals: item.proposals,
    status: item.status,
    contract_closed: item.contract_closed,
    date: item.date,
  };
}

function formToPayload(form: PrivateDocumentFormData) {
  return {
    title: form.title,
    slug: form.slug,
    project_id: form.project_id || null,
    documents: form.documents,
    proposals: form.proposals,
    status: form.status,
    contract_closed: form.contract_closed,
    date: form.date,
  };
}

export default function PrivateDocumentsPage() {
  const [items, setItems] = useState<PrivateDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PrivateDocumentFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, currentPage]);

  useEffect(() => {
    PrivateDocumentAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load documents"));
  }, [searchParams]);

  useEffect(() => {
    ProjectAdmin.list({ page_size: 10 })
      .then((res) => setProjects(res.results ?? []))
      .catch(() => {});
  }, []);

  const refetch = () => {
    PrivateDocumentAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load documents"));
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: PrivateDocument) => {
    setForm(apiToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));
  };

  const handleDocumentsChange = (docs: PrivateDocumentFormData["documents"]) => {
    setForm((prev) => ({ ...prev, documents: docs }));
  };

  const handleProposalsChange = (props: PrivateDocumentFormData["proposals"]) => {
    setForm((prev) => ({ ...prev, proposals: props }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await PrivateDocumentAdmin.update(editingId, payload);
        toast.success("Document updated");
      } else {
        await PrivateDocumentAdmin.create(payload as any);
        toast.success("Document created");
      }
      await refetch();
      back();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const text = msg
        ? Object.values(msg).flat().join(", ")
        : "Something went wrong";
      toast.error(text);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await PrivateDocumentAdmin.delete(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Private Documents</h1>
              <p className="text-xs text-gray-500 mt-1">Manage customer documents, proposals and contracts</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-sidebar-primary border-sidebar-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Document
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <InputGroup className="max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search documents..."
              />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <PrivateDocumentTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <PrivateDocumentForm
            form={form}
            editingId={editingId}
            saving={saving}
            projects={projects}
            onChange={handleChange}
            onDocumentsChange={handleDocumentsChange}
            onProposalsChange={handleProposalsChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
