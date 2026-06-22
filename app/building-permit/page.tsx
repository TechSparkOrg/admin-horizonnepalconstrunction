"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { BuildingPermitAdmin } from "@/api/services/building-permit.service";
import type { BuildingPermit } from "@/api/types/building-permit.types";
import { BuildingPermitTable } from "@/components/page_ui/building-permit-table";
import { BuildingPermitForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/building-permit-form";
import type { BuildingPermitFormData } from "@/components/page_ui/building-permit-form";
import { toSlug } from "@/lib/slug";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup, InputGroupAddon, InputGroupInput,
} from "@/components/ui/input-group";
import { useMutation } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 10;
type View = "list" | "form";

function itemToForm(item: BuildingPermit): BuildingPermitFormData {
  return {
    title: item.title,
    slug: item.slug,
    isActive: item.is_active,
    workflowSteps: item.workflow_steps?.length
      ? item.workflow_steps.map((s) => ({
          name: s.name || "",
          description: { ...s.description },
          duration: s.duration || "",
          requiredDocs: s.requiredDocs?.length
            ? s.requiredDocs.map((d) => ({ name: d.name, imageUrl: d.imageUrl || "" }))
            : [],
        }))
      : [],
    regulationItems: item.regulation_items?.length
      ? item.regulation_items.map((r) => ({
          name: r.name || "",
          items: r.items?.length ? r.items.map((c) => ({ ...c })) : [],
        }))
      : [],
    municipalityItems: item.municipality_items?.length
      ? item.municipality_items.map((m) => ({
          district: m.district || "",
          phone: m.phone || "",
          location: m.location || "",
        }))
      : [],
    banners: item.banners?.length ? item.banners.map((b) => ({ ...b })) : [],
    metaTitle: item.meta_title,
    metaKeywords: item.meta_keywords,
    metaDescription: item.meta_description,
  };
}

function formToPayload(form: BuildingPermitFormData) {
  return {
    title: form.title,
    slug: form.slug,
    is_active: form.isActive,
    workflow_steps: form.workflowSteps.map((s) => ({
      name: s.name,
      description: s.description,
      duration: s.duration,
      requiredDocs: s.requiredDocs.map((d) => ({ name: d.name, imageUrl: d.imageUrl })),
    })),
    regulation_items: form.regulationItems.map((r) => ({
      name: r.name,
      items: r.items,
    })),
    municipality_items: form.municipalityItems.map((m) => ({
      district: m.district,
      phone: m.phone,
      location: m.location,
    })),
    banners: form.banners,
    meta_title: form.metaTitle,
    meta_keywords: form.metaKeywords,
    meta_description: form.metaDescription,
  };
}

export default function AdminBuildingPermitPage() {
  const [items, setItems] = useState<BuildingPermit[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BuildingPermitFormData>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, currentPage]);

  useEffect(() => {
    BuildingPermitAdmin.search(searchParams)
      .then((res) => { setItems(res.results ?? []); setTotal(res.count ?? 0); })
      .catch(() => toast.error("Failed to load data"));
  }, [searchParams]);

  const createMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof formToPayload>) => BuildingPermitAdmin.create(payload),
    onSuccess: () => {
      toast.success("Building permit created");
      refetch();
      back();
    },
    onError: () => toast.error("Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof formToPayload> }) =>
      BuildingPermitAdmin.update(id, payload),
    onSuccess: () => {
      toast.success("Building permit updated");
      refetch();
      back();
    },
    onError: () => toast.error("Failed to update"),
  });

  const refetch = () =>
    BuildingPermitAdmin.search(searchParams)
      .then((res) => { setItems(res.results ?? []); setTotal(res.count ?? 0); })
      .catch(() => toast.error("Failed to load building permit"));

  const openNew = () => { setForm(EMPTY_FORM); setEditingId(null); setView("form"); };
  const openEdit = (item: BuildingPermit) => { setForm(itemToForm(item)); setEditingId(item.id); setView("form"); };
  const back = () => { setForm(EMPTY_FORM); setView("list"); };

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId && typeof value === "string" ? { slug: toSlug(value) } : {}),
    }));
  };

  const save = () => {
    if (!form.title.trim()) return;
    const payload = formToPayload(form);
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await BuildingPermitAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Building permit deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const handleSearchChange = (value: string) => { setSearch(value); setCurrentPage(1); };

  return (
    <>
      {view === "list" ? (
        <PageHeader title="Building Permit" subtitle="Manage workflow, regulations, municipalities, and banners" actionLabel="Add Building Permit" onAction={openNew}>
          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start"><Search className="size-4 text-muted-foreground" /></InputGroupAddon>
              <InputGroupInput value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search" />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">Total: {total} {total === 1 ? "item" : "items"} found.</p>
          </div>
          <BuildingPermitTable items={items} onEdit={openEdit} onDelete={confirmDelete} page={currentPage} totalPages={totalPages} totalCount={total} onPageChange={setCurrentPage} />
        </PageHeader>
      ) : (
        <div className="px-4">
          <BuildingPermitForm form={form} editingId={editingId} saving={createMutation.isPending || updateMutation.isPending} onChange={handleChange} onSave={save} onBack={back} />
        </div>
      )}
    </>
  );
}
