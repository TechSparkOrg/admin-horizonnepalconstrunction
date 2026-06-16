"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { BuildingPermitAdmin } from "@/api/services/building-permit.service";
import type { BuildingPermitItem, BuildingPermitItemType, BilingualPair, DocumentExample } from "@/api/types/building-permit.types";
import { BuildingPermitTable } from "@/components/page_ui/building-permit-table";
import { BuildingPermitForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/building-permit-form";
import type { BuildingPermitFormData } from "@/components/page_ui/building-permit-form";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

const TYPE_BUTTONS: { type: BuildingPermitItemType; label: string }[] = [
  { type: "workflow_step", label: "Workflow Step" },
  { type: "doc_category", label: "Doc Category" },
  { type: "regulation", label: "Regulation" },
  { type: "municipality", label: "Municipality" },
];

function formForType(type: BuildingPermitItemType): BuildingPermitFormData {
  return { ...EMPTY_FORM, type };
}

function itemToForm(item: BuildingPermitItem): BuildingPermitFormData {
  return {
    type: item.type,
    title: item.title,
    slug: item.slug,
    order: item.order,
    isActive: item.is_active,
    stepNumber: item.step_number,
    description: { ...item.description },
    duration: item.duration,
    documents: [...item.documents],
    label: { ...item.label },
    items: item.items.map((c) => ({ ...c })),
    district: item.district,
    phone: item.phone,
    documentExamples: (item.document_examples ?? []).map((d) => ({ ...d })),
    metaTitle: item.meta_title,
    metaKeywords: item.meta_keywords,
    metaDescription: item.meta_description,
  };
}

export default function AdminBuildingPermitPage() {
  const [items, setItems] = useState<BuildingPermitItem[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BuildingPermitFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BuildingPermitItemType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, typeFilter, currentPage]);

  useEffect(() => {
    BuildingPermitAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load data"));
  }, [searchParams]);

  const refetch = () =>
    BuildingPermitAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load building permit items"));

  const openNew = (type: BuildingPermitItemType) => {
    setForm(formForType(type));
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: BuildingPermitItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number | BilingualPair | BilingualPair[] | string[] | DocumentExample[]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));
  };

  const handleListChange = (listKey: string, items: BilingualPair[]) => {
    setForm((prev) => ({ ...prev, [listKey]: items }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        title: form.title,
        slug: form.slug,
        order: form.order,
        is_active: form.isActive,
        step_number: form.stepNumber,
        description: form.description,
        duration: form.duration,
        documents: form.documents,
        label: form.label,
        items: form.items,
        district: form.district,
        phone: form.phone,
        document_examples: form.documentExamples,
        meta_title: form.metaTitle,
        meta_keywords: form.metaKeywords,
        meta_description: form.metaDescription,
      };
      if (editingId) {
        await BuildingPermitAdmin.update(editingId, payload);
        toast.success("Building permit item updated");
      } else {
        const create =
          form.type === "workflow_step"
            ? BuildingPermitAdmin.createWorkflowStep(payload)
            : form.type === "doc_category"
              ? BuildingPermitAdmin.createDocCategory(payload)
              : form.type === "regulation"
                ? BuildingPermitAdmin.createRegulation(payload)
                : BuildingPermitAdmin.createMunicipality(payload);
        await create;
        toast.success("Building permit item created");
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
      await BuildingPermitAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Building permit item deleted");
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

  const handleTypeFilterChange = (v: string) => {
    setTypeFilter(v as BuildingPermitItemType | "all");
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Building Permit</h1>
              <p className="text-xs text-gray-500 mt-1">Workflow steps, document categories, regulations, and municipalities</p>
            </div>
            <div className="flex items-center gap-2">
              {TYPE_BUTTONS.map((btn) => (
                <Button
                  key={btn.type}
                  variant="outline"
                  size="sm"
                  onClick={() => openNew(btn.type)}
                  className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
                >
                  <Plus className="w-4 h-4" /> {btn.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <Select
              value={typeFilter}
              onValueChange={handleTypeFilterChange}
            >
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="workflow_step">Workflow Step</SelectItem>
                <SelectItem value="doc_category">Doc Category</SelectItem>
                <SelectItem value="regulation">Regulation</SelectItem>
                <SelectItem value="municipality">Municipality</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-[lab(20_23.9_-60.14)] font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <BuildingPermitTable
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
          <BuildingPermitForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={handleChange}
            onListChange={handleListChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
