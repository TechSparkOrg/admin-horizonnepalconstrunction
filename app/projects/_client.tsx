"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectStore } from "@/api/zustand/use-project-store";
import { ProjectTable } from "@/components/page_ui/project-table";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/global_ui/page-header";
import { stripHtml } from "@/lib/html-content";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { queryKeys } from "@/api/query-keys";
import { CategoryAdmin } from "@/api/services/category.service";
import { StaffAdmin } from "@/api/services/staff.service";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { ProjectAdmin } from "@/api/services/project.service";
import { projectSchema } from "@/api/validation/project";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
const ProjectForm = dynamic(() => import("@/components/page_ui/project-form").then((m) => m.ProjectForm), { ssr: false });
const ITEMS_PER_PAGE = 10;

export function _Client() {
  const {
    projects, total, currentPage, search, view, editingSlug,
    form, client, milestones, bannerImages, isLoadingDetail,
    fetchAll, refetch, setSearch, setPage,
    openNew, openEdit, back, setFormField, setClient,
    setMilestones, setBannerImages,
    confirmDelete,
  } = useProjectStore();

  const [inputSearch, setInputSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.list("project"),
    queryFn: async () => (await CategoryAdmin.listProject({ page_size: 1000 })).results ?? [],
    staleTime: Infinity,
    gcTime: 600_000,
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: queryKeys.staff.all,
    queryFn: async () => (await StaffAdmin.search({})).results ?? [],
    staleTime: Infinity,
    gcTime: 600_000,
  });

  const { data: materials = [] } = useQuery({
    queryKey: queryKeys.materialList.all,
    queryFn: async () => (await MaterialListAdmin.search({})).results ?? [],
    staleTime: Infinity,
    gcTime: 600_000,
  });

  const handleSearchChange = (value: string) => {
    setInputSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  };

  useEffect(() => { fetchAll(); }, [currentPage, search]);

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof ProjectAdmin.create>[0]) =>
      ProjectAdmin.create(payload),
    onSuccess: () => { toast.success("Project created"); refetch(); back(); },
    onError: () => toast.error("Failed to create project"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: Parameters<typeof ProjectAdmin.update>[1] }) =>
      ProjectAdmin.update(slug, payload),
    onSuccess: () => { toast.success("Project updated"); refetch(); back(); },
    onError: () => toast.error("Failed to update project"),
  });

  const save = () => {
    const parsed = projectSchema.safeParse(form);
    if (!parsed.success) {
      ErrorHandler.toast(parsed.error.issues[0]?.message || "Validation failed");
      return;
    }
    const { authorMode, ...formData } = form;
    const primary = bannerImages.find((b) => b.isPrimary) ?? bannerImages[0];
    const payload = {
      ...formData,
      meta_title: stripHtml(formData.meta_title || ""),
      meta_description: stripHtml(formData.meta_description || ""),
      meta_keywords: stripHtml(formData.meta_keywords || ""),
      faq_group_slug: form.faqGroupSlug,
      boq_slug: form.boqSlug,
      thumbnail: primary?.url ?? "",
      clients: client.name ? [client] : [],
      milestones,
      banner_images: bannerImages,
    };
    if (editingSlug) {
      updateMutation.mutate({ slug: editingSlug, payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <>
      {view === "list" ? (
        <PageHeader title="Projects" subtitle="Manage projects" actionLabel="Add Project" onAction={openNew}>
          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={inputSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <ProjectTable
            projects={projects}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={setPage}
          />
        </PageHeader>
      ) : isLoadingDetail ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="px-4">
          <ProjectForm
            form={form}
            editingSlug={editingSlug}
            saving={createMutation.isPending || updateMutation.isPending}
            categories={categories}
            client={client}
            onClientChange={setClient}
            milestones={milestones}
            onMilestonesChange={setMilestones}
            bannerImages={bannerImages}
            onBannerImagesChange={setBannerImages}
            staffMembers={staffMembers}
            materials={materials}
            onChange={setFormField}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
