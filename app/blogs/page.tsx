"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { BlogAdmin } from "@/api/services/blog.service";
import { ProjectAdmin } from "@/api/services/project.service";
import { TeamAdmin } from "@/api/services/team.service";
import type { BlogPost } from "@/api/types/blog.types";
import type { Project } from "@/api/types/project.types";
import type { TeamMember } from "@/api/types/team.types";
import { BlogTable } from "@/components/page_ui/blog-table";
import { BlogForm } from "@/components/page_ui/blog-form";
import { toSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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
}

const EMPTY: BlogFormData = {
  title: "", slug: "", content: "",
  metaTitle: "", metaDescription: "", metaKeywords: "",
  isActive: true, isPublished: false, publishDate: "",
  projectId: "", authorMode: "manual", authorName: "", authorImage: "", authorTeamId: "",
  categoryId: "",
  model3dBlock: "", videoBlockUrl: "", videoEmbedUrl: "",
};

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function apiToForm(p: BlogPost): BlogFormData {
  return {
    title: p.title,
    slug: p.slug,
    content: p.content_html ?? "",
    metaTitle: p.meta_title ?? "",
    metaDescription: p.meta_description ?? "",
    metaKeywords: p.meta_keywords ?? "",
    isActive: p.is_active ?? true,
    isPublished: p.is_published ?? false,
    publishDate: p.publish_date ?? "",
    projectId: p.project_id ?? "",
    authorMode: "manual",
    authorName: p.author ?? "",
    authorImage: p.author_image ?? "",
    authorTeamId: "",
    categoryId: p.category_id ?? "",
    model3dBlock: p.model_3d_block ?? "",
    videoBlockUrl: p.video_block_url ?? "",
    videoEmbedUrl: p.video_embed_url ?? "",
  };
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>(EMPTY);
  const [bannerImages, setBannerImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [reelBlocks, setReelBlocks] = useState<{ url: string }[]>([]);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([
      BlogAdmin.list(),
      ProjectAdmin.list(),
      TeamAdmin.list(),
    ])
      .then(([blogRes, projectRes, teamRes]) => {
        setBlogs(blogRes.results ?? []);
        setProjects(projectRes.results ?? []);
        setTeamMembers(teamRes.results ?? []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  const refetch = () =>
    BlogAdmin.list()
      .then((res) => setBlogs(res.results ?? []))
      .catch(() => toast.error("Failed to load blogs"));

  const openNew = () => {
    setForm(EMPTY);
    setBannerImages([]);
    setReelBlocks([]);
    setEditingSlug(null);
    setView("form");
  };

  const openEdit = (item: BlogPost) => {
    setForm(apiToForm(item));
    setBannerImages(item.banner_images ?? []);
    setReelBlocks(item.reel_blocks ?? []);
    setEditingSlug(item.slug);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY);
    setReelBlocks([]);
    setDeleteSlug(null);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingSlug && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        title_np: "",
        slug: form.slug,
        excerpt: "",
        excerpt_np: "",
        category_id: form.categoryId || "",
        project_id: form.projectId || "",
        image: "",
        date: form.publishDate || "",
        author: form.authorName || "",
        author_role: "",
        author_image: form.authorImage || "",
        content: [],
        content_np: [],
        content_html: form.content,
        meta_title: form.metaTitle,
        meta_description: form.metaDescription,
        meta_keywords: form.metaKeywords,
        is_active: form.isActive,
        is_published: form.isPublished,
        publish_date: form.publishDate || undefined,
        banner_images: bannerImages,
        model_3d_block: form.model3dBlock,
        video_block_url: form.videoBlockUrl,
        video_embed_url: form.videoEmbedUrl,
        reel_blocks: reelBlocks,
      };
      if (editingSlug) {
        await BlogAdmin.update(editingSlug, payload);
        toast.success("Blog updated");
      } else {
        await BlogAdmin.create(payload);
        toast.success("Blog created");
      }
      await refetch();
      back();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const text = msg
        ? Object.values(msg).flat().join(", ")
        : "Something went wrong";
      toast.error(text);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (slug: string) => {
    try {
      await BlogAdmin.delete(slug);
      setBlogs((prev) => prev.filter((b) => b.slug !== slug));
      toast.success("Blog deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteSlug(null);
  };

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedBlogs = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">Blogs</h1>
              <p className="text-xs text-gray-500 mt-1">Blog list</p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" /> Create Blog
            </button>
          </div>
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
            <p className="text-sm text-[lab(20_23.9_-60.14)] font-medium whitespace-nowrap">
              Total: {filtered.length} {filtered.length === 1 ? "item" : "items"} found.
            </p>
          </div>

          <BlogTable
            blogs={paginatedBlogs}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteSlug={deleteSlug}
            setDeleteSlug={setDeleteSlug}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <BlogForm
            form={form}
            editingSlug={editingSlug}
            saving={saving}
            projects={projects}
            teamMembers={teamMembers}
            bannerImages={bannerImages}
            onBannerImagesChange={setBannerImages}
            reelBlocks={reelBlocks}
            onReelBlocksChange={setReelBlocks}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
