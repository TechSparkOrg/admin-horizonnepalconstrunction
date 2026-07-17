"use client";

import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageAdmin } from "@/api/services/page.service";
import { StaffAdmin as StaffC } from "@/api/services/staff.service";
import type { PageListItem, PageDetail, PageCreate, PageUpdate, PageSvgItem } from "@/api/types/page.types";
import { pageSchema } from "@/api/validation/page";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { PagesTable } from "@/components/page_ui/pages-table";
import dynamic from "next/dynamic";
const PagesForm = dynamic(() => import("@/components/page_ui/pages-form").then((m) => m.PagesForm), { ssr: false });
import { toSlug } from "@/lib/slug";
import { stripHtml } from "@/lib/html-content";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const QUERY_KEY = "pages-admin";

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
  isPublished: boolean;
  faqGroupSlug: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
}

const EMPTY: PageFormData = {
  title: "", slug: "", content: "",
  metaTitle: "", metaDescription: "", metaKeywords: "",
  isActive: true, isPublished: false, faqGroupSlug: "",
  authorMode: "manual", authorName: "", authorImage: "", authorTeamId: "",
};

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function apiToForm(p: PageDetail): PageFormData {
  return {
    title: p.title,
    slug: p.slug,
    content: p.content ?? "",
    metaTitle: stripHtml(p.meta_title ?? ""),
    metaDescription: stripHtml(p.meta_description ?? ""),
    metaKeywords: stripHtml(p.meta_keywords ?? ""),
    isActive: p.is_active ?? true,
    isPublished: p.is_published ?? false,
    faqGroupSlug: p.faq_group_slug ?? "",
    authorMode: "manual",
    authorName: p.author_name ?? "",
    authorImage: p.author_image ?? "",
    authorTeamId: p.author_team_id ?? "",
  };
}

export function _Client() {
  const [view, setView] = useState<View>("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<PageFormData>(EMPTY);
  const [bannerImages, setBannerImages] = useState<{ id: string; url: string; name: string; isPrimary?: boolean }[]>([]);
  const [svgItems, setSvgItems] = useState<PageSvgItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const { data: pagesRes, refetch } = useQuery({
    queryKey: [QUERY_KEY, "list", currentPage],
    queryFn: () => {
      const params: Record<string, unknown> = { page_size: ITEMS_PER_PAGE };
      if (search) {
        params.search = search;
      } else {
        params.page = currentPage;
      }
      return PageAdmin.list(params);
    },
  });

  const { data: teamRes } = useQuery({
    queryKey: [QUERY_KEY, "team"],
    queryFn: () => StaffC.search({}),
    enabled: view === "form",
    staleTime: Infinity,
  });

  const pages = pagesRes?.results ?? [];
  const totalCount = pagesRes?.count ?? 0;
  const teamMembers = teamRes?.results ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: (payload: PageCreate) => PageAdmin.create(payload),
    onSuccess: () => { toast.success("Page created"); invalidate(); },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
      if (parsed.raw && typeof parsed.raw === "object") {
        const raw = parsed.raw as Record<string, unknown>;
        const fieldErrors: Record<string, string> = {};
        for (const key in raw) {
          if (Array.isArray(raw[key])) fieldErrors[key] = (raw[key] as string[]).join(", ");
        }
        setErrors(fieldErrors);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: PageUpdate }) => PageAdmin.update(slug, data),
    onSuccess: () => { toast.success("Page updated"); invalidate(); },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
      if (parsed.raw && typeof parsed.raw === "object") {
        const raw = parsed.raw as Record<string, unknown>;
        const fieldErrors: Record<string, string> = {};
        for (const key in raw) {
          if (Array.isArray(raw[key])) fieldErrors[key] = (raw[key] as string[]).join(", ");
        }
        setErrors(fieldErrors);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => PageAdmin.delete(slug),
    onSuccess: () => { toast.success("Page deleted"); invalidate(); },
    onError: () => { toast.error("Failed to delete"); },
  });

  const openNew = () => {
    setForm(EMPTY);
    setBannerImages([]);
    setSvgItems([]);
    setEditingSlug(null);
    setView("form");
  };

  const openEdit = async (item: PageListItem) => {
    setEditingSlug(item.slug);
    setView("form");
    setLoadingDetail(true);
    try {
      const detail = await PageAdmin.adminGet(item.slug);
      setForm(apiToForm(detail));
      setBannerImages((detail.banner_images ?? []).map((b) => ({
        id: b.id, url: b.url, name: b.name, isPrimary: b.isPrimary,
      })));
      setSvgItems(detail.svg_items ?? []);
    } catch {
      toast.error("Failed to load page details");
      setView("list");
      setEditingSlug(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const back = () => {
    setForm(EMPTY);
    setBannerImages([]);
    setSvgItems([]);
    setEditingSlug(null);
    setView("list");
  };

  const clearErrors = (key: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const handleChange = (key: string, value: string | boolean) => {
    clearErrors(key);
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingSlug && typeof value === "string"
        ? { slug: toSlug(value) }
        : {}),
    }));
  };

  const save = async () => {
    const result = pageSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      meta_title: stripHtml(form.metaTitle),
      meta_description: stripHtml(form.metaDescription),
      meta_keywords: stripHtml(form.metaKeywords),
      is_active: form.isActive,
      is_published: form.isPublished,
      faq_group_slug: form.faqGroupSlug || "",
      author_name: form.authorName,
      author_image: form.authorImage,
      author_team_id: form.authorTeamId,
      banner_images: bannerImages,
      svg_items: svgItems,
    } as PageCreate;
    try {
      if (editingSlug) {
        await updateMutation.mutateAsync({ slug: editingSlug, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      back();
    } catch {
      // error toast handled by mutation's onError
    }
  };

  const confirmDelete = async (slug: string) => {
    await deleteMutation.mutateAsync(slug);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refetch();
    }, 300);
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
              Total: {totalCount} {totalCount === 1 ? "item" : "items"} found.
            </p>
          </div>

          <PagesTable
            pages={pages}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <PagesForm
            form={form}
            editingSlug={editingSlug}
            saving={createMutation.isPending || updateMutation.isPending}
            loading={loadingDetail}
            errors={errors}
            teamMembers={teamMembers}
            bannerImages={bannerImages}
            onBannerImagesChange={setBannerImages}
            svgItems={svgItems}
            onSvgItemsChange={setSvgItems}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
