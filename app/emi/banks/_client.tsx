"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Search, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
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

function TenureChip({ months, selected, onToggle }: { months: number; selected: boolean; onToggle: (m: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(months)}
      className={
        selected
          ? "h-7 px-3 rounded-md bg-sidebar-primary text-white text-xs font-semibold transition-colors"
          : "h-7 px-3 rounded-md border border-gray-200 bg-white text-gray-600 text-xs font-medium hover:border-sidebar-primary hover:text-sidebar-primary transition-colors"
      }
    >
      {months}
    </button>
  );
}

function TenureBadge({ months, onRemove }: { months: number; onRemove: (m: number) => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 text-xs">
      {months}m
      <button
        type="button"
        onClick={() => onRemove(months)}
        className="size-3.5 rounded-full hover:bg-gray-300/60 flex items-center justify-center"
      >
        <X className="size-2.5" />
      </button>
    </Badge>
  );
}

function BankFormDialog({
  open, editingId, onClose,
}: {
  open: boolean;
  editingId: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BankFormData>(EMPTY);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customTenure, setCustomTenure] = useState("");
  const slugEdited = useRef(false);

  useEffect(() => {
    if (open && editingId) {
      EmiBankAdmin.get(editingId).then((item) => {
        setForm({ name: item.name, slug: item.slug, logo: item.logo, code: item.code, isActive: item.is_active, tenureOptions: item.tenure_options });
        slugEdited.current = true;
      }).catch(() => {});
    } else if (open) {
      setForm(EMPTY);
      slugEdited.current = false;
    }
  }, [open, editingId]);

  useEffect(() => {
    if (!slugEdited.current && form.name) {
      setForm((prev) => ({ ...prev, slug: toSlug(form.name) }));
    }
  }, [form.name]);

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

  const handleFormChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleMediaSelect = (item: PickerMediaItem) => {
    setForm((prev) => ({ ...prev, logo: item.url }));
    setPickerOpen(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: BankCreate) => {
      if (editingId) {
        await EmiBankAdmin.update(editingId, payload);
      } else {
        await EmiBankAdmin.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Bank updated" : "Bank created");
      queryClient.invalidateQueries({ queryKey: queryKeys.banks.all, refetchType: "active" });
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const save = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    const payload: BankCreate = {
      name: form.name,
      slug: form.slug || toSlug(form.name),
      logo: form.logo,
      code: form.code,
      is_active: form.isActive,
      tenure_options: form.tenureOptions,
    };
    saveMutation.mutate(payload);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="!max-w-2xl w-full">
          <DialogHeader className="pb-2 border-b border-gray-100">
            <DialogTitle className="text-base font-semibold text-gray-900">
              {editingId ? "Edit Bank" : "Add Bank"}
            </DialogTitle>
          </DialogHeader>

          <form id="bank-form" onSubmit={(e) => { e.preventDefault(); save(); }} className="py-4 space-y-5">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => { slugEdited.current = true; handleFormChange("slug", e.target.value); }}
                placeholder="auto-generated from name"
                className="text-gray-500"
              />
            </div>

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

            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Tenure Plans <span className="text-gray-400 font-normal">(months)</span></Label>

              <div className="flex flex-wrap gap-1.5">
                {COMMON_TENURES.map((m) => (
                  <TenureChip key={m} months={m} selected={form.tenureOptions.includes(m)} onToggle={toggleTenure} />
                ))}
              </div>

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

              {form.tenureOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {form.tenureOptions.map((m) => (
                    <TenureBadge key={m} months={m} onRemove={removeTenure} />
                  ))}
                </div>
              )}
            </div>
          </form>

          <DialogFooter className="pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              form="bank-form"
              disabled={!form.name.trim() || !form.code.trim() || saveMutation.isPending}
              className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
            >
              {saveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {saveMutation.isPending ? "Saving\u2026" : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pickerOpen && (
        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={(o) => { setPickerOpen(o); }}
          mode="image"
          defaultCategory="Images"
          title="Select Logo"
          onSelect={handleMediaSelect}
        />
      )}
    </>
  );
}

export function _Client() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.banks.list({ search: debouncedSearch || undefined, page: currentPage, page_size: ITEMS_PER_PAGE }),
    queryFn: () => EmiBankAdmin.search({ search: debouncedSearch || undefined, page: currentPage, page_size: ITEMS_PER_PAGE }),
    staleTime: 60000,
  });

  const banks = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<Bank | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.banks.all, refetchType: "active" });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => EmiBankAdmin.delete(id),
    onSuccess: () => {
      invalidate();
      toast.success("Bank deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const openNew = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: Bank) => {
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteItem) return;
    const id = deleteItem.id;
    setDeleteItem(null);
    deleteMutation.mutate(id);
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
          {isLoading ? "Loading..." : `Total: ${totalCount} ${totalCount === 1 ? "item" : "items"} found.`}
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

      <BankFormDialog open={dialogOpen} editingId={editingId} onClose={() => { setDialogOpen(false); setEditingId(null); }} />

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
