"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Search, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { EmiBankAdmin } from "@/api/services/emi.service";
import type { Bank, BankCreate } from "@/api/types/emi.types";
import { BankTable } from "@/components/page_ui/bank-table";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";

const ITEMS_PER_PAGE = 10;

const COMMON_TENURES = [6, 12, 18, 24, 36, 48, 60];

interface BankFormData {
  name: string;
  slug: string;
  logo: string;
  code: string;
  isActive: boolean;
  tenureOptions: number[];
}

const EMPTY: BankFormData = { name: "", slug: "", logo: "", code: "", isActive: true, tenureOptions: [] };

export default function AdminBanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BankFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Bank | null>(null);
  const [customTenure, setCustomTenure] = useState("");

  const toggleTenure = (months: number) => {
    setForm((prev) => ({
      ...prev,
      tenureOptions: prev.tenureOptions.includes(months)
        ? prev.tenureOptions.filter((m) => m !== months)
        : [...prev.tenureOptions, months].sort((a, b) => a - b),
    }));
  };

  const removeTenure = (months: number) => {
    setForm((prev) => ({
      ...prev,
      tenureOptions: prev.tenureOptions.filter((m) => m !== months),
    }));
  };

  const addCustomTenure = () => {
    const v = parseInt(customTenure, 10);
    if (!isNaN(v) && v > 0 && !form.tenureOptions.includes(v)) {
      setForm((prev) => ({
        ...prev,
        tenureOptions: [...prev.tenureOptions, v].sort((a, b) => a - b),
      }));
    }
    setCustomTenure("");
  };

  const handleTenureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTenure();
    }
  };

  const slugEdited = useRef(false);

  useEffect(() => {
    EmiBankAdmin.search({ search: search || undefined, page: currentPage, page_size: ITEMS_PER_PAGE })
      .then((res) => {
        setBanks(res.results ?? []);
        setTotalCount(res.count ?? 0);
      })
      .catch(() => toast.error("Failed to load banks"));
  }, [search, currentPage]);

  useEffect(() => {
    if (!slugEdited.current && form.name) {
      setForm((prev) => ({ ...prev, slug: toSlug(form.name) }));
    }
  }, [form.name]);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    slugEdited.current = false;
    setDialogOpen(true);
  };

  const openEdit = (item: Bank) => {
    setForm({ name: item.name, slug: item.slug, logo: item.logo, code: item.code, isActive: item.is_active, tenureOptions: item.tenure_options });
    setEditingId(item.id);
    slugEdited.current = true;
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(EMPTY);
    setEditingId(null);
    slugEdited.current = false;
  };

  const handleFormChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleMediaSelect = (item: PickerMediaItem) => {
    setForm((prev) => ({ ...prev, logo: item.url }));
    setPickerOpen(false);
  };

  const save = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    setSaving(true);
    try {
      const payload: BankCreate = {
        name: form.name,
        slug: form.slug || toSlug(form.name),
        logo: form.logo,
        code: form.code,
        is_active: form.isActive,
        tenure_options: form.tenureOptions,
      };
      if (editingId) {
        await EmiBankAdmin.update(editingId, payload);
        toast.success("Bank updated");
      } else {
        await EmiBankAdmin.create(payload);
        toast.success("Bank created");
      }
      setCurrentPage(1);
      const res = await EmiBankAdmin.search({ search: search || undefined, page: 1, page_size: ITEMS_PER_PAGE });
      setBanks(res.results ?? []);
      setTotalCount(res.count ?? 0);
      closeDialog();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    const id = deleteItem.id;
    setDeleteItem(null);
    try {
      await EmiBankAdmin.delete(id);
      const res = await EmiBankAdmin.search({ search: search || undefined, page: currentPage, page_size: ITEMS_PER_PAGE });
      setBanks(res.results ?? []);
      setTotalCount(res.count ?? 0);
      toast.success("Bank deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">EMI Banks</h1>
          <p className="text-xs text-gray-500 mt-1">Manage bank records</p>
        </div>
        <Button type="button" onClick={openNew} className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white">
          <Plus className="w-4 h-4" /> Add Bank
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <InputGroup className="flex-1 max-w-sm h-9">
          <InputGroupAddon align="inline-start">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search"
          />
        </InputGroup>
        <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
          Total: {totalCount} {totalCount === 1 ? "item" : "items"} found.
        </p>
      </div>

      <BankTable
        banks={banks}
        onEdit={openEdit}
        onDelete={(id) => {
          const item = banks.find((b) => b.id === id);
          if (item) setDeleteItem(item);
        }}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

<Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
  <DialogContent className="!max-w-2xl w-full">
    <DialogHeader className="pb-2 border-b border-gray-100">
      <DialogTitle className="text-base font-semibold text-gray-900">
        {editingId ? "Edit Bank" : "Add Bank"}
      </DialogTitle>
    </DialogHeader>

    <form id="bank-form" onSubmit={(e) => { e.preventDefault(); save(); }} className="py-4 space-y-5">

      {/* Name + Code — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            placeholder="e.g. State Bank of India"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">
            Code <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.code}
            onChange={(e) => handleFormChange("code", e.target.value)}
            placeholder="e.g. SBI123"
          />
        </div>
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => { slugEdited.current = true; handleFormChange("slug", e.target.value); }}
          placeholder="auto-generated from name"
          className="text-gray-500"
        />
      </div>

      {/* Logo + Status — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Logo</Label>
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-lg overflow-hidden bg-gray-50 border border-dashed border-gray-300 hover:border-gray-400 transition flex items-center justify-center cursor-pointer shrink-0"
              onClick={() => setPickerOpen(true)}
            >
              {form.logo ? (
                <Image src={form.logo} alt="Logo" width={40} height={40} className="object-cover size-full" />
              ) : (
                <Upload className="size-4 text-gray-400" />
              )}
            </div>
            <span className="text-xs text-gray-400 leading-snug">Click to upload</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-600">Status</Label>
          <ToggleGroup
            type="single"
            value={form.isActive ? "active" : "inactive"}
            onValueChange={(v) => v && setForm((prev) => ({ ...prev, isActive: v === "active" }))}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            <ToggleGroupItem value="active">Active</ToggleGroupItem>
            <ToggleGroupItem value="inactive">Inactive</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Tenure Plans */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-600">Tenure Plans <span className="text-gray-400 font-normal">(months)</span></Label>

        {/* Quick-select chips */}
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TENURES.map((m) => {
            const selected = form.tenureOptions.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleTenure(m)}
                className={
                  selected
                    ? "h-7 px-3 rounded-md bg-sidebar-primary text-white text-xs font-semibold transition-colors"
                    : "h-7 px-3 rounded-md border border-gray-200 bg-white text-gray-600 text-xs font-medium hover:border-sidebar-primary hover:text-sidebar-primary transition-colors"
                }
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Custom input */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={customTenure}
            onChange={(e) => setCustomTenure(e.target.value)}
            onKeyDown={handleTenureKeyDown}
            placeholder="Custom months"
            className="h-8 w-36 text-xs"
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustomTenure} disabled={!customTenure}>
            Add
          </Button>
        </div>

        {/* Selected badges */}
        {form.tenureOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {form.tenureOptions.map((m) => (
              <Badge key={m} variant="secondary" className="gap-1 pr-1 text-xs">
                {m}m
                <button
                  type="button"
                  onClick={() => removeTenure(m)}
                  className="size-3.5 rounded-full hover:bg-gray-300/60 flex items-center justify-center"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </form>

    <DialogFooter className="pt-2 border-t border-gray-100">
      <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
      <Button
        type="submit"
        form="bank-form"
        disabled={!form.name.trim() || !form.code.trim() || saving}
        className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
      >
        {saving && <Loader2 className="size-4 animate-spin" />}
        {saving ? "Saving…" : editingId ? "Update" : "Create"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{   pickerOpen &&   <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={(o) => { setPickerOpen(o); }}
        mode="image"
        title="Select Logo"
        onSelect={handleMediaSelect}
      />}

      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={(o) => { if (!o) setDeleteItem(null); }}
        onConfirm={confirmDelete}
        title={`Delete "${deleteItem?.name}"?`}
        description={`Are you sure you want to delete "${deleteItem?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
