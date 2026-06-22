"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReviewAdmin } from "@/api/services/review.service";
import type { ReviewGroup, ReviewItemData } from "@/api/types/review.types";
import { reviewSchema } from "@/api/validation/review";
import { ReviewTable } from "@/components/page_ui/review-table";
import { ReviewForm } from "@/components/page_ui/review-form";
import { toSlug } from "@/lib/slug";
import { PageHeader } from "@/components/global_ui/page-header";
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
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormData>(EMPTY);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAll = () =>
    ReviewAdmin.list({ search: search || undefined, page: currentPage, page_size: ITEMS_PER_PAGE })
      .then((res) => { setGroups(res.results ?? []); setTotal(res.count ?? 0); })
      .catch(() => toast.error("Failed to load reviews"));

  useEffect(() => { fetchAll(); }, [currentPage, search]);

  const refetch = () =>
    ReviewAdmin.list({ search: search || undefined, page: currentPage, page_size: ITEMS_PER_PAGE })
      .then((res) => { setGroups(res.results ?? []); setTotal(res.count ?? 0); })
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

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof ReviewAdmin.create>[0]) =>
      ReviewAdmin.create(payload),
    onSuccess: () => { toast.success("Review group created"); refetch(); back(); },
    onError: () => toast.error("Failed to create review group"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof ReviewAdmin.update>[1] }) =>
      ReviewAdmin.update(id, payload),
    onSuccess: () => { toast.success("Review group updated"); refetch(); back(); },
    onError: () => toast.error("Failed to update review group"),
  });

  const save = () => {
    const parsed = reviewSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Validation failed");
      return;
    }
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
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await ReviewAdmin.delete(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      setTotal((prev) => prev - 1);
      toast.success("Review group deleted");
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
        <PageHeader title="Reviews" subtitle="Review groups list" actionLabel="Create Review" onAction={openNew}>
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
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <ReviewTable
            groups={groups}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <ReviewForm
            form={form}
            editingId={editingId}
            saving={createMutation.isPending || updateMutation.isPending}
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
