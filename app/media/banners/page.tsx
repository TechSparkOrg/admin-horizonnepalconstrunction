"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMediaList, useMediaMutations } from "@/api/hooks/use-media-query";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import type { MediaItem } from "@/api/types/media.types";
import { MediaTable } from "@/components/page_ui/media-table";
import { BannerForm, type BannerFormData } from "@/components/page_ui/banner-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { toMediaPayload } from "@/lib/media";
import { toSlug } from "@/lib/slug";

const PAGE_SIZE = 10;

export default function BannersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useMediaList({ page: currentPage, page_size: PAGE_SIZE, group_title: "Banners" });
  const { deleteMutation, updateMutation, uploadMutation } = useMediaMutations();

  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleSave = async (formData: BannerFormData, files: File[]) => {
    setSaving(true);
    try {
      const slug = formData.slug || toSlug(formData.title);
      const payload = toMediaPayload({
        ...formData,
        slug,
      });

      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        toast.success("Banner updated");
      } else {
        for (const f of files) {
          const result = await uploadMutation.mutateAsync({ file: f, metadata: { ...payload, group_title: "Banners" } });
          if (!result) throw new Error("Upload failed");
        }
        toast.success(files.length > 1 ? `${files.length} banners uploaded` : "Banner uploaded");
      }
      setView("list");
      setEditing(null);
    } catch (err) {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    await deleteMutation.mutateAsync(deleteItem.id);
    if (items.length <= 1 && currentPage > 1) setCurrentPage((p) => p - 1);
    setDeleteItem(null);
  };

  if (view === "form") {
    return (
      <BannerForm
        editing={editing}
        saving={saving}
        onSave={handleSave}
        onBack={() => { setView("list"); setEditing(null); }}
      />
    );
  }

  return (
    <PageHeader title="Banners" subtitle="Media / Banners" actionLabel="Add Banner" onAction={() => { setEditing(null); setView("form"); }}>
      <MediaTable
        items={items}
        page={currentPage}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onEdit={(item) => { setEditing(item); setView("form"); }}
        onDelete={(id) => { const item = items.find(i => i.id === id); if (item) setDeleteItem(item); }}
        groupLabel="Banners"
      />
      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={(o) => { if (!o) setDeleteItem(null); }}
        onConfirm={confirmDelete}
        title={`Delete "${deleteItem?.title || deleteItem?.alt || "this item"}"?`}
        description={`Are you sure you want to delete "${deleteItem?.title || deleteItem?.alt || "this item"}"? This cannot be undone.`}
      />
    </PageHeader>
  );
}
