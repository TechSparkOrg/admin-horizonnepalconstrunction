"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AttributeAdmin } from "@/api/services/attribute.service";
import type { AttributeItem, AttributeValue } from "@/api/types/attribute.types";
import { AttributeTable } from "@/components/page_ui/attribute-table";
import { AttributeForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/attribute-form";
import type { AttributeFormData } from "@/components/page_ui/attribute-form";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
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
  const [items, setItems] = useState<AttributeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AttributeFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, currentPage]);

  useEffect(() => {
    AttributeAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load data"));
  }, [searchParams]);

  const refetch = () =>
    AttributeAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load attributes"));

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
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number | AttributeValue[] | null) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await AttributeAdmin.update(editingId, payload);
        toast.success("Attribute updated");
      } else {
        await AttributeAdmin.create(payload);
        toast.success("Attribute created");
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
      await AttributeAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Attribute deleted");
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

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Attributes</h1>
              <p className="text-xs text-gray-500 mt-1">Global attribute types for custom fields</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
            >
              <Plus className="w-4 h-4" /> Add Attribute
            </Button>
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
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <AttributeTable
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
