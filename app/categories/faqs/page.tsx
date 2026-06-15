"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryAdmin } from "@/api/services/category.service";
import type { Category, CategoryCreate } from "@/api/types/category.types";
import { CategoryTable } from "@/components/page_ui/category-table";
import { CategoryForm, type CategoryFormData } from "@/components/page_ui/category-form";
import { DeleteDialog } from "@/components/global_ui/delete_dailog";
import { buildTree } from "@/lib/category";

const PAGE_SIZE = 20;

export default function FaqCategoriesPage() {
  const [flatCats, setFlatCats] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editing, setEditing] = useState<Category | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const treeCats = useMemo(() => buildTree(flatCats), [flatCats]);

  const fetchAll = async (pageNum = 1) => {
    try {
      const res = await CategoryAdmin.listFaq({ page: pageNum });
      setPage(pageNum);
      setTotalCount(res.count);
      setFlatCats(res.results ?? []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => { fetchAll(1); }, []);

  const handleSave = async (data: CategoryFormData) => {
    const payload: CategoryCreate = {
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      image: data.image || "",
      type: data.type,
      is_active: data.isActive,
      parent_id: data.parent_id || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await CategoryAdmin.updateFaq(editing.id, payload);
        toast.success("Category updated");
      } else {
        await CategoryAdmin.createFaq(payload);
        toast.success("Category created");
      }
      await fetchAll(1);
      setView("list");
      setEditing(null);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await CategoryAdmin.deleteFaq(deleteId);
      const prevCount = flatCats.length;
      const wasLastOnPage = prevCount <= 1 && page > 1;
      const nextPage = wasLastOnPage ? page - 1 : page;
      await fetchAll(nextPage);
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setView("form");
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setView("form");
  };

  if (view === "form") {
    return (
      <CategoryForm
        editing={editing}
        saving={saving}
        onSave={handleSave}
        onBack={() => { setView("list"); setEditing(null); }}
        parentCats={flatCats}
        showTypeField={false}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">FAQ Categories</h1>
          <p className="text-xs text-gray-500 mt-1">Categories / FAQ</p>
        </div>
        <Button onClick={openCreate} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>
      <CategoryTable
        categories={treeCats}
        page={page}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={fetchAll}
        onEdit={openEdit}
        onDelete={setDeleteId}
        showTypeColumn={false}
      />
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </>
  );
}
