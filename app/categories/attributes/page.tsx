"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useAttributeList, useAttributeMutations } from "@/api/hooks/use-attribute-query";
import type { AttributeItem, AttributeValue } from "@/api/types/attribute.types";
import { AttributeTable } from "@/components/page_ui/attribute-table";
import { AttributeForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/attribute-form";
import type { AttributeFormData } from "@/components/page_ui/attribute-form";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function itemToForm(item: AttributeItem): AttributeFormData {
  return {
    title: item.title,
    slug: item.slug,
    usedIn: item.used_in,
    values: item.values.map((v) => ({ ...v })),
    isActive: item.is_active,
  };
}

function formToPayload(form: AttributeFormData) {
  return {
    title: form.title,
    slug: form.slug,
    used_in: form.usedIn,
    values: form.values,
    is_active: form.isActive,
  };
}

export default function AdminAttributesPage() {
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AttributeFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, refetch } = useAttributeList({
    search: search || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const { createMutation, updateMutation, deleteMutation } = useAttributeMutations();

  const items = data?.items ?? [];
  const total = data?.totalCount ?? 0;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: AttributeItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number | AttributeValue[] | null) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Attribute updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Attribute created");
      }
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <PageHeader
          title="Attributes"
          subtitle="Global attribute types for custom fields"
          actionLabel="Add Attribute"
          actionOutlined
          onAction={openNew}
        >
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

          <AttributeTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <AttributeForm
            form={form}
            editingId={editingId}
            saving={saving}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
