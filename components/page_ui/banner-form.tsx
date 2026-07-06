"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Library } from "lucide-react";
import { ActionButtons } from "@/components/global_ui/action-buttons";
import { FormHeader } from "@/components/global_ui/form-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { toSlug } from "@/lib/slug";
import type { BannerGroup } from "@/api/types/media.types";
import { MediaPickerDialog, type PickerMediaItem } from "@/components/global_ui/media-handler-picker";

const altFromUrl = (url: string) =>
  url.split('/').pop()?.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || "";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  alt: z.string().optional(),
  is_active: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.string().optional(),
});

export type BannerFormData = z.infer<typeof bannerSchema>;

interface Props {
  editing: { group: BannerGroup } | null;
  saving: boolean;
  onSave: (data: BannerFormData, pickedLibraryItems?: { id: string; url: string; alt: string }[], deletedImageIds?: string[]) => Promise<void>;
  onBack: () => void;
}

export function BannerForm({ editing, saving, onSave, onBack }: Props) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedLibraryImages, setPickedLibraryImages] = useState<PickerMediaItem[]>([]);
  const [altOverrides, setAltOverrides] = useState<Record<string, string>>({});
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const slugManuallyEdited = useRef(!!editing?.group?.slug);
  const existingImages = (editing?.group?.images ?? []).filter(img => !deletedImageIds.includes(img.id));

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: editing?.group?.title || "",
      slug: editing?.group?.slug || "",
      alt: editing?.group?.alt || "",
      is_active: editing?.group?.is_active ?? true,
      meta_title: editing?.group?.meta_title || "",
      meta_description: editing?.group?.meta_description || "",
      keywords: editing?.group?.keywords || "",
    },
  });

  const watchTitle = watch("title");
  const watchIsActive = watch("is_active");
  const watchMetaTitle = watch("meta_title");
  const watchMetaDesc = watch("meta_description");
  const watchKeywords = watch("keywords");

  useEffect(() => {
    if (watchTitle && !slugManuallyEdited.current) {
      setValue("slug", toSlug(watchTitle));
    }
  }, [watchTitle, setValue]);

  const openViewer = (index: number) => {
    if (!allUrls[index]) return;
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const onSubmit = async (data: BannerFormData) => {
    if (!editing && pickedLibraryImages.length === 0) {
      return;
    }
    const pickedLibraryItems = pickedLibraryImages.map(item => ({
      id: item.id,
      url: item.url,
      alt: altOverrides[item.url] ?? altFromUrl(item.url),
    }));
    await onSave(data, pickedLibraryItems, deletedImageIds);
  };

  const existingUrls = existingImages.map(i => i.url);
  const pickedUrls = pickedLibraryImages.map(i => i.url);
  const allUrls = [...existingUrls, ...pickedUrls];
  const totalItems = existingUrls.length + pickedUrls.length;

  return (
    <div>
      <FormHeader
        breadcrumb="Banners"
        title={editing ? "Edit Banner" : "Add Banner"}
        onBack={onBack}
        onSave={handleSubmit(onSubmit)}
        saving={isSubmitting || saving}
        saveDisabled={isSubmitting || saving}
        saveLabel={editing ? "Update" : "Save"}
        saveForm="banner-form"
      />

      <form id="banner-form" onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
          <div>
            <FormTabs tabs={[
              { value: "overview", label: "Overview" },
              { value: "content", label: "Content" },
              { value: "seo", label: "SEO" },
            ]} />
          </div>

          <div>
            <TabsContent value="overview" className="space-y-5 mt-4">
              <FormCard className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Title <span className="text-red-500">*</span></Label>
                    <Input
                      {...register("title")}
                      placeholder="e.g. Summer Promotion"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input
                      {...register("slug")}
                      placeholder="auto-generated from title"
                      onChange={(e) => {
                        register("slug").onChange(e);
                        slugManuallyEdited.current = true;
                      }}
                    />
                    <p className="text-xs text-gray-400">
                      Shared slug for all images in this banner group.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <SegmentedToggle<boolean>
                    value={watchIsActive}
                    onChange={(v) => setValue("is_active", v)}
                    options={[
                      { value: true, label: "Active" },
                      { value: false, label: "Inactive" },
                    ]}
                  />
                </div>
              </FormCard>
            </TabsContent>

            <TabsContent value="content" className="space-y-5 mt-4">
              <FormCard className="w-full">
                <div className="space-y-3">
                  <Label>Banner Images{!editing ? " *" : ""}</Label>

                  <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                    <Library className="size-4" />
                    Library
                  </Button>

                  {allUrls.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[48px_1fr_minmax(0,1fr)_auto] gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                        <span>Preview</span>
                        <span>File</span>
                        <span>Alt Text</span>
                        <span className="text-right">Actions</span>
                      </div>
                      {allUrls.map((src, i) => {
                        const isExisting = i < existingUrls.length;
                        const deleteLabel = isExisting
                          ? "Delete"
                          : "Remove from selection";
                        const defaultAlt = isExisting
                          ? (existingImages[i].alt || "")
                          : altFromUrl(src);
                        const altValue = altOverrides[src] !== undefined ? altOverrides[src] : defaultAlt;
                        return (
                          <div
                            key={i}
                            className="grid grid-cols-[48px_1fr_minmax(0,1fr)_auto] gap-3 px-4 py-2 border-b border-gray-100 last:border-b-0 items-center hover:bg-gray-50 transition"
                          >
                            <div
                              className="size-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer relative"
                              onClick={() => openViewer(i)}
                            >
                              <Image src={src} alt="" fill className="object-cover" sizes="40px" />
                            </div>
                            <span className="text-xs text-gray-700 truncate">
                              {src.split('/').pop() || `Image ${i + 1}`}
                            </span>
                            <input
                              value={altValue}
                              onChange={(e) => setAltOverrides(prev => ({ ...prev, [src]: e.target.value }))}
                              placeholder="Describe this image"
                              className="h-7 text-xs rounded border border-gray-200 px-2 bg-white focus:outline-none focus:border-sidebar-primary w-full min-w-0"
                            />
                            <ActionButtons
                              onEdit={() => openViewer(i)}
                              onDelete={() => {
                                if (isExisting) {
                                  const img = existingImages[i];
                                  if (img) setDeletedImageIds(prev => [...prev, img.id]);
                                } else {
                                  const pickIdx = i - existingUrls.length;
                                  setPickedLibraryImages(prev => prev.filter((_, idx) => idx !== pickIdx));
                                }
                              }}
                              showDelete
                              editLabel="View"
                              deleteLabel={deleteLabel}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}


                </div>
              </FormCard>
            </TabsContent>

            <TabsContent value="seo" className="mt-4">
              <SeoFields
                metaTitle={watchMetaTitle ?? ""}
                metaDescription={watchMetaDesc ?? ""}
                metaKeywords={watchKeywords ?? ""}
                onMetaTitleChange={(v) => setValue("meta_title", v)}
                onMetaDescriptionChange={(v) => setValue("meta_description", v)}
                onMetaKeywordsChange={(v) => setValue("keywords", v)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </form>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="!max-w-[90vw] !max-h-[90vh] p-0 overflow-hidden bg-black/90 border-0">
          {allUrls[viewerIndex] && (
            <div className="relative w-full h-full flex items-center justify-center min-h-[50vh]">
              {totalItems > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewerIndex(
                        (viewerIndex - 1 + totalItems) % totalItems
                      );
                    }}
                    className="absolute left-3 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewerIndex((viewerIndex + 1) % totalItems);
                    }}
                    className="absolute right-3 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
              <div className="relative w-full h-[80vh]">
                <Image
                  src={allUrls[viewerIndex]}
                  alt={`Banner ${viewerIndex + 1}`}
                  fill
                  className="object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium">
                {viewerIndex + 1} / {totalItems}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {pickerOpen && (
        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          mode="image"
          defaultCategory="Banners"
          multiSelect
          onMultiSelect={(items) => {
            setPickedLibraryImages(prev => {
              const existing = new Set(prev.map(i => i.id));
              const newItems = items.filter(i => !existing.has(i.id));
              return [...prev, ...newItems];
            });
          }}
        />
      )}
    </div>
  );
}
