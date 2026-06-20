"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMediaList, useMediaMutations } from "@/api/hooks/use-media-query";
import { StaffAdmin as StaffC } from "@/api/services/staff.service";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import type { MediaItem } from "@/api/types/media.types";
import type { StaffMember } from "@/api/types/staff.types";
import { MediaTable } from "@/components/page_ui/media-table";
import { MediaForm, type MediaFormData } from "@/components/page_ui/media-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { DeleteDialog } from "@/components/global_ui/delete-dialog";
import { toMediaPayload } from "@/lib/media";

const PAGE_SIZE = 10;

export default function ModelsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useMediaList({ page: currentPage, page_size: PAGE_SIZE, group_title: "3D Models" });
  const { deleteMutation, updateMutation, uploadMutation } = useMediaMutations();

  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [teamMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    StaffC.search({}).then((res) => setStaffMembers(res.results ?? [])).catch(() => {});
  }, []);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleSave = async (formData: MediaFormData, files?: File[]) => {
    setSaving(true);
    try {
      const authorVal = formData.authorMode === "team"
        ? teamMembers.find((m) => m.id === formData.authorTeamId)?.name || ""
        : formData.authorName || "";
      const payload = toMediaPayload(formData, {
        custom_fields: authorVal ? [{ key: "author", value: authorVal }] : [],
      });
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
        toast.success("Model updated");
      } else {
        const list = files && files.length > 0 ? files : [];
        for (const f of list) {
          const result = await uploadMutation.mutateAsync({ file: f, metadata: { ...payload, group_title: "3D Models" } });
          if (!result) throw new Error("Upload failed");
        }
        toast.success(list.length > 1 ? `${list.length} models uploaded` : "Model uploaded");
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
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    if (items.length <= 1 && currentPage > 1) setCurrentPage((p) => p - 1);
    setDeleteId(null);
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
    <PageHeader title="3D Models" subtitle="Media / 3D Models" actionLabel="Add Model" onAction={() => { setEditing(null); setView("form"); }}>
      <MediaTable
        items={items}
        page={currentPage}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onEdit={(item) => { setEditing(item); setView("form"); }}
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
    </PageHeader>
  );
}
