"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageAdmin } from "@/api/services/page.service";
import { ProjectAdmin } from "@/api/services/project.service";
import { StaffAdmin as StaffC } from "@/api/services/staff.service";
import type { Page as ApiPage } from "@/api/types/page.types";
import type { Project } from "@/api/types/project.types";
import type { StaffMember } from "@/api/types/staff.types";
import { PagesTable } from "@/components/page_ui/pages-table";
import { PagesForm } from "@/components/page_ui/pages-form";
import { toSlug } from "@/lib/slug";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  iconName: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  featuredImage: string;
  isActive: boolean;
  isPublished: boolean;
  publishDate: string;
  projectId: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
}

const EMPTY: PageFormData = {
  title: "", slug: "", content: "", iconName: "",
  metaTitle: "", metaDescription: "", metaKeywords: "", featuredImage: "",
  isActive: true, isPublished: false, publishDate: "",
  projectId: "", authorMode: "manual", authorName: "", authorImage: "", authorTeamId: "",
};

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function apiToForm(p: ApiPage): PageFormData {
  return {
    title: p.title,
    slug: p.slug,
    content: p.content ?? "",
    iconName: p.icon_name ?? "",
    metaTitle: p.meta_title ?? "",
    metaDescription: p.meta_description ?? "",
    metaKeywords: p.meta_keywords ?? "",
    featuredImage: p.featured_image ?? "",
    isActive: p.is_active ?? true,
    isPublished: p.is_published ?? false,
    publishDate: p.publish_date ?? "",
    projectId: p.project_id ?? "",
    authorMode: "manual",
    authorName: p.author_name ?? "",
    authorImage: p.author_image ?? "",
    authorTeamId: p.author_team_id ?? "",
  };
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<ApiPage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<PageFormData>(EMPTY);
  const [bannerImages, setBannerImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([
      PageAdmin.list(),
      ProjectAdmin.list(),
      StaffC.search({}),
    ])
      .then(([pageRes, projectRes, teamRes]) => {
        setPages(pageRes.results ?? []);
        setProjects(projectRes.results ?? []);
        setStaffMembers(teamRes.results ?? []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  const refetch = () =>
    PageAdmin.list()
      .then((res) => setPages(res.results ?? []))
      .catch(() => toast.error("Failed to load pages"));

  const openNew = () => {
    setForm(EMPTY);
    setBannerImages([]);
    setEditingSlug(null);
    setView("form");
  };

  const openEdit = (item: ApiPage) => {
    setForm(apiToForm(item));
    setBannerImages(item.banner_images ?? []);
    setEditingSlug(item.slug);
    setView("form");
  };

  const back = () => {
    setForm(EMPTY);
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
        slug: form.slug,
        content: form.content,
        icon_name: form.iconName,
        meta_title: form.metaTitle,
        meta_description: form.metaDescription,
        meta_keywords: form.metaKeywords,
        featured_image: form.featuredImage,
        is_active: form.isActive,
        is_published: form.isPublished,
        publish_date: form.publishDate,
        project_id: form.projectId,
        author_name: form.authorName,
        author_image: form.authorImage,
        author_team_id: form.authorTeamId,
        banner_images: bannerImages,
      };
      if (editingSlug) {
        await PageAdmin.update(editingSlug, payload);
        toast.success("Page updated");
      } else {
        await PageAdmin.create(payload);
        toast.success("Page created");
      }
      await refetch();
      back();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (slug: string) => {
    try {
      await PageAdmin.delete(slug);
      setPages((prev) => prev.filter((p) => p.slug !== slug));
      toast.success("Page deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteSlug(null);
  };

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedPages = filtered.slice(
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
        <PageHeader title="Pages" subtitle="Page list" actionLabel="Create Page" onAction={openNew}>
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
              Total: {filtered.length} {filtered.length === 1 ? "item" : "items"} found.
            </p>
          </div>

          <PagesTable
            pages={paginatedPages}
            onEdit={openEdit}
            onDelete={confirmDelete}
            deleteSlug={deleteSlug}
            setDeleteSlug={setDeleteSlug}
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </PageHeader>
      ) : (
        <div className="px-4">
          <PagesForm
            form={form}
            editingSlug={editingSlug}
            saving={saving}
            projects={projects}
            teamMembers={teamMembers}
            bannerImages={bannerImages}
            onBannerImagesChange={setBannerImages}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
