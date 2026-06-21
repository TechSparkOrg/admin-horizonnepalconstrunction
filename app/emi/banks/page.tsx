"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Search, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { EmiBankAdmin } from "@/api/services/emi.service";
import type { Bank, BankCreate } from "@/api/types/emi.types";
import { BankTable } from "@/components/page_ui/bank-table";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface BankFormData {
  name: string;
  slug: string;
  logo: string;
  code: string;
}

const EMPTY: BankFormData = { name: "", slug: "", logo: "", code: "" };

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
    setForm({ name: item.name, slug: item.slug, logo: item.logo, code: item.code });
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
        <DialogContent className="!max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Bank" : "Add Bank"}
            </DialogTitle>
          </DialogHeader>

          <form id="bank-form" onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="e.g. State Bank of India"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => { slugEdited.current = true; handleFormChange("slug", e.target.value); }}
                placeholder="auto-generated"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                <div
                  className="size-14 rounded-lg overflow-hidden bg-gray-100 relative shrink-0 cursor-pointer border border-dashed border-gray-300 hover:border-gray-400 transition flex items-center justify-center"
                  onClick={() => setPickerOpen(true)}
                >
                  {form.logo ? (
                    <Image src={form.logo} alt="Logo" fill className="object-cover" />
                  ) : (
                    <Upload className="size-5 text-gray-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Click to upload a bank logo
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Code <span className="text-red-500">*</span></Label>
              <Input
                value={form.code}
                onChange={(e) => handleFormChange("code", e.target.value)}
                placeholder="e.g. SBI123"
              />
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              type="submit"
              form="bank-form"
              disabled={!form.name.trim() || !form.code.trim() || saving}
              className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? "Saving\u2026" : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={(o) => { setPickerOpen(o); }}
        mode="image"
        title="Select Logo"
        onSelect={handleMediaSelect}
      />

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
