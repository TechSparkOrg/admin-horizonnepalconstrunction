"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon, UploadCloud, Search, Box, Check, Loader2, X, FileVideoCameraIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMediaMutations, useUsageTypes } from "@/api/hooks/use-media-query";
import { MediaService } from "@/api/services/media.service";
import { EmptyState } from "@/components/global_ui/empty-state";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { isImageUrl, isVideoUrl, isModelUrl, isSvgUrl } from "@/lib/media";
import { useModelViewer } from "@/lib/model-viewer";

const USAGE_ALL = "all";

/** Single source of truth for what an upload may be: drives `accept`, the hint copy, and validation. */
const UPLOAD_SPEC = {
  image: {
    accept: ".jpg,.jpeg,.png,.webp,.svg",
    exts: ["jpg", "jpeg", "png", "webp", "svg"],
    maxBytes: 5 * 1024 * 1024,
    hint: "PNG, JPG, WEBP or SVG, up to 5 MB",
  },
  model: {
    accept: ".glb,.gltf,.obj",
    exts: ["glb", "gltf", "obj"],
    maxBytes: null,
    hint: "GLB, GLTF or OBJ",
  },
  video: {
    accept: ".mp4,.webm,.mov",
    exts: ["mp4", "webm", "mov"],
    maxBytes: null,
    hint: "MP4, WEBM or MOV",
  },
} as const;

const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

/** Returns an error message, or null when the file is allowed. */
function validateUpload(file: File, spec: (typeof UPLOAD_SPEC)[keyof typeof UPLOAD_SPEC]): string | null {
  // Extension, not MIME: .glb/.obj report empty or application/octet-stream across browsers.
  if (!(spec.exts as readonly string[]).includes(extOf(file.name))) {
    return `${extOf(file.name).toUpperCase() || "That file type"} isn't supported. Use ${spec.hint}.`;
  }
  if (spec.maxBytes && file.size > spec.maxBytes) {
    return `${formatSize(file.size)} is over the ${formatSize(spec.maxBytes)} limit.`;
  }
  return null;
}

type PreviewKind = "image" | "svg" | "video" | "model";

const kindFromUrl = (url: string): PreviewKind =>
  isSvgUrl(url) ? "svg" : isImageUrl(url) ? "image" : isVideoUrl(url) ? "video" : "model";

const kindFromFile = (file: File): PreviewKind =>
  extOf(file.name) === "svg" ? "svg"
    : file.type.startsWith("image/") ? "image"
      : file.type.startsWith("video/") ? "video"
        : "model";

/** The one preview surface, shared by both tabs. `blob` sources skip next/image optimisation. */
function PreviewBox({ src, kind, alt, blob = false }: { src: string; kind: PreviewKind; alt: string; blob?: boolean }) {
  if (kind === "svg") return <img src={src} alt={alt} className="w-full h-full object-contain p-2" />;
  if (kind === "video") return <video src={src} preload="metadata" muted playsInline className="w-full h-full object-contain" />;
  if (kind === "model") return <ModelThumbnail src={src} lazy={false} />;
  return <Image src={src} alt={alt} fill sizes="224px" className="object-contain p-2" unoptimized={blob} loading="lazy" />;
}

function ModelThumbnail({ src, lazy = true }: { src: string; lazy?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { loadModelViewer } = useModelViewer();
  useEffect(() => {
    let el: any = null;
    loadModelViewer().then(() => {
      el = document.createElement("model-viewer");
      el.src = src;
      el.loading = lazy ? "lazy" : "eager";
      el.cameraControls = false;
      el.autoRotate = false;
      el.reveal = "auto";
      el.style.width = "100%";
      el.style.height = "100%";
      ref.current?.appendChild(el);
    });
    return () => { if (el) el.remove(); };
  }, [src, lazy, loadModelViewer]);
  return <div ref={ref} className="w-full h-full" />;
}

export type PickerMediaItem = {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  category: string;
  type?: string;
};

type MediaPickerMode = "image" | "model" | "video";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: MediaPickerMode;
  title?: string;
  defaultCategory?: string;
  onSelect?: (item: PickerMediaItem, altText: string, file?: File) => void;
  multiSelect?: boolean;
  onMultiSelect?: (items: PickerMediaItem[]) => void;
}

