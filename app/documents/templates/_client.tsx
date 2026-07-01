"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAttributeOptions } from "@/api/hooks/use-attribute-query";
import { TemplateAdmin } from "@/api/services/template.service";
import type { TemplateItem } from "@/api/types/template.types";
import { templateSchema } from "@/api/validation/template";
import { TemplateTable } from "@/components/page_ui/template-table";
import { TemplateForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/template-form";
import type { TemplateFormData } from "@/components/page_ui/template-form";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;
type View = "list" | "form";

function itemToForm(item: TemplateItem): TemplateFormData {
  return {
    title: item.title,
    slug: item.slug,
    isActive: item.is_active,
    backgroundImage: item.background_image,
    backgroundImageUrl: item.background_image_url,
    showStamp: item.show_stamp,
    stampImageUrl: item.stamp_image_url,
    showSignature: item.show_signature,
    signatureImageUrl: item.signature_image_url,
    content: item.content,
  };
}

function formToPayload(form: TemplateFormData, attributeId: string) {
  return {
    title: form.title,
    slug: form.slug,
    is_active: form.isActive,
    attribute: attributeId,
    background_image: form.backgroundImage,
    background_image_url: form.backgroundImageUrl,
    show_stamp: form.showStamp,
    stamp_image_url: form.stampImageUrl,
    show_signature: form.showSignature,
    signature_image_url: form.signatureImageUrl,
    content: form.content,
  };
}

export function _Client() {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormData>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: attributes = [] } = useAttributeOptions();
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");

  useEffect(() => {
    if (attributes.length > 0 && !selectedAttributeId) {
      setSelectedAttributeId(attributes[0].id);
    }
  }, [attributes]);

  const selectedAttribute = attributes.find((a) => a.id === selectedAttributeId);

  const attributeGroups = useMemo(
    () => selectedAttribute?.values.map((g) => ({ label: g.label, values: g.values })) ?? [],
    [selectedAttribute]
  );

  const searchParams = useMemo(() => ({
    attribute_id: selectedAttributeId || undefined,
    search: debouncedSearch || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [selectedAttributeId, debouncedSearch, currentPage]);

  useEffect(() => {
    if (!selectedAttributeId) return;
    TemplateAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load templates"));
  }, [searchParams, selectedAttributeId]);

  const refetch = () => {
    if (!selectedAttributeId) return;
    TemplateAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load templates"));
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: TemplateItem) => {
    setForm(itemToForm(item));
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
      ...(key === "title" && !editingId && typeof value === "string" ? { slug: toSlug(value) } : {}),
    }));
  };

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof TemplateAdmin.create>[0]) =>
      TemplateAdmin.create(payload),
    onSuccess: () => { toast.success("Template created"); refetch(); back(); },
    onError: () => toast.error("Failed to create template"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof TemplateAdmin.update>[1] }) =>
      TemplateAdmin.update(id, payload),
    onSuccess: () => { toast.success("Template updated"); refetch(); back(); },
    onError: () => toast.error("Failed to update template"),
  });

  const save = () => {
    if (!selectedAttributeId) return;
    const parsed = templateSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Validation failed");
      return;
    }
    const payload = formToPayload(form, selectedAttributeId);
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await TemplateAdmin.delete(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
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
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Templates</h1>
              <p className="text-xs text-gray-500 mt-1">Document blueprint structures</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              disabled={!selectedAttributeId}
              className="text-sidebar-primary border-sidebar-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Template
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="w-48">
              <SearchableSelect
                options={attributes.map((a) => ({ value: a.id, label: a.title }))}
                value={selectedAttributeId}
                onChange={(v) => { setSelectedAttributeId(v); setCurrentPage(1); }}
                placeholder="Select attribute..."
                searchPlaceholder="Search attributes..."

              />
            </div>
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search templates..."
              />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          {!selectedAttributeId ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <p className="text-sm text-gray-400">Select an attribute above to view templates.</p>
            </div>
          ) : (
            <TemplateTable
              items={items}
              onEdit={openEdit}
              onDelete={confirmDelete}
              page={currentPage}
              totalPages={totalPages}
              totalCount={total}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      ) : (
        <div className="px-4">
          <TemplateForm
            form={form}
            editingId={editingId}
            saving={createMutation.isPending || updateMutation.isPending}
            attributeGroups={attributeGroups}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
