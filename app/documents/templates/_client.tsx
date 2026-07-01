"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { AttributeAdmin } from "@/api/services/attribute.service";
import { TemplateAdmin } from "@/api/services/template.service";
import type { TemplateItem } from "@/api/types/template.types";
import { templateSchema } from "@/api/validation/template";
import { TemplateTable } from "@/components/page_ui/template-table";
import dynamic from "next/dynamic";
import type { TemplateFormData } from "@/components/page_ui/template-form";
const TemplateForm = dynamic(() => import("@/components/page_ui/template-form").then((m) => m.TemplateForm), { ssr: false });
const EMPTY_FORM: TemplateFormData = { attributeId: "", title: "", slug: "", isActive: true, backgroundImage: false, backgroundImageUrl: "", showStamp: false, stampImageUrl: "", showSignature: false, signatureImageUrl: "", content: "" };
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;
type View = "list" | "form";

function itemToForm(item: TemplateItem): TemplateFormData {
  return {
    attributeId: item.attribute_id,
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

function formToPayload(form: TemplateFormData) {
  return {
    title: form.title,
    slug: form.slug,
    is_active: form.isActive,
    attribute: form.attributeId,
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
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
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

  const { data: attributes = [] } = useQuery({
    queryKey: queryKeys.attributes.all,
    queryFn: async () => {
      const res = await AttributeAdmin.search({ page_size: 10, used_in: "all,staff" });
      return res.results ?? [];
    },
    staleTime: Infinity,
    enabled: view === "form",
  });

  const searchParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [debouncedSearch, currentPage]);

  useEffect(() => {
    TemplateAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotalCount(res.count ?? 0);
        setNextUrl(res.next);
        setPrevUrl(res.previous);
      })
      .catch(() => toast.error("Failed to load templates"));
  }, [searchParams]);

  const refetch = () => {
    TemplateAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotalCount(res.count ?? 0);
        setNextUrl(res.next);
        setPrevUrl(res.previous);
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
    const parsed = templateSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Validation failed");
      return;
    }
    if (!form.attributeId) {
      toast.error("Please select an attribute");
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
      await TemplateAdmin.delete(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
              className="text-sidebar-primary border-sidebar-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Template
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
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
              Total: {totalCount} {totalCount === 1 ? "item" : "items"} found.
            </p>
          </div>

          <TemplateTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            hasNext={nextUrl !== null}
            hasPrevious={prevUrl !== null}
          />
        </div>
      ) : (
        <div className="px-4">
          <TemplateForm
            form={form}
            editingId={editingId}
            saving={createMutation.isPending || updateMutation.isPending}
            attributes={attributes}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
