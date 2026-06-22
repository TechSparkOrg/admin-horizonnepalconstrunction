"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMediaList, useMediaMutations } from "@/api/hooks/use-media-query";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import type { MediaItem } from "@/api/types/media.types";
import { MediaTable } from "@/components/page_ui/media-table";
import { MediaForm, type MediaFormData } from "@/components/page_ui/media-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { toMediaPayload } from "@/lib/media";

const PAGE_SIZE = 10;

export default function VideosPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useMediaList({ page: currentPage, page_size: PAGE_SIZE, group_title: "Videos" });
  const { deleteMutation, updateMutation, uploadMutation } = useMediaMutations();

  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleSave = async (formData: MediaFormData, files?: File[]) => {
    setSaving(true);
    try {
      const payload = toMediaPayload(formData);
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        toast.success("Media updated");
      } else {
        const list = files && files.length > 0 ? files : [];
        for (const f of list) {
          const result = await uploadMutation.mutateAsync({ file: f, metadata: { ...payload, group_title: "Videos" } });
          if (!result) throw new Error("Upload failed");
        }
        toast.success(list.length > 1 ? `${list.length} videos uploaded` : "Video uploaded");
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
      <MediaForm
        editing={editing}
        saving={saving}
        onSave={handleSave}
        onBack={() => { setView("list"); setEditing(null); }}
        groupTitle="Videos"
        accept="video/*"
      />
    );
  }

  return (
    <PageHeader title="Videos" subtitle="Media / Videos" actionLabel="Add Video" onAction={() => { setEditing(null); setView("form"); }}>
      <MediaTable
        items={items}
        page={currentPage}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onEdit={(item) => { setEditing(item); setView("form"); }}
        onDelete={(id) => { const item = items.find(i => i.id === id); if (item) setDeleteItem(item); }}
        groupLabel="Videos"
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
