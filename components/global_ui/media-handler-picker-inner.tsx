"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Box,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaMutations, useUsageTypes } from "@/api/hooks/use-media-query";
import { MediaService } from "@/api/services/media.service";
import { EmptyState } from "@/components/global_ui/empty-state";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { isImageUrl, isVideoUrl, isModelUrl } from "@/lib/media";

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
    return () => {
      if (el) el.remove();
    };
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
  open,
  onOpenChange,
  mode = "image",
  title,
  defaultCategory,
  onSelect,
  multiSelect = false,
  onMultiSelect,
}: MediaPickerDialogProps) {
  const isModel = mode === "model";
  const acceptTypes = isModel ? ".glb,.gltf,.obj" : "image/*";
  const { data: usageTypes } = useUsageTypes();
  const { updateMutation, uploadMutation, duplicateMutation } = useMediaMutations();

  const [tab, setTab] = useState<"existing" | "upload">("existing");
  const [search, setSearch] = useState("");
  const [usageFilter, setUsageFilter] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<PickerMediaItem | null>(null);
  const [multiSelected, setMultiSelected] = useState<PickerMediaItem[]>([]);
  const [altText, setAltText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
    if (isAppend) setIsLoadingMore(true);
    else setIsLoading(true);

    const params: Record<string, unknown> = { page, page_size: 10 };
    if (search) params.search = search;
    if (defaultCategory) params.group_title = defaultCategory;
    if (usageFilter) params.usage_filter = usageFilter;

    MediaService.list(params)
      .then((res) => {
        if (cancelled) return;
        const mapped = (res.results ?? [])
          .filter((apiItem) => {
            if (isModel) return true;
            return !isModelUrl(apiItem.url);
          })
          .map((apiItem) => ({
            id: apiItem.id,
            name: apiItem.alt || apiItem.title || "",
            url: apiItem.url,
            thumbnail: apiItem.url,
            category: apiItem.group_title || "General",
            type: apiItem.url.split(".").pop()?.toLowerCase(),
          }));
        setAllItems((prev) => (isAppend ? [...prev, ...mapped] : mapped));
        setTotalCount(res.count ?? 0);
        hasMoreRef.current = res.next !== null;
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load media");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingMore(false);
          fetchingRef.current = false;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, filterVersion]);

  const hasMore = allItems.length < totalCount;

  useEffect(() => {
    const el = sentinelRef.current;
    const root = scrollContainerRef.current;
    if (!el || !root || !hasMoreRef.current || fetchingRef.current) return;

    const onFirstScroll = () => {
      if (hasScrolledRef.current) return;
      hasScrolledRef.current = true;
      observer.unobserve(el);
      observer.observe(el);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingRef.current && hasMoreRef.current && hasScrolledRef.current) {
          fetchingRef.current = true;
          setPage((p) => p + 1);
        }
      },
      { root, threshold: 0.1 },
    );

    root.addEventListener("scroll", onFirstScroll, { passive: true });
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onFirstScroll);
    };
  }, [hasMore]);

  useEffect(() => {
    if (open && tab === "existing") {
      setUsageFilter(undefined);
    }
  }, [open, tab]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setAllItems([]);
      setFilterVersion((v) => v + 1);
    }, 300);
  };

  const handleSelectExisting = (item: PickerMediaItem) => {
    if (multiSelect) {
      setMultiSelected((prev) =>
        prev.some((i) => i.id === item.id)
          ? prev.filter((i) => i.id !== item.id)
          : [...prev, item],
      );
    } else {
      setSelected(item);
      setAltText(item.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const reset = () => {
    setTab("existing");
    setSearch("");
    setUsageFilter(undefined);
    setSelected(null);
    setMultiSelected([]);
    setAltText("");
    setUploadFile(null);
    setUploadPreview(null);
    setPage(1);
    setAllItems([]);
    setFilterVersion((v) => v + 1);
    setUploadProgress(null);
    hasScrolledRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleUpload = async (file: File, alt: string) => {
    setUploadProgress(0);
    try {
      const media = await uploadMutation.mutateAsync({
        file,
        metadata: { alt },
        onProgress: setUploadProgress,
      });
      return media;
    } catch {
      setUploadProgress(null);
      throw new Error("Upload failed");
    }
  };

  const handleConfirm = async () => {
    if (multiSelect) {
      if (tab === "upload" && uploadFile) {
        const media = await handleUpload(uploadFile, altText);
        if (media) {
          const item: PickerMediaItem = {
            id: media.id,
            name: media.alt || media.title || uploadFile.name,
            url: media.url,
            thumbnail: media.url,
            category: media.group_title || "General",
            type: isModel ? uploadFile.name.split(".").pop() : undefined,
          };
          onMultiSelect?.([...multiSelected, item]);
        }
      } else {
        onMultiSelect?.(multiSelected);
      }
      reset();
      onOpenChange(false);
      return;
    }
    if (tab === "existing" && selected) {
      setDuplicating(true);
      try {
        const copy = await duplicateMutation.mutateAsync(selected.id);
        onSelect?.(
          {
            id: copy.id,
            name: copy.alt || copy.title || selected.name,
            url: copy.url,
            thumbnail: copy.url,
            category: copy.group_title || selected.category,
            type: selected.type,
          },
          altText || selected.name,
        );
      } finally {
        setDuplicating(false);
      }
    } else if (tab === "upload" && uploadFile) {
      const media = await handleUpload(uploadFile, altText);
      if (media) {
        const persisted: PickerMediaItem = {
          id: media.id,
          name: media.alt || media.title || uploadFile.name,
          url: media.url,
          thumbnail: media.url,
          category: media.group_title || "General",
          type: isModel ? uploadFile.name.split(".").pop() : undefined,
        };
        onSelect?.(persisted, altText);
      }
    }
    reset();
    onOpenChange(false);
  };

  const canConfirm = multiSelect
    ? tab === "upload"
      ? !!uploadFile
      : multiSelected.length > 0
    : tab === "existing"
      ? !!selected
      : !!uploadFile;

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
        className="!max-w-4xl p-0 gap-0 overflow-hidden"
        showCloseButton={uploadProgress === null}
        onInteractOutside={(e: Event) => { if (uploadProgress !== null) e.preventDefault(); }}
        onEscapeKeyDown={(e: KeyboardEvent) => { if (uploadProgress !== null) e.preventDefault(); }}
      >
        <DialogHeader className="px-4 py-3 border-b border-gray-200">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            {title ?? (isModel ? "Add 3D Model" : "Add Image")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { if (uploadProgress === null) setTab(v as "existing" | "upload"); }} className="w-full flex flex-col">
          <div className="px-4 pt-3">
            <FormTabs tabs={[{ value: "existing", label: "Library" }, { value: "upload", label: "Upload" }]} />
          </div>

          <TabsContent value="existing" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] divide-x divide-gray-200">
              <div ref={scrollContainerRef} className="p-3 h-[55vh] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                    <Input
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={`Search ${isModel ? "models" : "images"}`}
                      className="pl-8 h-8 text-xs rounded-lg border-gray-200"
                    />
                  </div>
                  <select
                    value={usageFilter ?? ""}
                    onChange={(e) => { setUsageFilter(e.target.value || undefined); setPage(1); setAllItems([]); setFilterVersion((v) => v + 1); }}
                    className="h-8 rounded-lg border border-gray-200 text-xs px-2 bg-white text-gray-600 max-w-[140px] shrink-0"
                  >
                    <option value="">All</option>
                    <option value="used">Used</option>
                    <option value="unused">Unused</option>
                    {(usageTypes ?? []).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="aspect-square w-full rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : allItems.length === 0 ? (
                  <EmptyState
                    icon={isModel ? Box : ImageIcon}
                    title="No media found"
                    description={`No ${isModel ? "models" : "images"} match your search.`}
                  />
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                            "group relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50 text-left transition-colors",
                            active
                              ? "border-sidebar-primary"
                              : "border-gray-200 hover:border-gray-300",
                          )}
                        >
                          {isImageUrl(thumb) ? (
                            <Image
                              src={thumb}
                              alt={item.name}
                              fill
                              sizes="120px"
                              className="object-cover"
                              loading="lazy"
                            />
                          ) : isVideoUrl(thumb) ? (
                            <video
                              src={thumb}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ModelThumbnail src={thumb} />
                          )}

                          <div
                            className={cn(
                              "absolute inset-0 transition-colors",
                              active ? "bg-sidebar-primary/15" : "bg-black/0 group-hover:bg-black/10",
                            )}
                          />

                          {active && (
                            <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-sidebar-primary shadow-sm">
                              <Check className="size-3 text-white" strokeWidth={3} />
                            </span>
                          )}

                          {isModel && (
                            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                              {item.type}
                            </span>
                          )}

                          {item.name && (
                            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-3 text-[10px] font-medium text-white">
                              {item.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-4 animate-spin text-gray-400" />
                  </div>
                )}

                <div ref={sentinelRef} className="h-4" />
              </div>

              <div className="p-3 flex flex-col bg-gray-50/60">
                <div className="aspect-square w-full rounded-lg border border-gray-200 bg-white flex items-center justify-center mb-3 overflow-hidden relative">
                  {multiSelect ? (
                    <div className="text-center text-gray-400 px-3">
                      <ImageIcon className="size-6 mx-auto mb-1.5" />
                      <p className="text-[11px] font-medium text-gray-500">
                        {multiSelected.length > 0
                          ? `${multiSelected.length} selected`
                          : "Select images"}
                      </p>
                    </div>
                  ) : selected ? (
                    isImageUrl(selected.thumbnail ?? selected.url) ? (
                      <Image
                        src={selected.thumbnail ?? selected.url}
                        alt={selected.name}
                        fill
                        sizes="260px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : isVideoUrl(selected.thumbnail ?? selected.url) ? (
                      <video
                        src={selected.thumbnail ?? selected.url}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ModelThumbnail src={selected.thumbnail ?? selected.url} lazy={false} />
                    )
                  ) : (
                    <div className="text-center text-gray-400 px-3">
                      {isModel ? (
                        <Box className="size-6 mx-auto mb-1.5" />
                      ) : (
                        <ImageIcon className="size-6 mx-auto mb-1.5" />
                      )}
                      <p className="text-[11px]">Select to preview</p>
                    </div>
                  )}
                </div>

                {!multiSelect && (
                  <>
                    <Label className="text-[11px] mb-1 text-gray-600">Alt Text</Label>
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      disabled={!selected}
                      placeholder="Describe this asset"
                      className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                    />
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] divide-x divide-gray-200">
              <div className="p-3">
                <Label
                  htmlFor="media-upload-input"
                  className="flex flex-col items-center justify-center gap-1.5 h-48 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                >
                  {(() => {
                    if (!uploadFile || !uploadPreview) {
                      return (
                        <>
                          <UploadCloud className="size-6" />
                          <span className="text-xs text-gray-600">{uploadFile ? uploadFile.name : "Click to upload"}</span>
                          <span className="text-[10px] text-gray-400">
                            {isModel ? ".glb, .gltf, .obj" : "PNG, JPG, WEBP up to 5MB"}
                          </span>
                        </>
                      );
                    }
                    const ext = uploadFile.name.split(".").pop()?.toLowerCase();
                    if (uploadFile.type.startsWith("image/")) {
                      return <Image src={uploadPreview} alt="Preview" width={400} height={300} className="max-h-full max-w-full object-contain rounded-md" unoptimized />;
                    }
                    if (uploadFile.type.startsWith("video/")) {
                      return <video src={uploadPreview} muted controls className="max-h-full max-w-full object-contain rounded-md" />;
                    }
                    if (["glb","gltf","fbx","obj","stl","usdz","ply"].includes(ext ?? "")) {
                      return <ModelThumbnail src={uploadPreview} lazy={false} />;
                    }
                    return (
                      <>
                        <UploadCloud className="size-6" />
                        <span className="text-xs text-gray-600">{uploadFile.name}</span>
                      </>
                    );
                  })()}
                </Label>
                <input
                  id="media-upload-input"
                  type="file"
                  accept={acceptTypes}
                  className="hidden"
                  onChange={handleFilePick}
                />
              </div>

              <div className="p-3 bg-gray-50/60">
                <Label className="text-[11px] mb-1 text-gray-600">Alt Text</Label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={!uploadFile}
                  placeholder="Describe this asset"
                  className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200">
          <p className="text-[11px] text-gray-400">
            {tab === "existing"
              ? `${allItems.length} of ${totalCount} ${isModel ? "models" : "images"}`
              : "Uploads are saved on confirm"}
          </p>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || duplicating || uploadProgress !== null}
            size="sm"
            className="h-8 text-xs px-4 rounded-lg bg-sidebar-primary hover:bg-sidebar-primary/90 disabled:opacity-50"
          >
            {uploadProgress !== null
              ? `Uploading ${uploadProgress}%`
              : duplicating
                ? "Duplicating..."
                : multiSelect
                  ? tab === "upload" ? "Upload & Select" : `Select (${multiSelected.length})`
                  : tab === "existing" ? "Select" : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
