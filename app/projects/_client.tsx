"use client";

import { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectStore } from "@/api/zustand/use-project-store";
import { useShallow } from "zustand/react/shallow";
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

function ListView() {
  const { projects, total, currentPage, search } = useProjectStore(
    useShallow((s) => ({ projects: s.projects, total: s.total, currentPage: s.currentPage, search: s.search }))
  );
  const { fetchAll, setSearch, setPage, openNew, openEdit, confirmDelete } = useProjectStore(
    useShallow((s) => ({ fetchAll: s.fetchAll, setSearch: s.setSearch, setPage: s.setPage, openNew: s.openNew, openEdit: s.openEdit, confirmDelete: s.confirmDelete }))
  );

  const [inputSearch, setInputSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setInputSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  };

  useEffect(() => { fetchAll(); }, [currentPage, search]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
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
  );
}

function FormView() {
  const { form, editingSlug, isLoadingDetail, client, milestones, bannerImages } = useProjectStore(
    useShallow((s) => ({ form: s.form, editingSlug: s.editingSlug, isLoadingDetail: s.isLoadingDetail, client: s.client, milestones: s.milestones, bannerImages: s.bannerImages }))
  );
  const { back, setFormField, setClient, setMilestones, setBannerImages } = useProjectStore(
    useShallow((s) => ({ back: s.back, setFormField: s.setFormField, setClient: s.setClient, setMilestones: s.setMilestones, setBannerImages: s.setBannerImages }))
  );

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

  const refetch = useProjectStore((s) => s.refetch);

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

  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
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
  );
}

export function _Client() {
  const view = useProjectStore((s) => s.view);

  return view === "list" ? <ListView /> : <FormView />;
}
