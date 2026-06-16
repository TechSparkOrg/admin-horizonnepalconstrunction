"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import type { MaterialItem, UnitType } from "@/api/types/material-list.types";
import { UNIT_TYPE_LABELS } from "@/api/types/material-list.types";
import { MaterialListTable } from "@/components/page_ui/material-list-table";
import { MaterialListForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/material-list-form";
import type { MaterialListFormData } from "@/components/page_ui/material-list-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    unitType: item.unit_type,
    unit: item.unit,
    photo: item.photo,
    company: item.company,
    serviceCategoryId: item.service_category_id,
    isActive: item.is_active,
  };
}

function formToPayload(form: MaterialListFormData) {
  return {
    name: form.name,
    price_per_unit: form.pricePerUnit,
    unit_type: form.unitType,
    unit: form.unit,
    photo: form.photo,
    company: form.company,
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
  const [unitTypeFilter, setUnitTypeFilter] = useState<UnitType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useMemo(() => ({
    search: search || undefined,
    unit_type: unitTypeFilter !== "all" ? unitTypeFilter : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [search, unitTypeFilter, currentPage]);

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

  const handleUnitTypeFilterChange = (v: string) => {
    setUnitTypeFilter(v as UnitType | "all");
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
            <Select
              value={unitTypeFilter}
              onValueChange={handleUnitTypeFilterChange}
            >
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(Object.keys(UNIT_TYPE_LABELS) as UnitType[]).map((ut) => (
                  <SelectItem key={ut} value={ut}>{UNIT_TYPE_LABELS[ut]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
