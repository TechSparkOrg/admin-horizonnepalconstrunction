"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import type { MaterialItem } from "@/api/types/material-list.types";
import { MaterialListTable } from "@/components/page_ui/material-list-table";
import { MaterialListForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/material-list-form";
import type { MaterialListFormData } from "@/components/page_ui/material-list-form";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function itemToForm(item: MaterialItem): MaterialListFormData {
  return {
    name: item.name,
    pricePerUnit: item.price_per_unit,
    attributeId: item.attribute_id,
    unitValue: item.unit_value,
    companyValue: item.company_value,
    photo: item.photo,
    serviceCategoryId: item.service_category_id,
    isActive: item.is_active,
  };
}

function formToPayload(form: MaterialListFormData) {
  return {
    name: form.name,
    price_per_unit: form.pricePerUnit === "" ? 0 : form.pricePerUnit,
    attribute_id: form.attributeId,
    unit_value: form.unitValue,
    company_value: form.companyValue,
    photo: form.photo,
    service_category_id: form.serviceCategoryId,
    is_active: form.isActive,
  };
}

export default function AdminMaterialListPage() {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialListFormData>(EMPTY_FORM);
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
    MaterialListAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load data"));
  }, [searchParams]);

  const refetch = () =>
    MaterialListAdmin.search(searchParams)
      .then((res) => {
        setItems(res.results ?? []);
        setTotal(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load materials"));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setView("form");
  };

  const openEdit = (item: MaterialItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setDeleteId(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number | null) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await MaterialListAdmin.update(editingId, payload);
        toast.success("Material updated");
      } else {
        await MaterialListAdmin.create(payload);
        toast.success("Material created");
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
      await MaterialListAdmin.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      toast.success("Material deleted");
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
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Material List</h1>
              <p className="text-xs text-gray-500 mt-1">Manage materials and their pricing</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20"
            >
              <Plus className="w-4 h-4" /> Add Material
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

          <MaterialListTable
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
          <MaterialListForm
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
