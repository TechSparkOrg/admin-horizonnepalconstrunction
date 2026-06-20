"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { UnitConversionAdmin } from "@/api/services/unit-converter.service";
import type { UnitConversionItem } from "@/api/types/unit-converter.types";
import { UnitConverterTable } from "@/components/page_ui/unit-converter-table";
import { UnitConverterForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/unit-converter-form";
import type { UnitConverterFormData } from "@/components/page_ui/unit-converter-form";
import type { ConversionRule } from "@/api/types/unit-converter.types";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function itemToForm(item: UnitConversionItem): UnitConverterFormData {
  return {
    title: item.title,
    slug: item.slug,
    attributeId: item.attribute_id,
    fieldLabel: item.field_label,
    baseUnit: item.base_unit,
    conversions: item.conversions,
    isActive: item.is_active,
    blogId: item.blog_id,
  };
}

function formToPayload(form: UnitConverterFormData) {
  return {
    title: form.title,
    slug: form.slug,
    attribute_id: form.attributeId,
    field_label: form.fieldLabel,
    base_unit: form.baseUnit,
    conversions: form.conversions,
    is_active: form.isActive,
    blog_id: form.blogId,
  };
}

export default function AdminUnitConverterPage() {
  const [items, setItems] = useState<UnitConversionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UnitConverterFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, currentPage]);

  useEffect(() => {
    UnitConversionAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load data"));
  }, [searchParams]);

  const refetch = () =>
    UnitConversionAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load conversions"));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: UnitConversionItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number | ConversionRule[] | null) => {
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
        await UnitConversionAdmin.update(editingId, payload);
        toast.success("Conversion updated");
      } else {
        await UnitConversionAdmin.create(payload);
        toast.success("Conversion created");
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
      await UnitConversionAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Conversion deleted");
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
              <div className="flex items-center gap-2">
                <Link href="/material-list" className="text-xs text-gray-500 hover:text-gray-700">
                  ← Material List
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none mt-1">Unit Converter</h1>
              <p className="text-xs text-gray-500 mt-1">Manage unit conversion rules</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-sidebar-primary border-sidebar-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Conversion
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
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <UnitConverterTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <UnitConverterForm
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
