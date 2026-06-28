"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Box,
  Check,
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
import { useMediaList, useMediaMutations } from "@/api/hooks/use-media-query";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { EmptyState } from "@/components/global_ui/empty-state";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { isModelUrl } from "@/lib/media";

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

  const [listParams, setListParams] = useState<Record<string, unknown>>({ page_size: 10 });
  const { data, isLoading } = useMediaList(listParams);
  const { updateMutation, uploadMutation } = useMediaMutations();

  const [tab, setTab] = useState<"existing" | "upload">("existing");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(defaultCategory || "all");
  const [selected, setSelected] = useState<PickerMediaItem | null>(null);
  const [multiSelected, setMultiSelected] = useState<PickerMediaItem[]>([]);
  const [altText, setAltText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const items = data?.items ?? [];
  const pickerItems = items
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

  useEffect(() => {
    if (open && tab === "existing") {
      setCategoryFilter("all");
      setListParams({ page_size: 10 });
    }
  }, [open, tab]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const group = categoryFilter === "all" ? "" : categoryFilter;
      setListParams({ search: value || undefined, group_title: group || undefined, page_size: 10 });
    }, 300);
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    setSelected(null);
    setListParams({ group_title: cat === "all" ? undefined : cat, page: 1, page_size: 10 });
  };

  const handleSelectExisting = (item: PickerMediaItem) => {
    if (multiSelect) {
      setMultiSelected(prev =>
        prev.some(i => i.id === item.id)
          ? prev.filter(i => i.id !== item.id)
          : [...prev, item]
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
    setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    if (!isModel) {
      setUploadPreview(URL.createObjectURL(file));
    } else {
      setUploadPreview(null);
    }
  };

  const reset = () => {
    setTab("existing");
    setSearch("");
    setCategoryFilter("all");
    setSelected(null);
    setMultiSelected([]);
    setAltText("");
    setUploadFile(null);
    setUploadPreview(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleConfirm = async () => {
    if (multiSelect) {
      onMultiSelect?.(multiSelected);
      reset();
      onOpenChange(false);
      return;
    }
    if (tab === "existing" && selected) {
      if (altText !== selected.name) {
        await updateMutation.mutateAsync({ id: selected.id, data: { alt: altText } });
      }
      onSelect?.(selected, altText);
    } else if (tab === "upload" && uploadFile) {
      const media = await uploadMutation.mutateAsync({ file: uploadFile, metadata: { alt: altText } });
      if (!media) {
        toast.error("Failed to upload media");
        return;
      }
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
    reset();
    onOpenChange(false);
  };

  const canConfirm = multiSelect ? multiSelected.length > 0 : (tab === "existing" ? !!selected : !!uploadFile);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="!max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-gray-200">
          <DialogTitle className="text-sm font-semibold text-gray-900">
            {title ?? (isModel ? "Add 3D Model" : "Add Image")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "existing" | "upload")} className="w-full flex flex-col">
          <div className="px-4 pt-3">
            <FormTabs tabs={[{ value: "existing", label: "Library" }, { value: "upload", label: "Upload" }]} />
          </div>

          <TabsContent value="existing" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] divide-x divide-gray-200">
              <div className="p-3 max-h-[55vh] overflow-y-auto">
                <div className="space-y-2 mb-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                    <Input
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={`Search ${isModel ? "models" : "images"}`}
                      className="pl-8 h-8 text-xs rounded-lg border-gray-200"
                    />
                  </div>
                  <SegmentedToggle
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    options={[
                      { value: "all", label: "All" },
                      { value: "Images", label: "Single Image" },
                      { value: "Banners", label: "Banners" },
                      { value: "Videos", label: "Videos" },
                      { value: "3D Models", label: "3D Models" },
                    ]}
                  />
                </div>

                {isLoading ? (
                  <div className="py-10 text-center text-xs text-gray-400">Loading…</div>
                ) : pickerItems.length === 0 ? (
                  <EmptyState
                    icon={isModel ? Box : ImageIcon}
                    title="No media found"
                    description={`No ${isModel ? "models" : "images"} match your search.`}
                  />
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {pickerItems.map((item) => {
                      const thumb = item.thumbnail ?? item.url;
                      const active = multiSelect
                        ? multiSelected.some(i => i.id === item.id)
                        : selected?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectExisting(item)}
                          className={cn(
                            "group relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50 text-left transition-colors",
                            active
                              ? "border-sidebar-primary"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          {isModelUrl(thumb) ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Box className="size-6 text-gray-400" />
                            </div>
                          ) : (
                            <Image
                              src={thumb}
                              alt={item.name}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                          )}

                          {/* selection overlay */}
                          <div
                            className={cn(
                              "absolute inset-0 transition-colors",
                              active ? "bg-sidebar-primary/15" : "bg-black/0 group-hover:bg-black/10"
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
                    isModelUrl(selected.thumbnail ?? selected.url) ? (
                      <div className="w-full h-full flex items-center justify-center bg-white">
                        <Box className="size-10 text-gray-400" />
                      </div>
                    ) : (
                      <Image
                        src={selected.thumbnail ?? selected.url}
                        alt={selected.name}
                        fill
                        sizes="260px"
                        className="object-cover"
                      />
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
                  {uploadPreview ? (
                    <Image src={uploadPreview} alt="Preview" width={400} height={300} className="max-h-full max-w-full object-contain rounded-md" />
                  ) : (
                    <>
                      <UploadCloud className="size-6" />
                      <span className="text-xs text-gray-600">{uploadFile ? uploadFile.name : "Click to upload"}</span>
                      <span className="text-[10px] text-gray-400">
                        {isModel ? ".glb, .gltf, .obj" : "PNG, JPG, WEBP up to 5MB"}
                      </span>
                    </>
                  )}
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
              ? `${pickerItems.length} ${isModel ? "models" : "images"}`
              : "Uploads are saved on confirm"}
          </p>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            size="sm"
            className="h-8 text-xs px-4 rounded-lg bg-sidebar-primary hover:bg-sidebar-primary/90 disabled:opacity-50"
          >
            {multiSelect
              ? `Select (${multiSelected.length})`
              : tab === "existing" ? "Select" : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}