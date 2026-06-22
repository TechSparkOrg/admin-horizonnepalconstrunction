"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useBlogUiStore } from "@/api/zustand/use-blog-store";
import { useBlogList, useBlogMutations } from "@/api/hooks/use-blog-query";
import { ProjectAdmin } from "@/api/services/project.service";
import { StaffAdmin as StaffC } from "@/api/services/staff.service";
import { CategoryAdmin } from "@/api/services/category.service";
import type { Project } from "@/api/types/project.types";
import type { StaffMember } from "@/api/types/staff.types";
import type { Category } from "@/api/types/category.types";
import { BlogTable } from "@/components/page_ui/blog-table";
import { BlogForm } from "@/components/page_ui/blog-form";
import { PageHeader } from "@/components/global_ui/page-header";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export default function AdminBlogsPage() {
  const { data: blogs = [], isLoading } = useBlogList();
  const { deleteMutation, saveMutation } = useBlogMutations();

  const view = useBlogUiStore((s) => s.view);
  const editingSlug = useBlogUiStore((s) => s.editingSlug);
  const form = useBlogUiStore((s) => s.form);
  const bannerImages = useBlogUiStore((s) => s.bannerImages);
  const reelBlocks = useBlogUiStore((s) => s.reelBlocks);
  const search = useBlogUiStore((s) => s.search);
  const currentPage = useBlogUiStore((s) => s.currentPage);

  const openNew = useBlogUiStore((s) => s.openNew);
  const openEdit = useBlogUiStore((s) => s.openEdit);
  const back = useBlogUiStore((s) => s.back);
  const setFormField = useBlogUiStore((s) => s.setFormField);
  const setBannerImages = useBlogUiStore((s) => s.setBannerImages);
  const setReelBlocks = useBlogUiStore((s) => s.setReelBlocks);
  const setSearch = useBlogUiStore((s) => s.setSearch);
  const setPage = useBlogUiStore((s) => s.setPage);
  const validateForm = useBlogUiStore((s) => s.validateForm);

  const pageSize = 10;

  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      ProjectAdmin.list(),
      StaffC.search({}),
      CategoryAdmin.listBlog(),
    ])
      .then(([projectRes, staffRes, catRes]) => {
        setProjects(projectRes.results ?? []);
        setTeamMembers(staffRes.results ?? []);
        setCategories(catRes.results ?? []);
      })
      .catch(() => toast.error("Failed to load reference data"));
  }, []);

  const handleSave = async () => {
    if (!validateForm()) return;
    const payload = {
      title: form.title,
      title_np: form.title,
      slug: form.slug,
      excerpt: form.content?.slice(0, 200) ?? "",
      excerpt_np: form.content?.slice(0, 200) ?? "",
      image: "",
      date: form.publishDate || new Date().toISOString(),
      author_role: "",
      author: form.authorMode === "team" ? "" : form.authorName,
      author_image: form.authorMode === "manual" ? form.authorImage : "",
      content: [],
      content_np: [],
      category_id: form.categoryId,
      project_id: form.projectId,
      meta_title: form.metaTitle,
      meta_description: form.metaDescription,
      meta_keywords: form.metaKeywords,
      is_active: form.isActive,
      is_published: form.isPublished,
      publish_date: form.publishDate,
      model_3d_block: form.model3dBlock,
      video_block_url: form.videoBlockUrl,
      video_embed_url: form.videoEmbedUrl,
      youtube_embed_url: form.videoEmbedUrl,
      banner_images: bannerImages,
      reel_blocks: reelBlocks,
      content_html: form.content,
    };
    await saveMutation.mutateAsync({ slug: editingSlug, payload });
    back();
  };

  const handleDelete = async (slug: string) => {
    await deleteMutation.mutateAsync(slug);
  };

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedBlogs = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (view === "form") {
    return (
      <div className="px-4">
        <BlogForm
          form={form}
          editingSlug={editingSlug}
          saving={saveMutation.isPending}
          projects={projects}
          teamMembers={teamMembers}
          categories={categories}
          bannerImages={bannerImages}
          onBannerImagesChange={setBannerImages}
          reelBlocks={reelBlocks}
          onReelBlocksChange={setReelBlocks}
          onChange={setFormField}
          onSave={handleSave}
          onBack={back}
        />
      </div>
    );
  }

  return (
    <PageHeader title="Blogs" subtitle="Blog list" actionLabel="Create Blog" onAction={openNew}>
      <div className="flex items-center gap-3 mb-4">
        <InputGroup className="flex-1 max-w-sm h-9">
          <InputGroupAddon align="inline-start">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
          />
        </InputGroup>
        <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
          Total: {filtered.length} {filtered.length === 1 ? "item" : "items"} found.
        </p>
      </div>

      <BlogTable
        blogs={paginatedBlogs}
        onEdit={openEdit}
        onDelete={handleDelete}
        page={currentPage}
        totalPages={totalPages}
        totalCount={filtered.length}
        onPageChange={setPage}
      />
    </PageHeader>
  );
}
