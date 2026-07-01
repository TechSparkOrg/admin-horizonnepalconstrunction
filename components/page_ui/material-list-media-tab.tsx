"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Eye, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import { ImagePreviewDialog } from "@/components/global_ui/image-preview-dialog";
import { MediaService } from "@/api/services/media.service";
import type { BannerImage } from "@/api/types/material-list.types";

interface Props {
  bannerImages: BannerImage[];
  videoUrl: string;
  onBannerImagesChange: (images: BannerImage[]) => void;
  onChange: (key: string, value: string | boolean) => void;
}

export function MaterialListMediaTab({
  bannerImages,
  videoUrl,
  onBannerImagesChange,
  onChange,
}: Props) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bannerPage, setBannerPage] = useState(1);

  const BANNER_PER_PAGE = 5;
  const totalBannerPages = Math.ceil(bannerImages.length / BANNER_PER_PAGE);
  const paginatedBanners = bannerImages.slice(
    (bannerPage - 1) * BANNER_PER_PAGE,
    bannerPage * BANNER_PER_PAGE
  );

  const handleBannerSelect = async (item: PickerMediaItem, altText: string, file?: File) => {
    let newItem: PickerMediaItem;
    if (file) {
      let uploaded;
      try {
        uploaded = await MediaService.uploadImage(file, { alt: altText || "" });
        toast.success("Image uploaded");
      } catch {
        toast.error("Failed to upload image");
        return;
      }
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

  const openBannerPicker = (bannerId?: string) => {
    setEditingBannerId(bannerId ?? null);
    setMediaPickerOpen(true);
  };

  return (
    <div className="space-y-4">
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
                      <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative">
                        <Image src={img.url} alt={img.name} fill className="object-cover" sizes="40px" />
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
        <p className="text-sm font-semibold text-gray-900 mb-4">Video</p>
        <div className="space-y-1.5">
          <Label>Video URL</Label>
          <Input
            value={videoUrl}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            placeholder="Paste video URL (YouTube, Vimeo, etc.)"
            className="text-xs"
          />
          <p className="text-xs text-gray-400">External video URL for this material.</p>
        </div>
        {videoUrl && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-700 truncate flex-1">{videoUrl}</span>
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 shrink-0" onClick={() => onChange("videoUrl", "")}>
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
        )}
      </div>

      {mediaPickerOpen && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={(o) => { setMediaPickerOpen(o); if (!o) setEditingBannerId(null); }}
          mode="image"
          title={editingBannerId ? "Update Banner Image" : "Select Banner Image"}
          onSelect={handleBannerSelect}
        />
      )}

      {previewUrl && <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}
