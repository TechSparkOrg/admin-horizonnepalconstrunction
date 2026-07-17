"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { useMediaList, useMediaMutations, useUsageTypes } from "@/api/hooks/use-media-query";
import type { MediaItem } from "@/api/types/media.types";
import { MediaTable } from "@/components/page_ui/media-table";
import { MediaForm, type MediaFormData } from "@/components/page_ui/media-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { Input } from "@/components/ui/input";
import { toMediaPayload } from "@/lib/media";

interface Props {
  groupTitle: string;
  labelSingular: string;
  subtitle: string;
  accept: string;
}

const PAGE_SIZE = 10;

export function MediaListClient({ groupTitle, labelSingular, subtitle, accept }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [usageFilter, setUsageFilter] = useState<string | undefined>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const queryParams: Record<string, unknown> = {
    page: currentPage,
    page_size: PAGE_SIZE,
    group_title: groupTitle,
  };
  if (search) queryParams.search = search;
  if (usageFilter) queryParams.usage_filter = usageFilter;

  const { data } = useMediaList(queryParams);
  const { data: usageTypes } = useUsageTypes();
  const { deleteMutation, updateMutation, uploadMutation } = useMediaMutations();

  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
  }, []);

  const handleSave = async (formData: MediaFormData, files?: File[]) => {
    setSaving(true);
    try {
      const payload = toMediaPayload(formData);
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
      } else {
        const list = files && files.length > 0 ? files : [];
        for (const f of list) {
          const result = await uploadMutation.mutateAsync({ file: f, metadata: { ...payload, group_title: groupTitle } });
          if (!result) throw new Error("Upload failed");
        }
        toast.success(list.length > 1 ? `${list.length} ${labelSingular.toLowerCase()}s uploaded` : `${labelSingular} uploaded`);
      }
      setView("list");
      setEditing(null);
    } catch {
      // error toast handled by hook's onError
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



  return (
    <PageHeader title={groupTitle} subtitle={subtitle} actionLabel={'' }>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={`Search ${groupTitle.toLowerCase()}...`}
            className="pl-8 h-8 text-xs rounded-lg border-gray-200"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={usageFilter ?? ""}
            onChange={(e) => { setUsageFilter(e.target.value || undefined); setCurrentPage(1); }}
            className="h-8 rounded-lg border border-gray-200 text-xs px-2 bg-white text-gray-600 max-w-[160px]"
          >
            <optgroup label="Filter">
              <option value="">All</option>
              <option value="used">Used</option>
              <option value="unused">Unused</option>
            </optgroup>
            <optgroup label="Used In">
              {(usageTypes ?? []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </optgroup>
          </select>

        </div>
      </div>

      <MediaTable
        items={items}
        page={currentPage}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onEdit={(item) => { setEditing(item); setView("form"); }}
        onDelete={(id) => { const item = items.find(i => i.id === id); if (item) setDeleteItem(item); }}
        groupLabel={groupTitle}
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
