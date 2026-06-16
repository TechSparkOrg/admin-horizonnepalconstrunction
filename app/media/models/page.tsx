"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MediaService } from "@/api/services/media.service";
import { TeamAdmin } from "@/api/services/team.service";
import type { MediaItem } from "@/api/types/media.types";
import type { TeamMember } from "@/api/types/team.types";
import { MediaTable } from "@/components/page_ui/media-table";
import { MediaForm, type MediaFormData } from "@/components/page_ui/media-form";
import { toMediaPayload } from "@/lib/media";
import { DeleteDialog } from "@/components/global_ui/delete_dailog";

const PAGE_SIZE = 20;

export default function ModelsPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    TeamAdmin.list().then((res) => setTeamMembers(res.results ?? [])).catch(() => {});
  }, []);

  const fetchAll = async (pageNum = 1) => {
    try {
      const res = await MediaService.listModels({ page: pageNum });
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
      const authorVal = data.authorMode === "team"
        ? teamMembers.find((m) => m.id === data.authorTeamId)?.name || ""
        : data.authorName || "";
      const payload = toMediaPayload(data, {
        custom_fields: authorVal ? [{ key: "author", value: authorVal }] : [],
      });
      if (editing) {
        await MediaService.update(editing.id, payload);
        toast.success("Model updated");
      } else {
        const list = files && files.length > 0 ? files : [];
        for (const f of list) {
          await MediaService.uploadImage(f, { ...payload, group_title: '3D Models' });
        }
        toast.success(list.length > 1 ? `${list.length} models uploaded` : "Model uploaded");
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
      toast.success("Model deleted");
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
        groupTitle="3D Models"
        accept=".glb,.gltf,.fbx,.obj,.stl,.step,.stp,.iges,.igs,.dae,.3ds,.ply,.blend,.max,.c4d,.ma,.mb,.dwg,.dxf,.rvt,.ifc,.usdz,.usd,.abc,.amf,.3mf,.skp"
        showProjectLink
        showAuthor
        teamMembers={teamMembers}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">3D Models</h1>
          <p className="text-xs text-gray-500 mt-1">Media / 3D Models</p>
        </div>
        <Button onClick={openCreate} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Model
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
        groupLabel="3D Models"
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