export function MediaPickerDialog({
  open, onOpenChange, mode = "image", title, defaultCategory,
  onSelect, multiSelect = false, onMultiSelect,
}: MediaPickerDialogProps) {
  const modeInfo = {
    spec: mode === "model" ? UPLOAD_SPEC.model : mode === "video" ? UPLOAD_SPEC.video : UPLOAD_SPEC.image,
    title: mode === "model" ? "Select 3D Model" : mode === "video" ? "Select Video" : "Select Image",
    description:
      mode === "model"
        ? "Pick a 3D model from your library. Use models for AR/3D viewer elements."
        : mode === "video"
          ? "Pick a video from your library. Use videos for backgrounds or media elements."
          : "Pick an image from your library. PNG, JPG, WEBP, AVIF, or SVG supported.",
    searchPlaceholder:
      mode === "model" ? "Search models…" : mode === "video" ? "Search videos…" : "Search images…",
    emptyIcon: mode === "model" ? "CubeIcon" : mode === "video" ? "VideoCameraIcon" : "PhotoIcon",
    emptyDesc:
      mode === "model"
        ? "No models found. Upload a GLB/GLTF/OBJ model."
        : mode === "video"
          ? "No videos found. Upload a MP4/WEBM/MOV video."
          : "No images found. Upload a PNG, JPG or SVG image.",
    fileIcon: mode === "model" ? "CubeIcon" : mode === "video" ? "VideoCameraIcon" : "PhotoIcon",
    counterLabel: mode === "model" ? "model" : mode === "video" ? "video" : "image",
  };
  const spec = modeInfo.spec;
  const { data: usageTypes } = useUsageTypes();
  const { uploadMutation } = useMediaMutations();

  const [tab, setTab] = useState<"existing" | "upload">("existing");
  const [search, setSearch] = useState("");
  const [usageFilter, setUsageFilter] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<PickerMediaItem | null>(null);
  const [multiSelected, setMultiSelected] = useState<PickerMediaItem[]>([]);
  const [altText, setAltText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [allItems, setAllItems] = useState<PickerMediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterVersion, setFilterVersion] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef({ search: "", usageFilter: undefined as string | undefined, mode });
  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    filtersRef.current = { search, usageFilter, mode };
  }, [search, usageFilter, mode]);

  useEffect(() => {
    let cancelled = false;
    const { search, usageFilter, mode: fetchMode } = filtersRef.current;
    const isAppend = page > 1;
    fetchingRef.current = true;
    if (isAppend) setIsLoadingMore(true); else setIsLoading(true);

    const params: Record<string, unknown> = { page, page_size: 12 };
    if (search) params.search = search;
    const groupTitle =
      fetchMode === "video" ? "Videos" :
      fetchMode === "model" ? "3D Models" :
      "Images";
    params.group_title = groupTitle;
    if (usageFilter) params.usage_filter = usageFilter;

    MediaService.list(params)
      .then((res) => {
        if (cancelled) return;
        const mapped = (res.results ?? [])
          .filter((a) => {
            if (fetchMode === "model") return isModelUrl(a.url);
            if (fetchMode === "video") return isVideoUrl(a.url);
            return isImageUrl(a.url) || isSvgUrl(a.url);
          })
          .map((a) => ({
            id: a.id,
            name: a.alt || a.title || "",
            url: a.url,
            thumbnail: a.url,
            category: a.group_title || "General",
            type: a.url.split(".").pop()?.split("?")[0]?.toLowerCase(),
          }));
        setAllItems((prev) => isAppend ? [...prev, ...mapped] : mapped);
        setTotalCount(res.count ?? 0);
        hasMoreRef.current = res.next !== null;
      })
      .catch(() => { if (!cancelled) toast.error("Failed to load media"); })
      .finally(() => {
        if (!cancelled) { setIsLoading(false); setIsLoadingMore(false); fetchingRef.current = false; }
      });

    return () => { cancelled = true; };
  }, [page, filterVersion]);

  useEffect(() => {
    const el = sentinelRef.current;
    const root = scrollContainerRef.current;
    if (!el || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingRef.current && hasMoreRef.current && hasScrolledRef.current) {
          fetchingRef.current = true;
          setPage((p) => p + 1);
        }
      },
      { root, threshold: 0.1 },
    );

    const onScroll = () => { hasScrolledRef.current = true; };
    root.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(el);
    return () => { observer.disconnect(); root.removeEventListener("scroll", onScroll); };
  }, [allItems.length < totalCount]);

  useEffect(() => {
    if (open && tab === "existing") setUsageFilter(undefined);
  }, [open, tab]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1); setAllItems([]); setFilterVersion((v) => v + 1);
    }, 300);
  };

  const handleSelectExisting = (item: PickerMediaItem) => {
    if (multiSelect) {
      setMultiSelected((prev) =>
        prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item],
      );
    } else {
      setSelected(item);
      setAltText(item.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleFilePick = (file: File) => {
    const error = validateUpload(file, spec);
    if (error) { toast.error(error); return; }
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  // Object URLs outlive the component unless released on replace/close.
  useEffect(() => {
    if (!uploadPreview) return;
    return () => URL.revokeObjectURL(uploadPreview);
  }, [uploadPreview]);

  const reset = () => {
    setTab("existing"); setSearch(""); setUsageFilter(undefined);
    setSelected(null); setMultiSelected([]); setAltText("");
    setUploadFile(null); setUploadPreview(null);
    setPage(1); setAllItems([]); setFilterVersion((v) => v + 1);
    setUploadProgress(null); setIsDragging(false);
    hasScrolledRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleUpload = async (file: File, alt: string) => {
    setUploadProgress(0);
    try {
      return await uploadMutation.mutateAsync({ file, metadata: { alt }, onProgress: setUploadProgress });
    } catch { setUploadProgress(null); throw new Error("Upload failed"); }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (multiSelect) {
      if (tab === "upload" && uploadFile) {
        const media = await handleUpload(uploadFile, altText);
        if (media) onMultiSelect?.([...multiSelected, {
          id: media.id, name: media.alt || media.title || uploadFile.name,
          url: media.url, thumbnail: media.url, category: media.group_title || "General",
          type: mode === "model" ? uploadFile.name.split(".").pop() : undefined,
        }]);
      } else { onMultiSelect?.(multiSelected); }
      reset(); onOpenChange(false); return;
    }

    if (tab === "existing" && selected) {
      onSelect?.({
        id: selected.id, name: selected.name,
        url: selected.url, thumbnail: selected.thumbnail ?? selected.url,
        category: selected.category, type: selected.type,
      }, altText || selected.name);
    } else if (tab === "upload" && uploadFile) {
      const media = await handleUpload(uploadFile, altText);
      if (media) onSelect?.({
        id: media.id, name: media.alt || media.title || uploadFile.name,
        url: media.url, thumbnail: media.url, category: media.group_title || "General",
        type: mode === "model" ? uploadFile.name.split(".").pop() : undefined,
      }, altText);
    }
    reset(); onOpenChange(false);
  };

  const canConfirm = multiSelect
    ? tab === "upload" ? !!uploadFile : multiSelected.length > 0
    : tab === "existing" ? !!selected : !!uploadFile;

  const isUploading = uploadProgress !== null;
  const previewSrc = selected ? (selected.thumbnail ?? selected.url) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && isUploading) return;
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent
        className="sm:max-w-4xl h-[80vh] max-h-[680px] p-0 gap-0 flex flex-col overflow-hidden"
        showCloseButton={!isUploading}
        onInteractOutside={(e: Event) => { if (isUploading) e.preventDefault(); }}
        onEscapeKeyDown={(e: KeyboardEvent) => { if (isUploading) e.preventDefault(); }}
      >
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 px-4 py-3 border-b border-gray-100">
          <DialogTitle>{title ?? modeInfo.title}</DialogTitle>
          <DialogDescription>
            {modeInfo.description}
          </DialogDescription>
        </DialogHeader>

        {/* ── Tabs ── */}
        <Tabs
          value={tab}
          onValueChange={(v) => { if (!isUploading) setTab(v as "existing" | "upload"); }}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Tab nav */}
          <div className="shrink-0 px-4 pt-3 pb-0 border-b border-gray-100">
            <FormTabs tabs={[{ value: "existing", label: "Media Library" }, { value: "upload", label: "Upload New" }]} />
          </div>

          {/* ── Library tab ── */}
          <TabsContent value="existing" className="flex-1 min-h-0 m-0 data-[state=active]:flex">
            <div className="flex flex-1 min-h-0 divide-x divide-gray-100">

              {/* Left — grid */}
              <div className="flex flex-col flex-1 min-h-0 min-w-0">
                {/* Filters bar */}
                <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
                    <Input
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={modeInfo.searchPlaceholder}
                      className="pl-7 pr-7"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => handleSearchChange("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <Select
                    value={usageFilter ?? USAGE_ALL}
                    onValueChange={(value) => {
                      setUsageFilter(value === USAGE_ALL ? undefined : value);
                      setPage(1); setAllItems([]); setFilterVersion((v) => v + 1);
                    }}
                  >
                    <SelectTrigger className="min-w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USAGE_ALL}>All files</SelectItem>
                      <SelectItem value="used">In use</SelectItem>
                      <SelectItem value="unused">Unused</SelectItem>
                      {(usageTypes ?? []).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scrollable grid */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-3">
                  {isLoading ? (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-md bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : allItems.length === 0 ? (
                    <EmptyState
                      icon={modeInfo.emptyIcon === "CubeIcon" ? Box : modeInfo.emptyIcon === "VideoCameraIcon" ? FileVideoCameraIcon : ImageIcon}
                      title="No media found"
                      description={modeInfo.emptyDesc}
                    />
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {allItems.map((item, idx) => {
                        const thumb = item.thumbnail ?? item.url;
                        const active = multiSelect
                          ? multiSelected.some((i) => i.id === item.id)
                          : selected?.id === item.id;
                        return (
                          <button
                            key={`${item.id}-${idx}`}
                            type="button"
                            title={item.name}
                            onClick={() => handleSelectExisting(item)}
                            className={cn(
                              "relative aspect-square overflow-hidden rounded-md border transition-colors",
                              active ? "border-sidebar-primary" : "border-gray-200 hover:border-gray-400",
                            )}
                          >
                            {/* Thumbnail */}
                            <div className="absolute inset-0 bg-gray-50">
                              {isSvgUrl(thumb) ? (
                                <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
                              ) : isImageUrl(thumb) ? (
                                <Image src={thumb} alt={item.name} fill sizes="200px" className="object-cover" loading="lazy" />
                              ) : isVideoUrl(thumb) ? (
                                <video src={thumb} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                              ) : (
                                <ModelThumbnail src={thumb} />
                              )}
                            </div>

                            {/* Check */}
                            {active && (
                              <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-sidebar-primary">
                                <Check className="size-2.5 text-white" strokeWidth={3} />
                              </span>
                            )}

                            {/* Model type badge */}
                            {mode === "model" && item.type && (
                              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium uppercase text-white">
                                {item.type}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isLoadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="size-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  <div ref={sentinelRef} className="h-1" />
                </div>
              </div>

              {/* Right — preview + details */}
              <div className="shrink-0 w-56 flex flex-col bg-gray-50">
                {/* Preview box */}
                <div className="p-4">
                  <div className="aspect-square w-full rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center relative">
                    {multiSelect ? (
                      <p className="text-xs/relaxed text-gray-500 px-4 text-center">
                        {multiSelected.length > 0 ? `${multiSelected.length} selected` : "Select images"}
                      </p>
                    ) : previewSrc ? (
                      <PreviewBox src={previewSrc} kind={kindFromUrl(previewSrc)} alt={selected!.name} />
                    ) : (
                      <p className="text-xs/relaxed text-gray-500">No selection</p>
                    )}
                  </div>
                </div>

                {/* File details */}
                {selected && !multiSelect && (
                  <div className="px-4 pb-3 space-y-0.5">
                    <p className="text-xs/relaxed font-medium text-gray-800 truncate">{selected.name || "Untitled"}</p>
                    <p className="text-xs text-gray-500">
                      {selected.category}
                      {selected.type ? <span className="ml-1.5 uppercase">{selected.type}</span> : null}
                    </p>
                  </div>
                )}

                {/* Alt text */}
                {!multiSelect && (
                  <div className="px-4 pb-4 mt-auto space-y-1.5">
                    <Label className="text-gray-600">Alt text</Label>
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      disabled={!selected}
                      placeholder="Describe this image..."
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Upload tab ── */}
          <TabsContent value="upload" className="flex-1 min-h-0 m-0 data-[state=active]:flex">
            <div className="flex flex-1 min-h-0 flex-col p-4 gap-2">

              {/* Drop zone — doubles as the preview once a file is picked */}
              <Label
                htmlFor="media-upload-input"
                className={cn(
                  "group relative flex flex-1 min-h-0 items-center justify-center rounded-md border cursor-pointer overflow-hidden transition-colors",
                  isDragging
                    ? "border-sidebar-primary bg-sidebar-primary/5"
                    : uploadFile ? "border-gray-200 bg-gray-50" : "border-dashed border-gray-300 hover:border-gray-400",
                  isUploading && "pointer-events-none opacity-50",
                )}
                onDragOver={(e) => { e.preventDefault(); if (!isUploading) setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault(); setIsDragging(false);
                  if (isUploading) return;
                  const f = e.dataTransfer.files?.[0]; if (f) handleFilePick(f);
                }}
              >
                {uploadPreview && uploadFile ? (
                  <>
                    <PreviewBox src={uploadPreview} kind={kindFromFile(uploadFile)} alt={uploadFile.name} blob />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                      <span className="text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {isDragging ? "Drop to replace" : "Click or drag to replace"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <UploadCloud className={cn("size-5", isDragging ? "text-sidebar-primary" : "text-gray-400")} />
                    <div className="space-y-0.5">
                      <p className="text-xs/relaxed font-medium text-gray-700">
                        {isDragging ? "Drop your file here" : "Click to browse or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500">{spec.hint}</p>
                    </div>
                  </div>
                )}
              </Label>
              <input
                id="media-upload-input" type="file" accept={spec.accept} className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFilePick(f);
                  e.target.value = ""; // let the same file be re-picked after a rejection
                }}
              />

              {uploadFile && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
                  {modeInfo.fileIcon === "CubeIcon" ? <Box className="size-3.5 text-gray-400 shrink-0" /> : modeInfo.fileIcon === "VideoCameraIcon" ? <FileVideoCameraIcon className="size-3.5 text-gray-400 shrink-0" /> : <ImageIcon className="size-3.5 text-gray-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs/relaxed font-medium text-gray-700 truncate">{uploadFile.name}</p>
                    <p className="text-xs text-gray-500">{formatSize(uploadFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={(e) => { e.preventDefault(); setUploadFile(null); setUploadPreview(null); setAltText(""); }}
                    className="text-gray-400 hover:text-gray-700 transition-colors disabled:pointer-events-none disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-gray-600">Alt text</Label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={!uploadFile}
                  placeholder="Describe this image..."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Footer ── */}
        <DialogFooter className="shrink-0 flex-row items-center justify-between sm:justify-between border-t border-gray-100 px-4 py-3">
          <span className="text-xs text-gray-500">
            {tab === "existing" ? `${allItems.length} of ${totalCount} ${modeInfo.counterLabel}${allItems.length !== 1 ? "s" : ""}` : ""}
          </span>

          <div className="flex items-center gap-2">
            {isUploading && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-sidebar-primary transition-all rounded-full" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8">{uploadProgress}%</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isUploading}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={!canConfirm || isUploading}>
              {isUploading ? (
                <><Loader2 className="animate-spin" /> Uploading...</>
              ) : multiSelect ? (
                tab === "upload" ? "Upload & Add" : `Add${multiSelected.length > 0 ? ` (${multiSelected.length})` : ""}`
              ) : tab === "existing" ? "Select" : "Upload & Select"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
