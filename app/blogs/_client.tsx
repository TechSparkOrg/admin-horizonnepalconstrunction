"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useBlogList, useBlogMutations } from "@/api/hooks/use-blog-query";
import { BlogAdmin } from "@/api/services/blog.service";
import { stripHtml } from "@/lib/html-content";
import { ProjectAdmin } from "@/api/services/project.service";
import { StaffAdmin as StaffC } from "@/api/services/staff.service";
import { CategoryAdmin } from "@/api/services/category.service";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { blogSchema } from "@/api/validation/blog";
import type { BlogPost } from "@/api/types/blog.types";
import type { Project } from "@/api/types/project.types";
import type { StaffMember } from "@/api/types/staff.types";
import type { Category } from "@/api/types/category.types";
import { BlogTable } from "@/components/page_ui/blog-table";
import dynamic from "next/dynamic";
const BlogForm = dynamic(() => import("@/components/page_ui/blog-form").then((m) => m.BlogForm), { ssr: false });
import { PageHeader } from "@/components/global_ui/page-header";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;
type View = "list" | "form";

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
  isPublished: boolean;
  publishDate: string;
  projectId: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
  categoryId: string;
  model3dBlock: string;
  videoBlockUrl: string;
  videoEmbedUrl: string;
  faqGroupSlug: string;
}

const EMPTY_FORM: BlogFormData = {
  title: "", slug: "", content: "",
  metaTitle: "", metaDescription: "", metaKeywords: "",
  isActive: true, isPublished: false, publishDate: "",
  projectId: "", authorMode: "manual", authorName: "", authorImage: "", authorTeamId: "",
  categoryId: "",
  model3dBlock: "", videoBlockUrl: "", videoEmbedUrl: "",
  faqGroupSlug: "",
};

function apiToForm(p: BlogPost): BlogFormData {
  return {
    title: p.title,
    slug: p.slug,
    content: p.content ?? "",
    metaTitle: stripHtml(p.meta_title ?? ""),
    metaDescription: stripHtml(p.meta_description ?? ""),
    metaKeywords: stripHtml(p.meta_keywords ?? ""),
    isActive: p.is_active ?? true,
    isPublished: p.is_published ?? false,
    publishDate: p.publish_date ?? "",
    projectId: p.project?.id ?? "",
    authorMode: "manual",
    authorName: p.author ?? "",
    authorImage: p.author_image ?? "",
    authorTeamId: "",
    categoryId: p.category?.id ?? "",
    model3dBlock: p.model_3d_block ?? "",
    videoBlockUrl: p.video_block_url ?? "",
    videoEmbedUrl: p.video_embed_url ?? "",
    faqGroupSlug: p.faq_group_slug ?? "",
  };
}

export function _Client() {
  const [view, setView] = useState<View>("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>(EMPTY_FORM);
  const [bannerImages, setBannerImages] = useState<{ id: string; url: string; name: string; isPrimary?: boolean }[]>([]);
  const [reelBlocks, setReelBlocks] = useState<{ url: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useBlogList({ search: debouncedSearch || undefined, page: currentPage, page_size: ITEMS_PER_PAGE });
  const { deleteMutation, saveMutation } = useBlogMutations();

  const blogs = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const { data: projects = [] } = useQuery({
    queryKey: ["blogs", "projects"],
    queryFn: async () => (await ProjectAdmin.list()).results ?? [],
    enabled: view === "form",
    staleTime: Infinity,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["blogs", "staff"],
    queryFn: async () => (await StaffC.search({})).results ?? [],
    enabled: view === "form",
    staleTime: Infinity,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["blogs", "categories"],
    queryFn: async () => (await CategoryAdmin.listBlog()).results ?? [],
    enabled: view === "form",
    staleTime: Infinity,
  });

  const openNew = () => {
    setForm(EMPTY_FORM);
    setBannerImages([]);
    setReelBlocks([]);
    setEditingSlug(null);
    setView("form");
  };

  const openEdit = async (item: BlogPost) => {
    try {
      const full = await BlogAdmin.adminGet(item.slug);
      setForm(apiToForm(full));
      setBannerImages(full.banner_images ?? []);
      setReelBlocks(full.reel_blocks ?? []);
      setEditingSlug(full.slug);
      setView("form");
    } catch {
      toast.error("Failed to load blog details");
    }
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setBannerImages([]);
    setReelBlocks([]);
    setEditingSlug(null);
    setView("list");
  };

  const setFormField = (key: string, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "title" && !editingSlug && typeof value === "string") {
        updated.slug = value.toLowerCase().replace(/\s+/g, "-");
      }
      return updated;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSave = async () => {
    const parsed = blogSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Validation failed";
      ErrorHandler.toast(first);
      return;
    }
    const primaryBanner = bannerImages.find((b) => b.isPrimary) ?? bannerImages[0];
    const teamAuthor = form.authorMode === "team" && form.authorTeamId
      ? teamMembers.find((m) => m.id === form.authorTeamId)
      : null;
    const payload = {
      title: form.title,
      slug: form.slug,
      image: primaryBanner?.url ?? "",
      date: form.publishDate || "",
      author: teamAuthor?.name || form.authorName,
      author_image: teamAuthor?.photo || form.authorImage,
      author_role: teamAuthor?.designation_label ?? "",
      content: form.content,
      category_id: form.categoryId,
      project_id: form.projectId,
      meta_title: stripHtml(form.metaTitle),
      meta_description: stripHtml(form.metaDescription),
      meta_keywords: stripHtml(form.metaKeywords),
      is_active: form.isActive,
      is_published: form.isPublished,
      publish_date: form.publishDate,
      model_3d_block: form.model3dBlock,
      video_block_url: form.videoBlockUrl,
      video_embed_url: form.videoEmbedUrl,
      faq_group_slug: form.faqGroupSlug,
      banner_images: bannerImages,
      reel_blocks: reelBlocks,
    };
    await saveMutation.mutateAsync({ slug: editingSlug, payload });
    back();
  };

  const handleDelete = async (slug: string) => {
    await deleteMutation.mutateAsync(slug);
  };

  return (
    <>
      {view === "list" ? (
        <PageHeader title="Blogs" subtitle="Blog list" actionLabel="Create Blog" onAction={openNew}>
          <div className="flex items-center gap-3 mb-4">
            <InputGroup className="flex-1 max-w-sm h-9">
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
              />
            </InputGroup>
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <BlogTable
            blogs={blogs}
            onEdit={openEdit}
            onDelete={handleDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
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
      )}
    </>
  );
}
