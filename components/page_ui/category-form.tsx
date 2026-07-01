"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, Eye, Star } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { categorySchema, type CategoryFormData } from "@/api/validation/category";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { FormCard } from "@/components/global_ui/form-card";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { TableHeaderRow } from "@/components/global_ui/table-header-row";
import { PaginationBar } from "@/components/global_ui/pagination-bar";
import { ActionButtons } from "@/components/global_ui/action-buttons";
import { ImagePreviewDialog } from "@/components/global_ui/image-preview-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import { CategoryAdmin } from "@/api/services/category.service";
import type { Category } from "@/api/types/category.types";
import { toSlug } from "@/lib/slug";
import { stripHtml } from "@/lib/html-content";

interface Props {
  editing: Category | null;
  saving: boolean;
  defaultValues?: Partial<CategoryFormData>;
  onSave: (data: CategoryFormData) => Promise<void>;
  onBack: () => void;
  parentCats?: Category[];
  showTypeField?: boolean;
  serviceCategories?: { id: string; name: string }[];
}

export function CategoryForm({ editing, saving, defaultValues, onSave, onBack, parentCats: propParentCats, showTypeField = true, serviceCategories }: Props) {
  const slugEdited = useRef(false);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerPage, setBannerPage] = useState(1);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parentCats, setParentCats] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("content");

  const BANNER_PER_PAGE = 5;

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
      defaultValues: {
        name: "",
        slug: "",
        type: "public",
        description: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        isActive: true,
        image: "",
        parent_id: null,
        faq_group_slug: "",
        service_id: null,
        bannerImages: [],
        ...defaultValues,
      },
  });

  const nameValue = watch("name");
  const parentIdValue = watch("parent_id");
  const bannerImages = watch("bannerImages");
  const totalBannerPages = Math.ceil(bannerImages.length / BANNER_PER_PAGE);
  const paginatedBanners = bannerImages.slice(
    (bannerPage - 1) * BANNER_PER_PAGE,
    bannerPage * BANNER_PER_PAGE
  );

  useEffect(() => {
    if (propParentCats) {
      setParentCats(propParentCats);
      return;
    }
    CategoryAdmin.listServices({ page: 1 })
      .then((res) => setParentCats(res.results ?? []))
      .catch(() => {});
  }, [propParentCats]);
  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description || "",
        type: editing.type,
        image: editing.image || "",
        parent_id: editing.parent_id,
        faq_group_slug: editing.faq_group_slug || "",
        service_id: editing.service_id ?? null,
        metaTitle: stripHtml(editing.meta_title || ""),
        metaDescription: stripHtml(editing.meta_description || ""),
        metaKeywords: stripHtml(editing.meta_keywords || ""),
        isActive: editing.is_active ?? true,
        bannerImages: editing.banner_images || [],
      });
      slugEdited.current = true;
    } else {
      reset({
        name: "",
        slug: "",
        type: "public",
        description: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        isActive: true,
        image: "",
        parent_id: null,
        service_id: null,
        bannerImages: [],
        ...defaultValues,
      });
      slugEdited.current = false;
    }
  }, [editing, defaultValues, reset]);

  useEffect(() => {
    if (!slugEdited.current && nameValue) {
      setValue("slug", toSlug(nameValue));
    }
  }, [nameValue, setValue]);

  const handleBannerSelect = (item: PickerMediaItem, altText: string, file?: File) => {
    const newItem = file ? { ...item, name: altText || item.name } : item;

    if (editingBannerId) {
      setValue(
        "bannerImages",
        bannerImages.map((img) =>
          img.id === editingBannerId
            ? { ...img, url: newItem.url, name: altText || newItem.name }
            : img
        )
      );
      setEditingBannerId(null);
    } else {
      const isFirst = bannerImages.length === 0;
      setValue("bannerImages", [
        ...bannerImages,
        { ...newItem, name: altText || newItem.name, isPrimary: isFirst || undefined },
      ]);
    }
  };

  const togglePrimary = (id: string) => {
    setValue(
      "bannerImages",
      bannerImages.map((img) => ({
        ...img,
        isPrimary: img.id === id ? true : undefined,
      }))
    );
  };

  const removeBannerImage = (id: string) => {
    const remaining = bannerImages.filter((img) => img.id !== id);
    const needsPromotion = remaining.length > 0 && !remaining.some((img) => img.isPrimary);
    setValue(
      "bannerImages",
      needsPromotion
        ? remaining.map((img, idx) => idx === 0 ? { ...img, isPrimary: true } : img)
        : remaining
    );
  };

  const onSubmit = async (data: CategoryFormData) => {
    await onSave(data);
  };

  return (
    <div>
      <FormHeader
        breadcrumb="Categories"
        title={editing ? "Edit Category" : "New Category"}
        onBack={onBack}
        onSave={handleSubmit(onSubmit)}
        saving={isSubmitting || saving}
        saveDisabled={isSubmitting || saving}
        saveLabel={editing ? "Update" : "Publish"}
        saveForm="category-form"
      />

      <form id="category-form" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("parent_id")} />
        <input type="hidden" {...register("bannerImages")} />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full flex flex-col">
          <div>
            <FormTabs tabs={[
              { value: "content", label: "Content" },
              { value: "media", label: "Media" },
              { value: "seo", label: "SEO" },
              { value: "settings", label: "Settings" },
            ]} />
          </div>

          <div>
            <TabsContent value="content" className="space-y-5 mt-4">
              <FormCard>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name <span className="text-red-500">*</span></Label>
                    <Input
                      {...register("name")}
                      placeholder="Category name"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                      <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
                        /
                      </span>
                      <Input
                        {...register("slug")}
                        placeholder="category-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0"
                        onChange={(e) => { slugEdited.current = true; register("slug").onChange(e); }}
                      />
                    </div>
                    {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                  </div>
                </div>

                {showTypeField && (
                  <div className="space-y-1.5">
                    <Label>Type <span className="text-red-500">*</span></Label>
                    <SegmentedToggle
                      value={watch("type")}
                      onChange={(v) => setValue("type", v as "public" | "internal")}
                      options={[
                        { value: "public" as const, label: "Public" },
                        { value: "internal" as const, label: "Internal" },
                      ]}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <RichEditor
                    value={watch("description") || ""}
                    onChange={(html) => setValue("description", html)}
                    minHeight={260}
                  />
                </div>

              </FormCard>
            </TabsContent>

            <TabsContent value="seo" className="mt-4">
              <SeoFields
                metaTitle={watch("metaTitle") || ""}
                metaDescription={watch("metaDescription") || ""}
                metaKeywords={watch("metaKeywords") || ""}
                onMetaTitleChange={(v) => setValue("metaTitle", v)}
                onMetaDescriptionChange={(v) => setValue("metaDescription", v)}
                onMetaKeywordsChange={(v) => setValue("metaKeywords", v)}
              />
            </TabsContent>

            <TabsContent value="media" className="mt-4 space-y-5">
              <FormCard className="space-y-0">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900">Banner Images</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setMediaPickerOpen(true)}>
                    <ImagePlus className="size-4" />
                    Add Banner
                  </Button>
                </div>

                {bannerImages.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <ImagePlus className="size-6" />
                    <span className="text-sm">No banner images added yet</span>
                  </div>
                ) : (
                  <div>
                    <Table>
                      <TableHeaderRow columns={[
                        { label: "", className: "w-10" },
                        { label: "Image" },
                        { label: "Name" },
                        { label: "Actions", className: "text-right" },
                      ]} />
                      <TableBody>
                        {paginatedBanners.map((img, idx) => (
                          <TableRow key={`${img.id}-${idx}`} className="border-gray-200 hover:bg-gray-50">
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => togglePrimary(img.id)}
                                title={img.isPrimary ? "Primary thumbnail" : "Set as primary thumbnail"}
                              >
                                <Star
                                  className={`size-4 ${img.isPrimary ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                                />
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="size-10 rounded-md overflow-hidden bg-gray-100">
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-900 truncate max-w-[220px]">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{img.name}</span>
                                {img.isPrimary && (
                                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-500 border-gray-200 hover:bg-gray-100"
                                  onClick={() => setPreviewUrl(img.url)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <ActionButtons
                                  onEdit={() => {
                                    setEditingBannerId(img.id);
                                    setMediaPickerOpen(true);
                                  }}
                                  onDelete={() => removeBannerImage(img.id)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {totalBannerPages > 1 && (
                      <div className="mt-3">
                        <PaginationBar page={bannerPage} totalPages={totalBannerPages} onPageChange={setBannerPage} />
                      </div>
                    )}
                  </div>
                )}
              </FormCard>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <FormCard>
                <p className="text-sm font-semibold text-gray-900 mb-4">Status</p>
                <SegmentedToggle
                  value={!!watch("isActive")}
                  onChange={(v) => setValue("isActive", v)}
                  options={[
                    { value: true, label: "Active" },
                    { value: false, label: "Inactive" },
                  ]}
                />

                <div className="space-y-1.5 mt-5">
                  <Label>FAQ Title / Slug</Label>
                  <Input
                    value={watch("faq_group_slug") || ""}
                    onChange={(e) => setValue("faq_group_slug", e.target.value)}
                    placeholder="e.g. cement-faq"
                  />
                  <p className="text-[11px] text-amber-600 leading-relaxed mt-1">
                    Slug must be exactly as typed in the FAQ section to display related Q&amp;A
                  </p>
                </div>

                <div className="space-y-1.5 mt-5">
                  <Label>Parent Category</Label>
                  <Select
                    value={parentIdValue ?? "__none__"}
                    onValueChange={(v) => setValue("parent_id", v === "__none__" ? null : v)}
                  >
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None (top-level)</SelectItem>
                      {parentCats
                        .filter((c) => c.id !== editing?.id)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {serviceCategories && (
                  <div className="space-y-1.5 mt-5">
                    <Label>Belongs to Service</Label>
                    <Select
                      value={watch("service_id") ?? "__none__"}
                      onValueChange={(v) => setValue("service_id", v === "__none__" ? null : v)}
                    >
                      <SelectTrigger className="max-w-sm">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None (standalone)</SelectItem>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </FormCard>
            </TabsContent>
          </div>
        </Tabs>
      </form>

      <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={(o) => {
          setMediaPickerOpen(o);
          if (!o) setEditingBannerId(null);
        }}
        mode="image"
        title={editingBannerId ? "Update Banner Image" : "Select Banner Image"}
        onSelect={handleBannerSelect}
      />
    </div>
  );
}
