"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon, UploadCloud, Search, Box, Check, Loader2, X, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaMutations, useUsageTypes } from "@/api/hooks/use-media-query";
import { MediaService } from "@/api/services/media.service";
import { EmptyState } from "@/components/global_ui/empty-state";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { isImageUrl, isVideoUrl, isModelUrl, isSvgUrl } from "@/lib/media";
import { useModelViewer } from "@/lib/model-viewer";

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

type MediaPickerMode = "image" | "model";

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
  const isModel = mode === "model";
  const acceptTypes = isModel ? ".glb,.gltf,.obj" : "image/*";
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
  const filtersRef = useRef({ search: "", usageFilter: undefined as string | undefined, defaultCategory, isModel });
  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    filtersRef.current = { search, usageFilter, defaultCategory, isModel };
  }, [search, usageFilter, defaultCategory, isModel]);

  useEffect(() => {
    let cancelled = false;
    const { search, usageFilter, defaultCategory, isModel } = filtersRef.current;
    const isAppend = page > 1;
    fetchingRef.current = true;
    if (isAppend) setIsLoadingMore(true); else setIsLoading(true);

    const params: Record<string, unknown> = { page, page_size: 12 };
    if (search) params.search = search;
    if (defaultCategory) params.group_title = defaultCategory;
    if (usageFilter) params.usage_filter = usageFilter;

    MediaService.list(params)
      .then((res) => {
        if (cancelled) return;
        const mapped = (res.results ?? [])
          .filter((a) => isModel ? true : !isModelUrl(a.url))
          .map((a) => ({
            id: a.id,
            name: a.alt || a.title || "",
            url: a.url,
            thumbnail: a.url,
            category: a.group_title || "General",
            type: a.url.split(".").pop()?.toLowerCase(),
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
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

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

  const handleConfirm = async () => {
    if (multiSelect) {
      if (tab === "upload" && uploadFile) {
        const media = await handleUpload(uploadFile, altText);
        if (media) onMultiSelect?.([...multiSelected, {
          id: media.id, name: media.alt || media.title || uploadFile.name,
          url: media.url, thumbnail: media.url, category: media.group_title || "General",
          type: isModel ? uploadFile.name.split(".").pop() : undefined,
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
        type: isModel ? uploadFile.name.split(".").pop() : undefined,
      }, altText);
    }
    reset(); onOpenChange(false);
  };

  const canConfirm = multiSelect
    ? tab === "upload" ? !!uploadFile : multiSelected.length > 0
    : tab === "existing" ? !!selected : !!uploadFile;

  const previewSrc = selected ? (selected.thumbnail ?? selected.url) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && uploadProgress !== null) return;
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent
        className="!max-w-5xl p-0 gap-0 flex flex-col overflow-hidden"
        style={{ height: "82vh", maxHeight: "720px" }}
        showCloseButton={uploadProgress === null}
        onInteractOutside={(e: Event) => { if (uploadProgress !== null) e.preventDefault(); }}
        onEscapeKeyDown={(e: KeyboardEvent) => { if (uploadProgress !== null) e.preventDefault(); }}
      >
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold text-gray-900">
            {title ?? (isModel ? "Choose a 3D Model" : "Choose an Image")}
          </DialogTitle>
        </DialogHeader>

        {/* ── Tabs ── */}
        <Tabs
          value={tab}
          onValueChange={(v) => { if (uploadProgress === null) setTab(v as "existing" | "upload"); }}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Tab nav */}
          <div className="shrink-0 px-6 pt-3 pb-0 border-b border-gray-100">
            <FormTabs tabs={[{ value: "existing", label: "Media Library" }, { value: "upload", label: "Upload New" }]} />
          </div>

          {/* ── Library tab ── */}
          <TabsContent value="existing" className="flex-1 min-h-0 m-0 data-[state=active]:flex">
            <div className="flex flex-1 min-h-0 divide-x divide-gray-100">

              {/* Left — grid */}
              <div className="flex flex-col flex-1 min-h-0 min-w-0">
                {/* Filters bar */}
                <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-gray-50">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <Input
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={`Search ${isModel ? "models" : "images"}…`}
                      className="pl-9 h-9 text-sm border-gray-200 bg-gray-50/60 focus:bg-white"
                    />
                    {search && (
                      <button type="button" onClick={() => handleSearchChange("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="size-3.5 text-gray-400" />
                    <select
                      value={usageFilter ?? ""}
                      onChange={(e) => {
                        setUsageFilter(e.target.value || undefined);
                        setPage(1); setAllItems([]); setFilterVersion((v) => v + 1);
                      }}
                      className="h-9 rounded-md border border-gray-200 text-sm px-2.5 bg-gray-50/60 text-gray-700 focus:outline-none focus:ring-1 focus:ring-sidebar-primary/40 min-w-[110px]"
                    >
                      <option value="">All files</option>
                      <option value="used">In use</option>
                      <option value="unused">Unused</option>
                      {(usageTypes ?? []).map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                    {totalCount > 0 ? `${allItems.length} of ${totalCount}` : "0 items"}
                  </span>
                </div>

                {/* Scrollable grid */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-4">
                  {isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : allItems.length === 0 ? (
                    <EmptyState
                      icon={isModel ? Box : ImageIcon}
                      title="No media found"
                      description={`No ${isModel ? "models" : "images"} match your search.`}
                    />
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {allItems.map((item, idx) => {
                        const thumb = item.thumbnail ?? item.url;
                        const active = multiSelect
                          ? multiSelected.some((i) => i.id === item.id)
                          : selected?.id === item.id;
                        return (
                          <button
                            key={`${item.id}-${idx}`}
                            type="button"
                            onClick={() => handleSelectExisting(item)}
                            className={cn(
                              "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-150",
                              active
                                ? "border-sidebar-primary ring-2 ring-sidebar-primary/20"
                                : "border-transparent hover:border-gray-200",
                            )}
                          >
                            {/* Thumbnail */}
                            <div className="absolute inset-0 bg-gray-100">
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

                            {/* Hover overlay */}
                            <div className={cn(
                              "absolute inset-0 transition-opacity duration-150",
                              active ? "bg-sidebar-primary/10" : "bg-transparent group-hover:bg-black/5",
                            )} />

                            {/* Check */}
                            {active && (
                              <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-sidebar-primary shadow-sm">
                                <Check className="size-3 text-white" strokeWidth={3} />
                              </span>
                            )}

                            {/* Model type badge */}
                            {isModel && item.type && (
                              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                                {item.type}
                              </span>
                            )}

                            {/* Name on hover */}
                            <div className={cn(
                              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 pb-2 pt-5 transition-opacity",
                              active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                            )}>
                              <p className="text-[11px] text-white font-medium truncate">{item.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isLoadingMore && (
                    <div className="flex justify-center py-6">
                      <Loader2 className="size-5 animate-spin text-gray-300" />
                    </div>
                  )}
                  <div ref={sentinelRef} className="h-1" />
                </div>
              </div>

              {/* Right — preview + details */}
              <div className="shrink-0 w-64 flex flex-col bg-gray-50/40">
                {/* Preview box */}
                <div className="p-4">
                  <div className="aspect-square w-full rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center relative">
                    {multiSelect ? (
                      <div className="text-center px-4">
                        <ImageIcon className="size-8 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm font-medium text-gray-600">
                          {multiSelected.length > 0 ? `${multiSelected.length} selected` : "Select images"}
                        </p>
                      </div>
                    ) : previewSrc ? (
                      isSvgUrl(previewSrc) ? (
                        <img src={previewSrc} alt={selected!.name} className="w-full h-full object-contain p-2" />
                      ) : isImageUrl(previewSrc) ? (
                        <Image src={previewSrc} alt={selected!.name} fill sizes="256px" className="object-contain p-2" loading="lazy" />
                      ) : isVideoUrl(previewSrc) ? (
                        <video src={previewSrc} preload="metadata" muted playsInline className="w-full h-full object-contain" />
                      ) : (
                        <ModelThumbnail src={previewSrc} lazy={false} />
                      )
                    ) : (
                      <div className="text-center px-4">
                        {isModel ? <Box className="size-8 mx-auto mb-2 text-gray-200" /> : <ImageIcon className="size-8 mx-auto mb-2 text-gray-200" />}
                        <p className="text-xs text-gray-400">Select to preview</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* File details */}
                {selected && !multiSelect && (
                  <div className="px-4 pb-3 space-y-0.5">
                    <p className="text-sm font-medium text-gray-800 truncate">{selected.name || "Untitled"}</p>
                    <p className="text-xs text-gray-400">
                      {selected.category}
                      {selected.type ? <span className="ml-1.5 uppercase font-medium text-gray-500">{selected.type}</span> : null}
                    </p>
                  </div>
                )}

                {/* Alt text */}
                {!multiSelect && (
                  <div className="px-4 pb-4 mt-auto space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">Alt text</Label>
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      disabled={!selected}
                      placeholder="Describe this image…"
                      className="h-9 text-sm border-gray-200 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Upload tab ── */}
          <TabsContent value="upload" className="flex-1 min-h-0 m-0 data-[state=active]:flex">
            <div className="flex flex-1 min-h-0 divide-x divide-gray-100">

              {/* Left — drop zone */}
              <div className="flex-1 flex flex-col p-6 gap-4">
                <Label
                  htmlFor="media-upload-input"
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer flex-1",
                    isDragging
                      ? "border-sidebar-primary bg-sidebar-primary/5"
                      : uploadFile
                        ? "border-gray-200 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50",
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setIsDragging(false);
                    const f = e.dataTransfer.files?.[0]; if (f) handleFilePick(f);
                  }}
                >
                  {(() => {
                    if (!uploadFile || !uploadPreview) return (
                      <>
                        <div className={cn(
                          "flex size-14 items-center justify-center rounded-2xl transition-colors",
                          isDragging ? "bg-sidebar-primary/15" : "bg-gray-100",
                        )}>
                          <UploadCloud className={cn("size-6", isDragging ? "text-sidebar-primary" : "text-gray-400")} />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-medium text-gray-700">
                            {isDragging ? "Drop your file here" : "Click to browse or drag & drop"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {isModel ? "GLB · GLTF · OBJ files" : "PNG · JPG · WEBP · SVG · up to 5 MB"}
                          </p>
                        </div>
                      </>
                    );
                    if (uploadFile.type.startsWith("image/")) {
                      if (uploadFile.type === "image/svg+xml") return (
                        <img src={uploadPreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                      );
                      return (
                        <Image src={uploadPreview} alt="Preview" width={600} height={400}
                          className="max-h-full max-w-full object-contain rounded-lg" unoptimized />
                      );
                    }
                    if (uploadFile.type.startsWith("video/")) return (
                      <video src={uploadPreview} muted controls className="max-h-full max-w-full object-contain rounded-lg" />
                    );
                    const ext = uploadFile.name.split(".").pop()?.toLowerCase();
                    if (["glb", "gltf", "fbx", "obj", "stl", "usdz", "ply"].includes(ext ?? "")) return <ModelThumbnail src={uploadPreview} lazy={false} />;
                    return (
                      <>
                        <UploadCloud className="size-6 text-gray-400" />
                        <p className="text-sm text-gray-600">{uploadFile.name}</p>
                      </>
                    );
                  })()}
                </Label>
                <input
                  id="media-upload-input" type="file" accept={acceptTypes} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFilePick(f); }}
                />

                {uploadFile && (
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-white">
                    <ImageIcon className="size-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{uploadFile.name}</p>
                      <p className="text-xs text-gray-400">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button"
                      onClick={(e) => { e.preventDefault(); setUploadFile(null); setUploadPreview(null); setAltText(""); }}
                      className="text-gray-400 hover:text-gray-700 transition-colors">
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right — preview + alt text */}
              <div className="shrink-0 w-64 flex flex-col bg-gray-50/40 p-4 gap-4">
                <div className="aspect-square w-full rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center relative">
                  {uploadPreview && uploadFile?.type.startsWith("image/") ? (
                    uploadFile.type === "image/svg+xml" ? (
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Image src={uploadPreview} alt="Preview" fill sizes="256px" className="object-contain p-2" unoptimized />
                    )
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="size-8 mx-auto mb-2 text-gray-200" />
                      <p className="text-xs text-gray-400">Preview</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">Alt text</Label>
                  <Input
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    disabled={!uploadFile}
                    placeholder="Describe this image…"
                    className="h-9 text-sm border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Footer ── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
          <span className="text-xs text-gray-400">
            {tab === "existing"
              ? `${allItems.length} of ${totalCount} ${isModel ? "models" : "images"}`
              : uploadFile
                ? `${uploadFile.name} · ${(uploadFile.size / 1024).toFixed(0)} KB`
                : "No file chosen"}
          </span>

          <div className="flex items-center gap-3">
            {uploadProgress !== null && (
              <div className="flex items-center gap-2">
                <div className="w-28 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-sidebar-primary transition-all duration-200 rounded-full" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8">{uploadProgress}%</span>
              </div>
            )}
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm || uploadProgress !== null}
              size="sm"
              className="h-9 px-5 text-sm bg-sidebar-primary hover:bg-sidebar-primary/90 disabled:opacity-40 gap-2"
            >
              {uploadProgress !== null ? (
                <><Loader2 className="size-3.5 animate-spin" /> Uploading…</>
              ) : multiSelect ? (
                tab === "upload" ? "Upload & Add" : `Add${multiSelected.length > 0 ? ` (${multiSelected.length})` : ""}`
              ) : tab === "existing" ? "Select" : "Upload & Select"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
