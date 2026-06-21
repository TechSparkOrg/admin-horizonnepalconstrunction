"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/global_ui/page-header";
import { queryKeys } from "@/api/query-keys";
import type { Category, CategoryCreate } from "@/api/types/category.types";
import { CategoryTable } from "@/components/page_ui/category-table";
import { CategoryForm } from "@/components/page_ui/category-form";
import type { CategoryFormData } from "@/api/validation/category";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { buildTree } from "@/lib/category";

const PAGE_SIZE = 10;

interface ServiceMethods {
  list: (params?: Record<string, unknown>) => Promise<{ count: number; results: Category[] }>;
  create: (data: CategoryCreate) => Promise<Category>;
  update: (id: string, data: Partial<CategoryCreate>) => Promise<Category>;
  remove: (id: string) => Promise<{ ok: boolean }>;
}

interface Props {
  heading: string;
  breadcrumb: string;
  services: ServiceMethods;
  queryType: string;
  showTypeField?: boolean;
  showTypeColumn?: boolean;
}

export function CategorySectionPage({ heading, breadcrumb, services, queryType, showTypeField = false, showTypeColumn = false }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Category | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const { data } = useQuery({
    queryKey: [...queryKeys.categories.list(queryType), page],
    queryFn: async () => {
      const res = await services.list({ page });
      return { items: res.results ?? [], totalCount: res.count ?? 0 };
    },
  });

  const flatCats = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const treeCats = useMemo(() => buildTree(flatCats), [flatCats]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.list(queryType) });

  const saveMutation = useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      const payload: CategoryCreate = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || "",
        image: formData.image || "",
        type: formData.type,
        is_active: formData.isActive,
        parent_id: formData.parent_id || null,
        meta_title: formData.metaTitle || "",
        meta_description: formData.metaDescription || "",
        meta_keywords: formData.metaKeywords || "",
        banner_images: formData.bannerImages || [],
      };
      if (editing) {
        await services.update(editing.id, payload);
      } else {
        await services.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Category updated" : "Category created");
      invalidate();
      setView("list");
      setEditing(null);
    },
    onError: (err: unknown) => {
      const responseData = (err as any)?.response?.data;
      const msg = responseData
        ? Object.values(responseData).flat().filter(Boolean).join(', ')
        : "Something went wrong";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await services.remove(id);
    },
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
      if (flatCats.length <= 1 && page > 1) setPage((p) => p - 1);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleSave = async (data: CategoryFormData) => {
    setSaving(true);
    try {
      await saveMutation.mutateAsync(data);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCategory) return;
    const id = deleteCategory.id;
    setDeleteCategory(null);
    await deleteMutation.mutateAsync(id);
  };

  const openCreate = useCallback(() => {
    setEditing(null);
    setView("form");
  }, []);

  const openEdit = useCallback((cat: Category) => {
    setEditing(cat);
    setView("form");
  }, []);

  if (view === "form") {
    return (
      <CategoryForm
        editing={editing}
        saving={saving}
        onSave={handleSave}
        onBack={() => { setView("list"); setEditing(null); }}
        parentCats={flatCats}
        showTypeField={showTypeField}
      />
    );
  }

  return (
    <PageHeader title={heading} subtitle={`Categories / ${breadcrumb}`} actionLabel="Add Category" onAction={openCreate}>
      <CategoryTable
        categories={treeCats}
        page={page}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={(p) => setPage(p)}
        onEdit={openEdit}
        onDelete={(cat) => setDeleteCategory(cat)}
        showTypeColumn={showTypeColumn}
      />
      <DeleteDialog
        open={!!deleteCategory}
        onOpenChange={(o) => { if (!o) setDeleteCategory(null); }}
        onConfirm={confirmDelete}
        title={`Delete "${deleteCategory?.name}"?`}
        description={`Are you sure you want to delete "${deleteCategory?.name}"? This cannot be undone.`}
      />
    </PageHeader>
  );
}
