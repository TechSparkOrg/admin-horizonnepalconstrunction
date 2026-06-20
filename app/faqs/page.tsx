"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { FaqAdmin } from "@/api/services/faq.service";
import { CategoryAdmin } from "@/api/services/category.service";
import type { FaqGroup, FaqItemData } from "@/api/types/faq.types";
import type { Category } from "@/api/types/category.types";
import { FaqTable } from "@/components/page_ui/faq-table";
import { FaqForm } from "@/components/page_ui/faq-form";
import { toSlug } from "@/lib/slug";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface FaqFormData {
  title: string;
  slug: string;
  categoryId: string;
  order: number;
  isActive: boolean;
  items: FaqItemData[];
}

const EMPTY: FaqFormData = {
  title: "",
  slug: "",
  categoryId: "",
  order: 0,
  isActive: true,
  items: [],
};

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

export default function AdminFaqsPage() {
  const [groups, setGroups] = useState<FaqGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([
      FaqAdmin.list(),
      CategoryAdmin.listFaq(),
    ])
      .then(([faqRes, catRes]) => {
        setGroups(faqRes.results ?? []);
        setCategories(catRes.results ?? []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  const refetch = () =>
    FaqAdmin.list()
      .then((res) => setGroups(res.results ?? []))
      .catch(() => toast.error("Failed to load FAQs"));

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: FaqGroup) => {
    setForm({
      title: item.title,
      slug: item.slug,
      categoryId: item.category_id,
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

  const handleItemsChange = (items: FaqItemData[]) =>
    setForm((prev) => ({ ...prev, items }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        category_id: form.categoryId,
        order: form.order,
        is_active: form.isActive,
        items: form.items.map((it, i) => ({
          question: it.question,
          answer: it.answer,
          order: it.order || i + 1,
        })),
      };
      if (editingId) {
        await FaqAdmin.update(editingId, payload);
        toast.success("FAQ group updated");
      } else {
        await FaqAdmin.create(payload);
        toast.success("FAQ group created");
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
      await FaqAdmin.delete(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("FAQ group deleted");
    } catch {
      toast.error("Failed to delete");
    }
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
        <PageHeader title="FAQs" subtitle="FAQ groups list" actionLabel="Create FAQ" onAction={openNew}>
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
              Total: {filtered.length} {filtered.length === 1 ? "item" : "items"} found.
            </p>
          </div>

          <FaqTable
            groups={paginatedGroups}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <FaqForm
            form={form}
            editingId={editingId}
            saving={saving}
            categories={categories}
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
