"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaqAdmin } from "@/api/services/faq.service";
import type { FaqGroup, FaqGroupCreate, FaqItemData } from "@/api/types/faq.types";
import { FaqTable } from "@/components/page_ui/faq-table";
import { FaqForm } from "@/components/page_ui/faq-form";
import { toSlug } from "@/lib/slug";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

interface FaqFormData {
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  items: FaqItemData[];
}

const EMPTY: FaqFormData = {
  title: "",
  slug: "",
  order: 0,
  isActive: true,
  items: [],
};

type View = "list" | "form";

export default function AdminFaqsPage() {
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqFormData>(EMPTY);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: faqRes } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => FaqAdmin.list(),
  });

  const groups = faqRes?.results ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["faqs"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: FaqGroupCreate) => FaqAdmin.create(payload),
    onSuccess: () => { toast.success("FAQ group created"); invalidate(); },
    onError: () => { toast.error("Something went wrong"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FaqGroupCreate }) => FaqAdmin.update(id, data),
    onSuccess: () => { toast.success("FAQ group updated"); invalidate(); },
    onError: () => { toast.error("Something went wrong"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => FaqAdmin.delete(id),
    onSuccess: () => { toast.success("FAQ group deleted"); invalidate(); },
    onError: () => { toast.error("Failed to delete"); },
  });

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: FaqGroup) => {
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

  const handleItemsChange = (items: FaqItemData[]) =>
    setForm((prev) => ({ ...prev, items }));

  const save = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      slug: form.slug,
      order: form.order,
      is_active: form.isActive,
      items: form.items.map((it, i) => ({
        question: it.question,
        answer: it.answer,
        order: it.order || i + 1,
      })),
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      back();
    } catch {}
  };

  const confirmDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
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
            totalCount={filtered.length}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <FaqForm
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
