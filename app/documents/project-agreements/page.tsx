"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AgreementAdmin } from "@/api/services/agreement.service";
import type { AgreementItem } from "@/api/types/agreement.types";
import { agreementSchema } from "@/api/validation/agreement";
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
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVariablesChange = (vars: Record<string, string>) => {
    setForm((prev) => ({ ...prev, variables: vars }));
  };

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof AgreementAdmin.create>[0]) =>
      AgreementAdmin.create(payload),
    onSuccess: () => { toast.success("Agreement created"); refetch(); back(); },
    onError: () => toast.error("Failed to create agreement"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof AgreementAdmin.update>[1] }) =>
      AgreementAdmin.update(id, payload),
    onSuccess: () => { toast.success("Agreement updated"); refetch(); back(); },
    onError: () => toast.error("Failed to update agreement"),
  });

  const save = () => {
    const parsed = agreementSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Validation failed");
      return;
    }
    const payload = formToPayload(form);
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
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
              className="text-sidebar-primary border-sidebar-primary/20"
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
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <AgreementTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <AgreementForm
            form={form}
            editingId={editingId}
            saving={createMutation.isPending || updateMutation.isPending}
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
