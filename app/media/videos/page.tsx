"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaService } from "@/api/services/media.service";
import type { MediaItem } from "@/api/types/media.types";
import { MediaTable } from "@/components/page_ui/media-table";
import { MediaForm, type MediaFormData } from "@/components/page_ui/media-form";
import { toMediaPayload } from "@/lib/media";
import { DeleteDialog } from "@/components/global_ui/delete_dailog";

const PAGE_SIZE = 20;

export default function VideosPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = async (pageNum = 1) => {
    try {
      const res = await MediaService.listVideos({ page: pageNum });
      setPage(pageNum);
      setTotalCount(res.count);
      setItems(res.results ?? []);
    } catch {
      toast.error("Failed to load media");
    }
  };

  useEffect(() => { fetchAll(1); }, []);

  const handleSave = async (data: MediaFormData, files?: File[]) => {
    setSaving(true);
    try {
      const payload = toMediaPayload(data);
      if (editing) {
        await MediaService.update(editing.id, payload);
        toast.success("Media updated");
      } else {
        const list = files && files.length > 0 ? files : [];
        for (const f of list) {
          await MediaService.uploadImage(f, { ...payload, group_title: 'Videos' });
        }
        toast.success(list.length > 1 ? `${list.length} videos uploaded` : "Video uploaded");
      }
      await fetchAll(1);
      setView("list");
      setEditing(null);
    } catch (err) {
      const apiErr = err as { response?: { data?: Record<string, string[]> } };
      const msg = apiErr.response?.data
        ? Object.values(apiErr.response.data).flat().filter(Boolean).join(', ')
        : "Something went wrong";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await MediaService.delete(deleteId);
      const prevCount = items.length;
      const wasLastOnPage = prevCount <= 1 && page > 1;
      const nextPage = wasLastOnPage ? page - 1 : page;
      await fetchAll(nextPage);
      toast.success("Media deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setView("form");
  };

  const openEdit = (item: MediaItem) => {
    setEditing(item);
    setView("form");
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
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">Videos</h1>
          <p className="text-xs text-gray-500 mt-1">Media / Videos</p>
        </div>
        <Button onClick={openCreate} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Video
        </Button>
      </div>
      <MediaTable
        items={items}
        page={page}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={fetchAll}
        onEdit={openEdit}
        onDelete={setDeleteId}
        groupLabel="Videos"
      />
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={confirmDelete}
        title="Delete Media"
        description="Are you sure you want to delete this media? This action cannot be undone."
      />
    </>
  );
}
