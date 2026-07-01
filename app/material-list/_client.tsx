"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { queryKeys } from "@/api/query-keys";
import { useMaterialList } from "@/api/hooks/use-material-list-query";
import type { MaterialItem, BannerImage, VariantItem } from "@/api/types/material-list.types";
import { materialSchema } from "@/api/validation/material";
import { MaterialListTable } from "@/components/page_ui/material-list-table";
import { MaterialListForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/material-list-form";
import type { MaterialListFormData } from "@/components/page_ui/material-list-form";
import { PageHeader } from "@/components/global_ui/page-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function itemToForm(item: MaterialItem): MaterialListFormData {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description || "",
    pricePerUnit: item.price_per_unit,
    unitValue: item.unit_value,
    companyId: item.company_id,
    logo: item.logo,
    serviceCategoryId: item.service_category_id,
    faqCategoryId: item.faq_category_id,
    faqGroupSlug: item.faq_group_slug ?? "",
    variants: item.variants ?? [],
    isActive: item.is_active,
    metaTitle: item.meta_title || "",
    metaDescription: item.meta_description || "",
    metaKeywords: item.meta_keywords || "",
    bannerImages: item.banner_images ?? [],
    videoUrl: item.video_url || "",
  };
}

function formToPayload(form: MaterialListFormData) {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    price_per_unit: form.pricePerUnit === "" ? 0 : form.pricePerUnit,
    unit_value: form.unitValue,
    company_id: form.companyId,
    logo: form.logo,
    service_category_id: form.serviceCategoryId,
    faq_category_id: form.faqCategoryId,
    faq_group_slug: form.faqGroupSlug || "",
    variants: form.variants,
    is_active: form.isActive,
    meta_title: form.metaTitle,
    meta_description: form.metaDescription,
    meta_keywords: form.metaKeywords,
    banner_images: form.bannerImages,
    video_url: form.videoUrl,
  };
}

export function _Client() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialListFormData>(EMPTY_FORM);
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);

  const handleBannerImagesChange = (images: BannerImage[]) => {
    setBannerImages(images);
    setForm((prev) => ({ ...prev, bannerImages: images }));
  };

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const searchParams = useMemo(
    () => ({
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
    }),
    [debouncedSearch, currentPage]
  );

  const { data, isLoading } = useMaterialList(searchParams);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setBannerImages([]);
    setEditingSlug(null);
    setView("form");
  };

  const openEdit = async (item: MaterialItem) => {
    try {
      const full = await queryClient.fetchQuery({
        queryKey: queryKeys.materialList.detail(item.slug),
        queryFn: () => MaterialListAdmin.adminGet(item.slug),
      });
      const mapped = itemToForm(full);
      setForm(mapped);
      setBannerImages(mapped.bannerImages);
      setEditingSlug(item.slug);
      setView("form");
    } catch {
      toast.error("Failed to load material details");
    }
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setBannerImages([]);
    setView("list");
  };

  const handleChange = (
    key: string,
    value: string | boolean | number | VariantItem[] | null
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.materialList.all, refetchType: 'active' });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      MaterialListAdmin.create(payload as any),
    onSuccess: () => {
      toast.success("Material created");
      invalidate();
      back();
    },
    onError: () => toast.error("Failed to create material"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: Record<string, unknown>;
    }) => MaterialListAdmin.update(slug, payload as any),
    onSuccess: () => {
      toast.success("Material updated");
      invalidate();
      back();
    },
    onError: () => toast.error("Failed to update material"),
  });

  const save = () => {
    const parsed = materialSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Validation failed");
      return;
    }
    const payload = formToPayload(form);
    if (editingSlug) {
      updateMutation.mutate({ slug: editingSlug, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDelete = async (slug: string) => {
    try {
      await MaterialListAdmin.delete(slug);
      invalidate();
      toast.success("Material deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <>
      {view === "list" ? (
        <PageHeader
          title="Material List"
          actionOutlined
          subtitle={
            <>
              Manage materials and their pricing
              <span className="mx-2">·</span>
              <Link
                href="/material-list/unit-converter"
                className="text-sidebar-primary hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeftRight className="size-3" />
                Unit Converter
              </Link>
            </>
          }
          actionLabel="Add Material"
          onAction={openNew}
        >
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

          <MaterialListTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={setCurrentPage}
          />
        </PageHeader>
      ) : (
        <div className="px-4">
          <MaterialListForm
            form={form}
            editingId={editingSlug}
            saving={createMutation.isPending || updateMutation.isPending}
            bannerImages={bannerImages}
            onBannerImagesChange={handleBannerImagesChange}
            onChange={handleChange}
            onSave={save}
            onBack={back}
          />
        </div>
      )}
    </>
  );
}
