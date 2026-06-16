"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Box,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MediaService } from "@/api/services/media.service";

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  category: string;
  type?: string;
};

export type MediaPickerMode = "image" | "model";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: MediaPickerMode;
  title?: string;
  defaultCategory?: string;
  onSelect: (item: MediaItem, altText: string, file?: File) => void;
  items?: MediaItem[];
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  mode = "image",
  title,
  defaultCategory,
  onSelect,
  items = [],
}: MediaPickerDialogProps) {
  const isModel = mode === "model";
  const acceptTypes = isModel ? ".glb,.gltf,.obj" : "image/*";

  const [tab, setTab] = useState<"existing" | "upload">("existing");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(defaultCategory || "all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [altText, setAltText] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<MediaItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    if (open) {
      setCategoryFilter(defaultCategory || "all");
    }
  }, [open, defaultCategory]);

  const filtered = localItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectExisting = (item: MediaItem) => {
    setSelected(item);
    setAltText(item.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
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
    setAltText("");
    setUploadFile(null);
    setUploadPreview(null);
  };

  const handleConfirm = async () => {
    if (tab === "existing" && selected) {
      if (altText !== selected.name) {
        try {
          await MediaService.update(selected.id, { alt: altText });
          setLocalItems((prev) =>
            prev.map((i) => (i.id === selected.id ? { ...i, name: altText } : i))
          );
        } catch {
          // alt update failed — still proceed with the local alt text
        }
      }
      onSelect(selected, altText);
    } else if (tab === "upload" && uploadFile) {
      const newItem: MediaItem = {
        id: `upload-${Date.now()}`,
        name: uploadFile.name,
        url: uploadPreview ?? URL.createObjectURL(uploadFile),
        thumbnail: uploadPreview ?? undefined,
        category: "General",
        type: isModel ? uploadFile.name.split(".").pop() : undefined,
      };
      onSelect(newItem, altText, uploadFile);
    }
    reset();
    onOpenChange(false);
  };

  const canConfirm = tab === "existing" ? !!selected : !!uploadFile;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="!max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-3 pb-0">
          <DialogTitle className="text-sm font-semibold text-gray-800">
            {title ?? (isModel ? "Add 3D Model" : "Add Image")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "existing" | "upload")} className="w-full flex flex-col">
          <div className="px-4">
            <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
              <TabsTrigger
                value="existing"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500 px-3 py-1.5 gap-1.5 text-xs"
              >
                {isModel ? <Box className="size-3.5" /> : <ImageIcon className="size-3.5" />}
                Library
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500 px-3 py-1.5 gap-1.5 text-xs"
              >
                <UploadCloud className="size-3.5" />
                Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="existing" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] divide-x divide-gray-200">
              <div className="p-3 max-h-[55vh] overflow-y-auto">
                <div className="space-y-2 mb-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search ${isModel ? "models" : "images"}`}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    {["all", "Images", "Banners", "Videos", "3D Models"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-medium rounded-md transition whitespace-nowrap",
                          categoryFilter === cat
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-500 hover:text-gray-900"
                        )}
                      >
                        {cat === "all" ? "All" : cat === "Images" ? "Single Image" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="py-10 text-center text-xs text-gray-400">
                    No {isModel ? "models" : "images"} found.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {filtered.map((item) => {
                      const thumb = item.thumbnail ?? item.url;
                      const active = selected?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "rounded-md border overflow-hidden transition",
                            active ? "border-[lab(20_23.9_-60.14)] ring-1 ring-[lab(20_23.9_-60.14)]/20" : "border-gray-200"
                          )}
                        >
                          <div className="aspect-[4/3] bg-gray-100 relative group">
                            <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleSelectExisting(item)}
                              className={cn(
                                "absolute inset-0 flex items-center justify-center transition",
                                active
                                  ? "bg-[lab(20_23.9_-60.14)]/10"
                                  : "bg-black/0 group-hover:bg-black/30"
                              )}
                            >
                              {active ? (
                                <span className="size-6 rounded-full bg-[lab(20_23.9_-60.14)] flex items-center justify-center">
                                  <Check className="size-3.5 text-white" />
                                </span>
                              ) : (
                                <span className="text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded bg-black/50">
                                  Select
                                </span>
                              )}
                            </button>
                            {isModel && (
                              <span className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded font-medium uppercase">
                                {item.type}
                              </span>
                            )}
                          </div>
                          <p className="px-1.5 py-1 text-[10px] text-gray-700 truncate">{item.name}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col">
                <div className="aspect-[4/3] w-full rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center mb-3 overflow-hidden">
                  {selected ? (
                    <img
                      src={selected.thumbnail ?? selected.url}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400 px-3">
                      {isModel ? (
                        <Box className="size-6 mx-auto mb-1" />
                      ) : (
                        <ImageIcon className="size-6 mx-auto mb-1" />
                      )}
                      <p className="text-[11px]">Select to preview</p>
                    </div>
                  )}
                </div>

                <Label className="text-[11px] mb-1 text-gray-600">Alt Text</Label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={!selected}
                  placeholder="Describe this asset"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] divide-x divide-gray-200">
              <div className="p-3">
                <label
                  htmlFor="media-upload-input"
                  className="flex flex-col items-center justify-center gap-1.5 h-48 rounded-md border border-dashed border-gray-300 text-gray-400 hover:bg-gray-50 transition cursor-pointer"
                >
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <>
                      <UploadCloud className="size-6" />
                      <span className="text-xs text-gray-600">{uploadFile ? uploadFile.name : "Click to upload"}</span>
                      <span className="text-[10px] text-gray-400">
                        {isModel ? ".glb, .gltf, .obj" : "PNG, JPG, WEBP up to 5MB"}
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="media-upload-input"
                  type="file"
                  accept={acceptTypes}
                  className="hidden"
                  onChange={handleFilePick}
                />
              </div>

              <div className="p-3">
                <Label className="text-[11px] mb-1 text-gray-600">Alt Text</Label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={!uploadFile}
                  placeholder="Describe this asset"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200">
          <p className="text-[11px] text-gray-400">
            {tab === "existing"
              ? `${filtered.length} of ${localItems.length} ${isModel ? "models" : "images"}`
              : "Uploads are saved on confirm"}
          </p>
          <Button onClick={handleConfirm} disabled={!canConfirm} size="sm" className="h-7 text-xs px-3 bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] disabled:opacity-50">
            {tab === "existing" ? "Select" : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
