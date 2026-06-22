"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/api/types/media.types";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  alt: z.string().min(1, "Alt text is required"),
  is_active: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.string().optional(),
});

export type BannerFormData = z.infer<typeof bannerSchema>;

interface Props {
  editing: MediaItem | null;
  saving: boolean;
  onSave: (data: BannerFormData, files: File[]) => Promise<void>;
  onBack: () => void;
}

export function BannerForm({ editing, saving, onSave, onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugManuallyEdited = useRef(!!editing?.slug);

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: editing?.title || "",
      slug: editing?.slug || "",
      alt: editing?.alt || "",
      is_active: editing?.is_active ?? true,
      meta_title: editing?.meta_title || "",
      meta_description: editing?.meta_description || "",
      keywords: editing?.keywords || "",
    },
  });

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.startsWith("blob:")) URL.revokeObjectURL(p);
      });
    };
  }, []);

  useEffect(() => {
    if (!editing) return;
    if (editing.url && previews.length === 0 && files.length === 0) {
      setPreviews([editing.url]);
    }
  }, [editing]);

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

  const rebuildPreviews = useCallback((selected: File[]) => {
    previews.forEach((p) => {
      if (p.startsWith("blob:")) URL.revokeObjectURL(p);
    });
    const urls = selected.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }, []);

  const handleFiles = useCallback(
    (selected: File[]) => {
      if (!selected.length) return;
      const images = Array.from(selected).filter((f) =>
        f.type.startsWith("image/")
      );
      if (images.length !== selected.length) {
        setFileError("Only image files are accepted for banners.");
        return;
      }
      setFileError(null);
      const updated = editing ? images : [...files, ...images];
      setFiles(updated);
      rebuildPreviews(updated);
    },
    [files, editing, rebuildPreviews]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    const removedPreview = previews[index];
    if (removedPreview?.startsWith("blob:"))
      URL.revokeObjectURL(removedPreview);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    if (viewerIndex >= updated.length && viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    }
  };

  const openViewer = (index: number) => {
    const activePreviews = editing?.url && files.length === 0 ? [editing.url] : previews;
    if (!activePreviews[index]) return;
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const onSubmit = async (data: BannerFormData) => {
    if (!editing && files.length === 0) {
      setFileError("Please select at least one banner image.");
      return;
    }
    setFileError(null);
    await onSave(data, files);
  };

  const displayPreviews = editing?.url && files.length === 0 ? [editing.url] : previews;
  const totalItems = displayPreviews.length || files.length || (editing?.url ? 1 : 0);

  return (
    <div>
      <FormHeader
        breadcrumb="Banners"
        title={editing ? "Edit Banner" : "Add Banner"}
        onBack={onBack}
        onSave={handleSubmit(onSubmit)}
        saving={isSubmitting || saving}
        saveDisabled={isSubmitting || saving}
        saveLabel={
          editing
            ? "Update"
            : files.length > 1
              ? `Upload ${files.length} banners`
              : "Upload"
        }
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

                  {displayPreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {displayPreviews.map((src, i) => (
                        <div
                          key={i}
                          className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
                          onClick={() => openViewer(i)}
                        >
                          <Image
                            src={src}
                            alt={`Banner ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Eye className="size-5 text-white drop-shadow-md" />
                          </div>
                          {i < files.length && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(i);
                              }}
                              className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/70 transition"
                            >
                              <X className="size-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video rounded-lg border-2 border-dashed border-gray-200 hover:border-sidebar-primary/30 hover:bg-gray-50 transition flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-sidebar-primary"
                      >
                        <Upload className="size-5" />
                        <span className="text-xs font-medium">Add more</span>
                      </button>
                    </div>
                  )}

                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition",
                      dragOver
                        ? "border-sidebar-primary bg-sidebar-primary/5"
                        : displayPreviews.length > 0
                          ? "border-gray-200 hover:border-sidebar-primary/30"
                          : "border-gray-300 hover:border-sidebar-primary/30"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="size-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">
                      {displayPreviews.length > 0
                        ? "Drop more images here"
                        : editing
                          ? "Drop new images to replace"
                          : "Drag & drop banner images here"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WebP up to 10MB each
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-3">
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {fileError && (
                    <p className="text-xs text-red-500">{fileError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Alt Text <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("alt")}
                    placeholder="Describe these banners"
                  />
                  {errors.alt && (
                    <p className="text-xs text-red-500">{errors.alt.message}</p>
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
          {displayPreviews[viewerIndex] && (
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
                  src={displayPreviews[viewerIndex]}
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
    </div>
  );
}
