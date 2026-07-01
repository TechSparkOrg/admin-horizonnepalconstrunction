"use client";

import { useState, useEffect } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAttributeList, useAttributeMutations } from "@/api/hooks/use-attribute-query";
import { AttributeTable } from "@/components/page_ui/attribute-table";
import { PageHeader } from "@/components/global_ui/page-header";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { AttributeItem } from "@/api/types/attribute.types";

const ITEMS_PER_PAGE = 10;

export function AttributeSectionPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const [deleteItem, setDeleteItem] = useState<AttributeItem | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editValues, setEditValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data } = useAttributeList({
    search: debouncedSearch || undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const { createMutation, updateMutation, deleteMutation } = useAttributeMutations();

  const items = data?.items ?? [];
  const total = data?.totalCount ?? 0;

  const openNew = () => {
    setEditId(null);
    setEditName("");
    setEditValues([]);
    setNewValue("");
    setEditIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (item: AttributeItem) => {
    setEditId(item.id);
    setEditName(item.title);
    setEditValues(item.values.flatMap((v) => v.values.length > 0 ? v.values : [v.label]).filter(Boolean));
    setNewValue("");
    setEditIsActive(item.is_active);
    setDialogOpen(true);
  };

  const addValue = () => {
    const v = newValue.trim();
    if (v && !editValues.includes(v)) {
      setEditValues((prev) => [...prev, v]);
    }
    setNewValue("");
  };

  const removeValue = (val: string) => {
    setEditValues((prev) => prev.filter((v) => v !== val));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue();
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: editName.trim(),
        slug: editName.trim().toLowerCase().replace(/\s+/g, "-"),
        used_in: "all",
        values: editValues.length > 0 ? [{ label: "", values: editValues }] : [],
        is_active: editIsActive,
      };
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: payload });
        toast.success("Attribute updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Attribute created");
      }
      setDialogOpen(false);
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
    await deleteMutation.mutateAsync(id);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
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
          onDelete={(item) => setDeleteItem(item)}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </PageHeader>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!max-w-lg w-full">
          <DialogHeader className="pb-2 border-b border-gray-100">
            <DialogTitle className="text-base font-semibold text-gray-900">
              {editId ? "Edit Attribute" : "New Attribute"}
            </DialogTitle>
          </DialogHeader>

          <form id="attr-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="py-4 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Material Type"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Values</Label>

              <div className="flex items-center gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a value and press Enter"
                  className="h-8 text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addValue} disabled={!newValue.trim()}>
                  Add
                </Button>
              </div>

              {editValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {editValues.map((v) => (
                    <Badge key={v} variant="secondary" className="gap-1 pr-1 text-xs">
                      {v}
                      <button
                        type="button"
                        onClick={() => removeValue(v)}
                        className="size-3.5 rounded-full hover:bg-gray-300/60 flex items-center justify-center"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Status</Label>
              <SegmentedToggle
                value={editIsActive}
                onChange={setEditIsActive}
                options={[
                  { value: true, label: "Active" },
                  { value: false, label: "Inactive" },
                ]}
              />
            </div>
          </form>

          <DialogFooter className="pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              form="attr-form"
              disabled={!editName.trim() || saving}
              className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
            >
              {saving ? "Saving…" : editId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={(o) => { if (!o) setDeleteItem(null); }}
        onConfirm={confirmDelete}
        title={`Delete "${deleteItem?.title}"?`}
        description={`Are you sure you want to delete "${deleteItem?.title}"? This cannot be undone.`}
      />
    </>
  );
}
