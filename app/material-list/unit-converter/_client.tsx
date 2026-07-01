"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UnitConversionAdmin } from "@/api/services/unit-converter.service";
import { queryKeys } from "@/api/query-keys";
import { useUnitConverterList } from "@/api/hooks/use-unit-converter-query";
import type { UnitConversionItem } from "@/api/types/unit-converter.types";
import { unitConverterSchema } from "@/api/validation/unit-converter";
import { UnitConverterTable } from "@/components/page_ui/unit-converter-table";
import { UnitConverterForm, EMPTY as EMPTY_FORM } from "@/components/page_ui/unit-converter-form";
import type { UnitConverterFormData } from "@/components/page_ui/unit-converter-form";
import type { ConversionRule, BannerImage } from "@/api/types/unit-converter.types";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const ITEMS_PER_PAGE = 10;

type View = "list" | "form";

function itemToForm(item: UnitConversionItem): UnitConverterFormData {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description || "",
    attributeId: item.attribute_id,
    fieldLabel: item.field_label,
    baseUnit: item.base_unit,
    conversions: item.conversions,
    faqCategoryId: item.faq_category_id ?? null,
    faqGroupSlug: item.faq_group_slug ?? "",
    isActive: item.is_active,
    metaTitle: item.meta_title || "",
    metaDescription: item.meta_description || "",
    metaKeywords: item.meta_keywords || "",
    bannerImages: item.banner_images ?? [],
    videoUrl: item.video_url || "",
  };
}

function formToPayload(form: UnitConverterFormData) {
  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    attribute_id: form.attributeId,
    field_label: form.fieldLabel,
    base_unit: form.baseUnit,
    conversions: form.conversions,
    faq_category_id: form.faqCategoryId || null,
    faq_group_slug: form.faqGroupSlug || "",
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
  const [form, setForm] = useState<UnitConverterFormData>(EMPTY_FORM);
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

  const searchParams = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  }), [debouncedSearch, currentPage]);

  const { data } = useUnitConverterList(searchParams);
  const items = data?.results ?? [];
  const total = data?.count ?? 0;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setBannerImages([]);
    setEditingSlug(null);
    setView("form");
  };

  const openEdit = async (item: UnitConversionItem) => {
    try {
      const full = await queryClient.fetchQuery({
        queryKey: queryKeys.unitConverters.detail(item.slug),
        queryFn: () => UnitConversionAdmin.adminGet(item.slug),
      });
      const mapped = itemToForm(full);
      setForm(mapped);
      setBannerImages(mapped.bannerImages);
      setEditingSlug(item.slug);
      setView("form");
    } catch {
      toast.error("Failed to load conversion details");
    }
  };

  const back = () => {
    setForm(EMPTY_FORM);
    setBannerImages([]);
    setView("list");
  };

  const handleChange = (key: string, value: string | boolean | number | ConversionRule[] | null) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.unitConverters.all, refetchType: 'active' });

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof UnitConversionAdmin.create>[0]) =>
      UnitConversionAdmin.create(payload),
    onSuccess: () => { toast.success("Conversion created"); invalidate(); back(); },
    onError: () => toast.error("Failed to create conversion"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: Parameters<typeof UnitConversionAdmin.update>[1] }) =>
      UnitConversionAdmin.update(slug, payload),
    onSuccess: () => { toast.success("Conversion updated"); invalidate(); back(); },
    onError: () => toast.error("Failed to update conversion"),
  });

  const save = () => {
    const parsed = unitConverterSchema.safeParse(form);
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
      await UnitConversionAdmin.delete(slug);
      invalidate();
      toast.success("Conversion deleted");
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
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/material-list" className="text-xs text-gray-500 hover:text-gray-700">
                  ← Material List
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none mt-1">Unit Converter</h1>
              <p className="text-xs text-gray-500 mt-1">Manage unit conversion rules</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openNew}
              className="text-sidebar-primary border-sidebar-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Conversion
            </Button>
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
            <p className="text-sm text-sidebar-primary font-medium whitespace-nowrap">
              Total: {total} {total === 1 ? "item" : "items"} found.
            </p>
          </div>

          <UnitConverterTable
            items={items}
            onEdit={openEdit}
            onDelete={confirmDelete}
            page={currentPage}
            totalPages={totalPages}
            totalCount={total}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="px-4">
          <UnitConverterForm
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
