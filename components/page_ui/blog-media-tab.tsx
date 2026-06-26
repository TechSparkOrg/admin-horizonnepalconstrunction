"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Eye, Pencil, Trash2, Box, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { SegmentedToggle } from "@/components/global_ui/segmented-toggle";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import { ModelViewer } from "@/components/global_ui/ModelViewer";
import { ImagePreviewDialog } from "@/components/global_ui/image-preview-dialog";
import { isVideoUrl, detectPlatform } from "@/lib/media";
import { useBlogUiStore } from "@/api/zustand/use-blog-store";

interface BlogMediaTabProps {
  model3dBlock: string;
  videoBlockUrl: string;
  videoEmbedUrl: string;
  bannerImages: { id: string; url: string; name: string; isPrimary?: boolean }[];
  reelBlocks: { url: string }[];
  onBannerImagesChange: (images: { id: string; url: string; name: string; isPrimary?: boolean }[]) => void;
  onReelBlocksChange: (blocks: { url: string }[]) => void;
  onChange: (key: string, value: string | boolean) => void;
}

export function BlogMediaTab({
  model3dBlock,
  videoBlockUrl,
  videoEmbedUrl,
  bannerImages,
  reelBlocks,
  onBannerImagesChange,
  onReelBlocksChange,
  onChange,
}: BlogMediaTabProps) {
  const uploadMedia = useBlogUiStore((s) => s.uploadMedia);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<"banner" | "model3d" | "video">("banner");
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerPage, setBannerPage] = useState(1);
  const [videoMode, setVideoMode] = useState<"library" | "embed">("library");
  const [reelInput, setReelInput] = useState("");
  const [modelViewerPreview, setModelViewerPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const BANNER_PER_PAGE = 5;
  const totalBannerPages = Math.ceil(bannerImages.length / BANNER_PER_PAGE);
  const paginatedBanners = bannerImages.slice(
    (bannerPage - 1) * BANNER_PER_PAGE,
    bannerPage * BANNER_PER_PAGE
  );

  const handleBannerSelect = async (item: PickerMediaItem, altText: string, file?: File) => {
    let newItem: PickerMediaItem;
    if (file) {
      const uploaded = await uploadMedia(file, altText);
      if (!uploaded) return;
      newItem = {
        id: uploaded.id,
        name: uploaded.alt || file.name,
        url: uploaded.url,
        thumbnail: uploaded.url,
        category: uploaded.group_title || "General",
      };
    } else {
      newItem = item;
    }

    if (editingBannerId) {
      onBannerImagesChange(
        bannerImages.map((img) =>
          img.id === editingBannerId
            ? { ...img, url: newItem.url, name: altText || newItem.name }
            : img
        )
      );
      setEditingBannerId(null);
    } else {
      const isFirst = bannerImages.length === 0;
      onBannerImagesChange([
        ...bannerImages,
        { ...newItem, name: altText || newItem.name, isPrimary: isFirst || undefined },
      ]);
    }
  };

  const togglePrimary = (id: string) => {
    onBannerImagesChange(
      bannerImages.map((img) => ({
        ...img,
        isPrimary: img.id === id ? true : undefined,
      }))
    );
  };

  const removeBannerImage = (id: string) => {
    const remaining = bannerImages.filter((img) => img.id !== id);
    const needsPromotion = remaining.length > 0 && !remaining.some((img) => img.isPrimary);
    onBannerImagesChange(
      needsPromotion
        ? remaining.map((img, idx) => idx === 0 ? { ...img, isPrimary: true } : img)
        : remaining
    );
  };

  const handleMediaSelect = async (item: PickerMediaItem, altText: string, file?: File) => {
    if (item.url.startsWith("blob:")) return;
    if (mediaPickerMode === "model3d") {
      onChange("model3dBlock", item.url);
    } else if (mediaPickerMode === "video") {
      onChange("videoBlockUrl", item.url);
    } else {
      await handleBannerSelect(item, altText, file);
    }
  };

  const openMediaPicker = (mode: "model3d" | "video") => {
    setMediaPickerMode(mode);
    setEditingBannerId(null);
    setMediaPickerOpen(true);
  };

  const openBannerPicker = (bannerId?: string) => {
    setMediaPickerMode("banner");
    setEditingBannerId(bannerId ?? null);
    setMediaPickerOpen(true);
  };

  const addReel = () => {
    const url = reelInput.trim();
    if (!url) return;
    onReelBlocksChange([...reelBlocks, { url }]);
    setReelInput("");
  };

  const removeReel = (index: number) => {
    onReelBlocksChange(reelBlocks.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">Banner Images</p>
          <Button type="button" variant="outline" size="sm" onClick={() => openBannerPicker()}>
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
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="w-10" />
                  <TableHead className="text-gray-900 font-semibold">Image</TableHead>
                  <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                  <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBanners.map((img) => (
                  <TableRow key={img.id} className="border-gray-200 hover:bg-gray-50">
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
                      <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative">
                        <Image src={img.url} alt={img.name} fill className="object-cover" />
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
                        <Button variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => setPreviewUrl(img.url)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-sidebar-primary border-sidebar-primary/20 hover:bg-sidebar-primary/5" onClick={() => openBannerPicker(img.id)}>
                          <Pencil className="w-3.5 h-3.5" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeBannerImage(img.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalBannerPages > 1 && (
              <div className="mt-3">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setBannerPage((p) => Math.max(1, p - 1))}
                        className={bannerPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalBannerPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink isActive={page === bannerPage} onClick={() => setBannerPage(page)} className="cursor-pointer">{page}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setBannerPage((p) => Math.min(totalBannerPages, p + 1))}
                        className={bannerPage === totalBannerPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">3D Model</p>
          <Button type="button" variant="outline" size="sm" onClick={() => openMediaPicker("model3d")}>
            <Box className="size-4" />
            Select Model
          </Button>
        </div>
        {model3dBlock ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="size-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
              <ModelViewer src={model3dBlock} autoRotate={false} cameraControls={false} className="w-full h-full" />
            </div>
            <span className="text-sm text-gray-700 truncate flex-1">{model3dBlock.split("/").pop()}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); setModelViewerPreview(model3dBlock); }}>
                <Eye className="size-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => onChange("model3dBlock", "")}>
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
            <Box className="size-6" />
            <span className="text-sm">No 3D model selected</span>
          </div>
        )}
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">Video</p>
          <SegmentedToggle<"library" | "embed">
            value={videoMode}
            onChange={(v) => setVideoMode(v)}
            options={[
              { value: "library", label: "Library" },
              { value: "embed", label: "Embed" },
            ]}
          />
        </div>
        {videoMode === "library" ? (
          videoBlockUrl ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="size-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                {isVideoUrl(videoBlockUrl) ? (
                  <video src={videoBlockUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <span className="text-lg">📹</span>
                )}
              </div>
              <span className="text-sm text-gray-700 truncate flex-1">{videoBlockUrl.split("/").pop()}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => setVideoPreview(videoBlockUrl)}>
                  <Eye className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => onChange("videoBlockUrl", "")}>
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
              <span className="text-lg">📹</span>
              <span className="text-sm">No video selected</span>
              <Button type="button" variant="outline" size="sm" onClick={() => openMediaPicker("video")}>Select Video</Button>
            </div>
          )
        ) : (
          <div className="space-y-2">
            <Input
              value={videoEmbedUrl}
              onChange={(e) => onChange("videoEmbedUrl", e.target.value)}
              placeholder="Paste video URL (YouTube, Vimeo, Dailymotion, etc.)"
              className="text-xs"
            />
            {videoEmbedUrl && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${detectPlatform(videoEmbedUrl).color}`}>
                  {detectPlatform(videoEmbedUrl).icon} {detectPlatform(videoEmbedUrl).name}
                </span>
                <a href={videoEmbedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-sidebar-primary underline truncate flex-1 hover:text-sidebar-primary/90">{videoEmbedUrl}</a>
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 shrink-0" onClick={() => onChange("videoEmbedUrl", "")}>
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-xl">
        <p className="text-sm font-semibold text-gray-900 mb-4">Reels</p>
        <div className="flex items-center gap-2 mb-3">
          <Input
            value={reelInput}
            onChange={(e) => setReelInput(e.target.value)}
            placeholder="Paste Instagram / TikTok / Facebook reel URL"
            className="text-xs"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addReel(); } }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addReel} disabled={!reelInput.trim()} className="shrink-0">Add</Button>
        </div>
        {reelBlocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
            <span className="text-lg">📱</span>
            <span className="text-sm">No reels added yet</span>
          </div>
        ) : (
          <div className="space-y-2">
            {reelBlocks.map((block, i) => {
              const platform = detectPlatform(block.url);
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${platform.color}`}>
                    {platform.icon} {platform.name}
                  </span>
                  <span className="text-sm text-gray-700 truncate flex-1">{block.url}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="outline" size="sm" className="text-gray-500 border-gray-200 hover:bg-gray-100" onClick={() => window.open(block.url, "_blank")}>
                      <Eye className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => removeReel(i)}>
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mediaPickerOpen && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(o) => { setMediaPickerOpen(o); if (!o) setEditingBannerId(null); }}
          mode={mediaPickerMode === "model3d" ? "model" : "image"}
          title={
            mediaPickerMode === "model3d" ? "Select 3D Model"
            : mediaPickerMode === "video" ? "Select Video"
            : editingBannerId ? "Update Banner Image"
            : "Select Banner Image"
          }
          defaultCategory={mediaPickerMode === "model3d" ? "3D Models" : mediaPickerMode === "video" ? "Videos" : undefined}
          onSelect={handleMediaSelect}
        />
      )}

      {modelViewerPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModelViewerPreview(null)}>
          <div className="relative w-[80vw] h-[80vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <ModelViewer src={modelViewerPreview} className="w-full h-full" ar arModes="webxr scene-viewer quick-look" />
            <button type="button" onClick={() => setModelViewerPreview(null)} className="absolute top-3 right-3 size-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setVideoPreview(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <video src={videoPreview} controls autoPlay className="max-w-[90vw] max-h-[90vh] rounded-lg" />
            <button type="button" onClick={() => setVideoPreview(null)} className="absolute -top-3 -right-3 size-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {previewUrl && <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}
