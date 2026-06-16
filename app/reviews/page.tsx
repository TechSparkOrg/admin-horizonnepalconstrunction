"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ReviewAdmin } from "@/api/services/review.service";
import type { ReviewGroup, ReviewItemData } from "@/api/types/review.types";
import { ReviewTable } from "@/components/page_ui/review-table";
import { ReviewForm } from "@/components/page_ui/review-form";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface ReviewFormData {
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  items: ReviewItemData[];
}

const EMPTY: ReviewFormData = {
  title: "",
  slug: "",
  order: 0,
  isActive: true,
  items: [],
};

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

export default function AdminReviewsPage() {
  const [groups, setGroups] = useState<ReviewGroup[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormData>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    ReviewAdmin.list()
      .then((res) => setGroups(res.results ?? []))
      .catch(() => toast.error("Failed to load data"));
  }, []);

  const refetch = () =>
    ReviewAdmin.list()
      .then((res) => setGroups(res.results ?? []))
      .catch(() => toast.error("Failed to load reviews"));

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: ReviewGroup) => {
    setForm({
      title: item.title,
      slug: item.slug,
      order: item.order,
      isActive: item.is_active,
      items: item.items.map((it) => ({ ...it })),
    });
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY);
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));

  const handleItemsChange = (items: ReviewItemData[]) =>
    setForm((prev) => ({ ...prev, items }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        order: form.order,
        is_active: form.isActive,
        items: form.items.map((it, i) => ({
          name: it.name,
          role: it.role,
          quote: it.quote,
          rating: it.rating,
          order: it.order || i + 1,
        })),
      };
      if (editingId) {
        await ReviewAdmin.update(editingId, payload);
        toast.success("Review group updated");
      } else {
        await ReviewAdmin.create(payload);
        toast.success("Review group created");
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
      await ReviewAdmin.delete(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Review group deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteId(null);
  };

  const filtered = groups.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedGroups = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Reviews</h1>
              <p className="text-xs text-gray-500 mt-1">Review groups list</p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" /> Create Review
            </button>
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
            <p className="text-sm text-[lab(20_23.9_-60.14)] font-medium whitespace-nowrap">
              Total: {filtered.length} {filtered.length === 1 ? "item" : "items"} found.
            </p>
          </div>

          <ReviewTable
            groups={paginatedGroups}
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
          <ReviewForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={handleChange}
            onItemsChange={handleItemsChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
