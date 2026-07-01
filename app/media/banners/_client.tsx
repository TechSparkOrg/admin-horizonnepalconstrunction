"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { useMediaList, useMediaMutations } from "@/api/hooks/use-media-query";
import type { MediaItem, BannerGroup } from "@/api/types/media.types";
import { BannerMediaTable } from "@/components/page_ui/banner-media-table";
import dynamic from "next/dynamic";
import type { BannerFormData } from "@/components/page_ui/banner-form";
const BannerForm = dynamic(() => import("@/components/page_ui/banner-form").then((m) => m.BannerForm), { ssr: false });
import { PageHeader } from "@/components/global_ui/page-header";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { Input } from "@/components/ui/input";
import { toMediaPayload } from "@/lib/media";
import { toSlug } from "@/lib/slug";

const PAGE_SIZE = 10;

export default function BannersClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const queryParams: Record<string, unknown> = {
    page: currentPage,
    page_size: PAGE_SIZE,
    group_title: "Banners",
  };
  if (search) queryParams.search = search;

  const { data } = useMediaList(queryParams);
  const { deleteMutation, updateMutation } = useMediaMutations();

  const [editing, setEditing] = useState<{ group: BannerGroup } | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setCurrentPage(1), 300);
  };

  const handleSave = async (formData: BannerFormData, pickedLibraryItems?: { id: string; url: string; alt: string }[], deletedImageIds?: string[]) => {
    setSaving(true);

    const slug = formData.slug || toSlug(formData.title);
    const payload = toMediaPayload({
      ...formData,
      slug,
      alt: formData.alt || formData.title || "",
    });

    let hasError = false;

    if (deletedImageIds?.length) {
      for (const id of deletedImageIds) {
        try { await deleteMutation.mutateAsync(id); } catch { hasError = true; }
      }
    }

    if (editing) {
      for (const image of editing.group.images) {
        if (deletedImageIds?.includes(image.id)) continue;
        try { await updateMutation.mutateAsync({ id: image.id, data: payload }); } catch { hasError = true; }
      }
    }

    if (pickedLibraryItems?.length) {
      for (const item of pickedLibraryItems) {
        try {
          await updateMutation.mutateAsync({
            id: item.id,
            data: {
              title: formData.title,
              alt: item.alt,
              slug,
              meta_title: formData.meta_title || "",
              meta_description: formData.meta_description || "",
              keywords: formData.keywords || "",
              is_active: formData.is_active,
              banner: true,
              group_title: "Banners",
            },
          });
        } catch { hasError = true; }
      }
    }

    if (hasError) {
      toast.error("Some operations failed \u2014 check individual error toasts for details.");
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
      <div className="relative flex-1 max-w-xs mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search banners..."
          className="pl-8 h-8 text-xs rounded-lg border-gray-200"
        />
      </div>

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
