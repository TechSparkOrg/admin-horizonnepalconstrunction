"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMediaList, useMediaMutations } from "@/api/hooks/use-media-query";
import type { MediaItem, BannerGroup } from "@/api/types/media.types";
import { BannerMediaTable } from "@/components/page_ui/banner-media-table";
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

  const [editing, setEditing] = useState<{ group: BannerGroup } | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleSave = async (formData: BannerFormData, files: File[], pickedImageIds?: string[], pickedAlts?: string[], deletedImageIds?: string[]) => {
    setSaving(true);

    const slug = formData.slug || toSlug(formData.title);
    const payload = toMediaPayload({
      ...formData,
      slug,
      alt: formData.alt || formData.title || "",
    });

    let hasError = false;

    // 1. Delete — runs first, independent of other operations
    if (deletedImageIds?.length) {
      for (const id of deletedImageIds) {
        try { await deleteMutation.mutateAsync(id); } catch { hasError = true; }
      }
    }

    // 2. Update banner metadata (editing only)
    if (editing) {
      const imageId = editing.group.images[0]?.id;
      if (imageId) {
        try { await updateMutation.mutateAsync({ id: imageId, data: payload }); } catch { hasError = true; }
      }
    }

    // 3. Upload new files
    for (const f of files) {
      try {
        const result = await uploadMutation.mutateAsync({ file: f, metadata: { ...payload, group_title: "Banners" } });
        if (!result) hasError = true;
      } catch { hasError = true; }
    }

    // 4. Update library picks
    if (pickedImageIds?.length) {
      try {
        for (let i = 0; i < pickedImageIds.length; i++) {
          await updateMutation.mutateAsync({
            id: pickedImageIds[i],
            data: { slug, group_title: "Banners", banner: true, alt: pickedAlts?.[i] || "" },
          });
        }
      } catch { hasError = true; }
    }

    if (hasError) {
      toast.error("Some operations failed — check individual error toasts for details.");
    } else {
      setView("list");
      setEditing(null);
    }

    setSaving(false);
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
      <BannerMediaTable
        items={items}
        page={currentPage}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onEdit={(item) => {
          const group = item as unknown as BannerGroup;
          setEditing({ group });
          setView("form");
        }}
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
