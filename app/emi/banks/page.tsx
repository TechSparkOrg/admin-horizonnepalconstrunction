"use client";

import { useState, useEffect } from "react";
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
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BankFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const fetchBanks = () =>
    EmiBankAdmin.search({ page_size: 10 })
      .then((res) => setBanks(res.results ?? []))
      .catch(() => toast.error("Failed to load banks"));

  useEffect(() => { fetchBanks(); }, []);

  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: Bank) => {
    setForm({ name: item.name, slug: item.slug, logo: item.logo, code: item.code });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(EMPTY);
    setEditingId(null);
  };

  const handleFormChange = (key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "name" && !editingId ? { slug: toSlug(value) } : {}),
    }));

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
      await fetchBanks();
      closeDialog();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await EmiBankAdmin.delete(id);
      setBanks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bank deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedBanks = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">EMI Banks</h1>
          <p className="text-xs text-gray-500 mt-1">Manage bank records</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-sidebar-primary hover:bg-sidebar-primary/90 text-white text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Add Bank
        </button>
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
          Total: {filtered.length} {filtered.length === 1 ? "item" : "items"} found.
        </p>
      </div>

      <BankTable
        banks={paginatedBanks}
        onEdit={openEdit}
        onDelete={confirmDelete}
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

          <div className="space-y-4 py-2">
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
                onChange={(e) => handleFormChange("slug", e.target.value)}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={save}
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
    </div>
  );
}
