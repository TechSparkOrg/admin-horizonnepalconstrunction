"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AgreementAdmin } from "@/api/services/agreement.service";
import type { AgreementItem } from "@/api/types/agreement.types";
import { AgreementTable } from "@/components/page_ui/agreement-table";
import { AgreementForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/agreement-form";
import type { AgreementFormData } from "@/components/page_ui/agreement-form";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;
type View = "list" | "form";

function itemToForm(item: AgreementItem): AgreementFormData {
  return {
    name: item.name,
    clientName: item.client_name,
    templateId: item.template,
    variables: item.variables ?? {},
    projectId: item.project ?? "",
    status: (item.status as "draft" | "completed") || "draft",
  };
}

function formToPayload(form: AgreementFormData) {
  return {
    name: form.name,
    client_name: form.clientName,
    template: form.templateId,
    variables: form.variables,
    project: form.projectId || null,
    status: form.status,
  };
}

export default function ProjectAgreementsPage() {
  const [items, setItems] = useState<AgreementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgreementFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, currentPage]);

  useEffect(() => {
    AgreementAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load agreements"));
  }, [searchParams]);

  const refetch = () => {
    AgreementAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load agreements"));
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: AgreementItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVariablesChange = (vars: Record<string, string>) => {
    setForm((prev) => ({ ...prev, variables: vars }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.templateId) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await AgreementAdmin.update(editingId, payload);
        toast.success("Agreement updated");
      } else {
        await AgreementAdmin.create(payload);
        toast.success("Agreement created");
      }
      await refetch();
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await AgreementAdmin.delete(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast.success("Agreement deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
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
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Project Agreements</h1>
              <p className="text-xs text-gray-500 mt-1">Manage client agreements and contracts</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
            >
              <Plus className="w-4 h-4" /> Add Agreement
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
                placeholder="Search agreements..."
              />
            </InputGroup>
            <p className="text-sm text-[lab(20_23.9_-60.14)] font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <AgreementTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteId={deleteId}
            setDeleteId={setDeleteId}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <AgreementForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={handleChange}
            onVariablesChange={handleVariablesChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
