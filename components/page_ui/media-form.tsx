"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Eye, X, Box } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import type { MediaItem } from "@/api/types/media.types";
import { toSlug } from "@/lib/slug";
import { isVideoUrl, isModelUrl, isImageUrl, isSvgUrl } from "@/lib/media";
import { ModelViewer } from "@/components/global_ui/ModelViewer";
import { FormCard } from "@/components/global_ui/form-card";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { cn } from "@/lib/utils";

const mediaSchema = z.object({
  alt: z.string().min(1, "Alt text is required"),
  title: z.string().optional(),
  slug: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.string().optional(),
  project_link: z.string().optional(),

  is_active: z.boolean(),
});

export type MediaFormData = z.infer<typeof mediaSchema>;

interface Props {
  editing: MediaItem | null;
  saving: boolean;
  onSave: (data: MediaFormData, files?: File[]) => Promise<void>;
  onBack: () => void;
  groupTitle: string;
  accept?: string;
  allowMultiple?: boolean;
}

export function MediaForm({ editing, saving, onSave, onBack, groupTitle, accept = "image/*,video/*", allowMultiple }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string>(editing?.url || "");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageOrVideo = (f: File) => f.type.startsWith("image/") || f.type.startsWith("video/");

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      alt: editing?.alt || "",
      title: editing?.title || "",
      slug: editing?.slug || "",
      meta_title: editing?.meta_title || "",
      meta_description: editing?.meta_description || "",
      keywords: editing?.keywords || "",
      project_link: editing?.project_link || "",
      is_active: editing?.is_active ?? true,
    },
  });

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, []);

  const handleFiles = (selected: File[]) => {
    if (!selected.length) return;
    setFiles(selected);
    const first = selected[0];
    if (isImageOrVideo(first)) {
      setPreview(URL.createObjectURL(first));
    } else if (first.name.match(/\.(glb|gltf)$/i)) {
      setPreview(URL.createObjectURL(first));
    } else {
      setPreview(first.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleRemoveFiles = () => {
    setFiles([]);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(editing?.url || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileError(null);
  };

  const onSubmit = async (data: MediaFormData) => {
    if (!editing && files.length === 0) {
      setFileError("Please select a file to upload");
      return;
    }
    setFileError(null);
    await onSave(data, files.length > 0 ? files : undefined);
  };

  const watchMetaTitle = watch("meta_title");
  const watchMetaDesc = watch("meta_description");
  const watchIsActive = watch("is_active");
  const watchTitle = watch("title");

  const slugManuallyEdited = useRef(!!editing?.slug);

  useEffect(() => {
    if (watchTitle && !slugManuallyEdited.current) {
      setValue("slug", toSlug(watchTitle));
    }
  }, [watchTitle, setValue]);

  const renderPreviewContent = () => {
    if (files[0]?.type.startsWith("video/") || isVideoUrl(preview)) {
      return <video src={preview} controls autoPlay className="max-w-[90vw] max-h-[90vh] rounded-lg" onClick={(e) => e.stopPropagation()} />;
    }
    if (isModelUrl(preview) || (files[0]?.name || preview).match(/\.(glb|gltf)$/i)) {
      return (
        <div className="w-[80vw] h-[80vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <ModelViewer src={preview} className="w-full h-full" ar arModes="webxr scene-viewer quick-look" />
        </div>
      );
    }
    if (isSvgUrl(preview)) {
      return <img src={preview} alt="Full preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />;
    }
    return (
      <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image src={preview} alt="Full preview" fill className="object-contain rounded-lg" sizes="90vw" />
      </div>
    );
  };

  return (
    <div>
      <FormHeader
        breadcrumb={groupTitle}
        title={editing ? "Edit Media" : "Add Media"}
        onBack={onBack}
        onSave={handleSubmit(onSubmit)}
        saving={isSubmitting || saving}
        saveDisabled={isSubmitting || saving}
        saveLabel={editing ? "Update" : files.length > 1 ? `Upload ${files.length} files` : "Upload"}
        saveForm="media-form"
      />

      <form id="media-form" onSubmit={handleSubmit(onSubmit)}>
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
                      placeholder="Media title (used for public links)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input
                      {...register("slug")}
                      placeholder="leave blank to auto-generate from title"
                      onChange={(e) => {
                        register("slug").onChange(e);
                        slugManuallyEdited.current = true;
                      }}
                    />
                    <p className="text-xs text-gray-400">Auto-generated from title if left empty.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <SegmentedToggle<boolean>
                    value={watchIsActive}
                    onChange={(v) => setValue("is_active", v)}
                    options={[{ value: true, label: "Active" }, { value: false, label: "Inactive" }]}
                  />
                </div>
              </FormCard>
            </TabsContent>

            <TabsContent value="content" className="space-y-5 mt-4">
              <FormCard className="w-full">
                <div className="space-y-1.5">
                  <Label>File{!editing && " *"}</Label>

                  {editing?.url && files.length === 0 && (
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="size-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                          {isSvgUrl(editing.url) ? (
                            <img src={editing.url} alt={editing.alt} className="w-full h-full object-contain" />
                          ) : editing.url.match(/\.(jpe?g|png|webp|gif|svg|bmp|ico|tiff?)/i) ? (
                            <Image src={editing.url} alt={editing.alt} width={56} height={56} className="w-full h-full object-cover" />
                          ) : isVideoUrl(editing.url) ? (
                            <video src={editing.url} className="w-full h-full object-cover" muted />
                          ) : isModelUrl(editing.url) ? (
                            <ModelViewer src={editing.url} className="w-full h-full" cameraControls={false} autoRotate={false} />
                          ) : (
                            <Box className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{editing.url.split("/").pop() || "Current file"}</p>
                          <p className="text-xs text-gray-500">Upload a new file to replace</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {editing.url.match(/\.(jpe?g|png|webp|gif|svg|bmp|ico|tiff?)/i) || isVideoUrl(editing.url) || editing.url.match(/\.(glb|gltf)$/i) ? (
                            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setViewerOpen(true); }}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="size-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                          {files[0].type === "image/svg+xml" ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                          ) : files[0].type.startsWith("image/") ? (
                            <Image src={preview} alt="Preview" width={56} height={56} className="w-full h-full object-cover" />
                          ) : files[0].type.startsWith("video/") ? (
                            <video src={preview} className="w-full h-full object-cover" muted />
                          ) : files[0].name.match(/\.(glb|gltf|fbx|obj|stl|usdz|usd|ply|3ds|blend)$/i) ? (
                            <ModelViewer src={preview} className="w-full h-full" cameraControls={false} autoRotate={false} />
                          ) : (
                            <Box className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {files.length === 1 ? files[0].name : `${files.length} files selected`}
                          </p>
                          {files.length === 1 && (
                            <p className="text-xs text-gray-500">{(files[0].size / 1024 / 1024).toFixed(1)} MB</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {files.length === 1 && (isImageOrVideo(files[0]) || files[0].name.match(/\.(glb|gltf)$/i)) && (
                            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setViewerOpen(true); }}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200" onClick={(e) => { e.stopPropagation(); handleRemoveFiles(); }}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition",
                      dragOver ? "border-sidebar-primary bg-sidebar-primary/5" : "border-gray-200 hover:border-sidebar-primary/30"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1.5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">
                      {files.length > 0 ? (allowMultiple ? "Add more files" : "Change file") : editing ? "Replace file" : "Drag & drop files here"}
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={accept}
                      multiple={allowMultiple}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {fileError && <p className="text-xs text-red-500">{fileError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Alt Text <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("alt")}
                    placeholder="Describe this media"
                  />
                  {errors.alt && <p className="text-xs text-red-500">{errors.alt.message}</p>}
                </div>
              </FormCard>
            </TabsContent>

            <TabsContent value="seo" className="mt-4">
              <SeoFields
                metaTitle={watchMetaTitle ?? ""}
                metaDescription={watchMetaDesc ?? ""}
                metaKeywords={watch("keywords") ?? ""}
                onMetaTitleChange={(v) => setValue("meta_title", v)}
                onMetaDescriptionChange={(v) => setValue("meta_description", v)}
                onMetaKeywordsChange={(v) => setValue("keywords", v)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </form>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="!max-w-[90vw] !max-h-[90vh] p-0 overflow-hidden bg-black/90 border-0" aria-describedby="preview-desc">
          <DialogHeader>
            <DialogTitle className="sr-only">Media Preview</DialogTitle>
            <DialogDescription id="preview-desc" className="sr-only">
              Full-size preview of the selected media file
            </DialogDescription>
          </DialogHeader>
          {renderPreviewContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
