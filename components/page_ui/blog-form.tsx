"use client";

import { ArrowLeft, Loader2, ImagePlus, Eye, Pencil, Trash2, Upload, X, Box } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { MediaPickerDialog } from "@/components/global_ui/MediahanlderPicker";
import type { MediaItem } from "@/components/global_ui/MediahanlderPicker";
import { MediaService } from "@/api/services/media.service";
import { CategoryAdmin } from "@/api/services/category.service";
import type { Category } from "@/api/types/category.types";
import { isVideoUrl } from "@/lib/media";
import { ModelViewer } from "@/components/global_ui/ModelViewer";
import { toast } from "sonner";

function detectPlatform(url: string): { name: string; color: string; icon: string } {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    return { name: "YouTube", color: "bg-red-100 text-red-700", icon: "▶️" };
  }
  if (u.includes("vimeo.com")) {
    return { name: "Vimeo", color: "bg-blue-100 text-blue-700", icon: "🎬" };
  }
  if (u.includes("dailymotion.com") || u.includes("dai.ly")) {
    return { name: "Dailymotion", color: "bg-gray-100 text-gray-700", icon: "▶️" };
  }
  if (u.includes("facebook.com") || u.includes("fb.watch")) {
    return { name: "Facebook", color: "bg-blue-100 text-blue-700", icon: "📱" };
  }
  if (u.includes("instagram.com")) {
    return { name: "Instagram", color: "bg-pink-100 text-pink-700", icon: "📸" };
  }
  if (u.includes("tiktok.com")) {
    return { name: "TikTok", color: "bg-gray-100 text-gray-700", icon: "🎵" };
  }
  return { name: "Video", color: "bg-gray-100 text-gray-600", icon: "▶️" };
}

interface TeamMember {
  id: string;
  name: string;
  image?: string;
}

interface Project {
  id: string;
  title: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
  isPublished: boolean;
  publishDate: string;
  projectId: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
  categoryId: string;
  model3dBlock: string;
  videoBlockUrl: string;
  videoEmbedUrl: string;
}

interface Props {
  form: BlogFormData;
  editingSlug: string | null;
  saving: boolean;
  projects?: Project[];
  teamMembers?: TeamMember[];
  bannerImages: { id: string; url: string; name: string }[];
  onBannerImagesChange: (images: { id: string; url: string; name: string }[]) => void;
  reelBlocks: { url: string }[];
  onReelBlocksChange: (blocks: { url: string }[]) => void;
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

export function BlogForm({
  form,
  editingSlug,
  saving,
  projects = [],
  teamMembers = [],
  bannerImages,
  onBannerImagesChange,
  reelBlocks,
  onReelBlocksChange,
  onChange,
  onSave,
  onBack,
}: Props) {
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(form.authorImage || null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<"banner" | "model3d" | "video">("banner");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerPage, setBannerPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    MediaService.list()
      .then((res) => {
        const items: MediaItem[] = (res.results ?? []).map((apiItem) => ({
          id: apiItem.id,
          name: apiItem.alt || apiItem.url.split("/").pop() || "Untitled",
          url: apiItem.url,
          thumbnail: apiItem.url,
          category: apiItem.group_title || "General",
        }));
        setMediaItems(items);
      })
      .catch(() => toast.error("Failed to load media"));
  }, []);

  useEffect(() => {
    CategoryAdmin.listBlog()
      .then((res) => setCategories(res.results ?? []))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleBannerSelect = async (item: MediaItem, altText: string, file?: File) => {
    let newItem: MediaItem;
    if (file) {
      try {
        const uploaded = await MediaService.uploadImage(file, { alt: altText });
        newItem = {
          id: uploaded.id,
          name: uploaded.alt || file.name,
          url: uploaded.url,
          thumbnail: uploaded.url,
          category: uploaded.group_title || "General",
        };
        toast.success("Image uploaded");
      } catch {
        toast.error("Failed to upload image");
        return;
      }
    } else {
      newItem = item;
    }

    if (editingBannerId) {
      onBannerImagesChange(
        bannerImages.map((img) =>
          img.id === editingBannerId
            ? { ...img, name: altText || img.name }
            : img
        )
      );
      setEditingBannerId(null);
    } else {
      onBannerImagesChange([
        ...bannerImages,
        { ...newItem, name: altText || newItem.name },
      ]);
      setMediaItems((prev) => [...prev, { ...newItem, name: altText || newItem.name }]);
    }
  };

  const removeBannerImage = (id: string) => {
    onBannerImagesChange(bannerImages.filter((img) => img.id !== id));
  };

  const handleMediaSelect = async (item: MediaItem, altText: string, file?: File) => {
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

  const handleImagePick = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: string | null) => void,
    key: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(key, url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Blogs</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editingSlug ? form.title || "Edit Blog" : "New Blog"}
            </h1>
          </div>
        </div>
        <Button onClick={onSave} disabled={!form.title.trim() || saving} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : editingSlug ? "Update" : "Publish"}
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="content" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5">
              Content
            </TabsTrigger>
            <TabsTrigger value="media" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5">
              Media
            </TabsTrigger>
            <TabsTrigger value="seo" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5">
              SEO
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium [&_svg]:size-3.5">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="content" className="space-y-5 mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Blog title"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <div className="flex rounded-md border border-gray-200 overflow-hidden">
                    <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
                      /
                    </span>
                    <Input
                      value={form.slug}
                      onChange={(e) => onChange("slug", e.target.value)}
                      placeholder="blog-slug"
                      className="border-0 rounded-none font-mono focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => onChange("categoryId", v)}
                >
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Body</Label>
                <RichEditor
                  value={form.content}
                  onChange={(html) => onChange("content", html)}
                  minHeight={380}
                />
              </div>
            </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-4 space-y-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Banner Images</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openBannerPicker()}
                >
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
                        <TableHead className="text-gray-900 font-semibold">Image</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Name</TableHead>
                        <TableHead className="text-gray-900 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBanners.map((img) => (
                        <TableRow key={img.id} className="border-gray-200 hover:bg-gray-50">
                          <TableCell>
                            <div className="size-10 rounded-md overflow-hidden bg-gray-100 relative">
                              <Image src={img.url} alt={img.name} fill className="object-cover" />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-900 truncate max-w-[280px]">
                            {img.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-500 border-gray-200 hover:bg-gray-100"
                                onClick={() => window.open(img.url, "_blank")}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20 hover:bg-[lab(20_23.9_-60.14)]/5"
                                onClick={() => openBannerPicker(img.id)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => removeBannerImage(img.id)}
                              >
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
                              <PaginationLink
                                isActive={page === bannerPage}
                                onClick={() => setBannerPage(page)}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
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
            </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">3D Model</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openMediaPicker("model3d")}
                >
                  <Box className="size-4" />
                  Select Model
                </Button>
              </div>
              {form.model3dBlock ? (
                <div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="size-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                      <ModelViewer src={form.model3dBlock} className="w-full h-full" />
                    </div>
                    <span className="text-sm text-gray-700 truncate flex-1">{form.model3dBlock.split("/").pop()}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-500 border-gray-200 hover:bg-gray-100"
                        onClick={(e) => { e.stopPropagation(); setModelViewerPreview(form.model3dBlock); }}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => onChange("model3dBlock", "")}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <Box className="size-6" />
                  <span className="text-sm">No 3D model selected</span>
                </div>
              )}
            </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Video</p>
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                  <button
                    type="button"
                    onClick={() => setVideoMode("library")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      videoMode === "library"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoMode("embed")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      videoMode === "embed"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Embed
                  </button>
                </div>
              </div>
              {videoMode === "library" ? (
                form.videoBlockUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="size-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                      {isVideoUrl(form.videoBlockUrl) ? (
                        <video src={form.videoBlockUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <span className="text-lg">📹</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 truncate flex-1">{form.videoBlockUrl.split("/").pop()}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-500 border-gray-200 hover:bg-gray-100"
                        onClick={() => setVideoPreview(form.videoBlockUrl)}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => onChange("videoBlockUrl", "")}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-lg">📹</span>
                    <span className="text-sm">No video selected</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openMediaPicker("video")}
                    >
                      Select Video
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <Input
                    value={form.videoEmbedUrl}
                    onChange={(e) => onChange("videoEmbedUrl", e.target.value)}
                    placeholder="Paste video URL (YouTube, Vimeo, Dailymotion, etc.)"
                    className="text-xs"
                  />
                  {form.videoEmbedUrl && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${detectPlatform(form.videoEmbedUrl).color}`}>
                        {detectPlatform(form.videoEmbedUrl).icon} {detectPlatform(form.videoEmbedUrl).name}
                      </span>
                      <a href={form.videoEmbedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[lab(20_23.9_-60.14)] underline truncate flex-1 hover:text-[lab(15_23.9_-60.14)]">
                        {form.videoEmbedUrl}
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 shrink-0"
                        onClick={() => onChange("videoEmbedUrl", "")}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Reels</p>
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={reelInput}
                  onChange={(e) => setReelInput(e.target.value)}
                  placeholder="Paste Instagram / TikTok / Facebook reel URL"
                  className="text-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addReel(); } }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReel}
                  disabled={!reelInput.trim()}
                  className="shrink-0"
                >
                  Add
                </Button>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-500 border-gray-200 hover:bg-gray-100"
                          onClick={() => window.open(block.url, "_blank")}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => removeReel(i)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </CardContent>
            </Card>

            <MediaPickerDialog
              open={mediaPickerOpen}
              onOpenChange={(o) => {
                setMediaPickerOpen(o);
                if (!o) setEditingBannerId(null);
              }}
              mode={mediaPickerMode === "model3d" ? "model" : "image"}
              title={
                mediaPickerMode === "model3d"
                  ? "Select 3D Model"
                  : mediaPickerMode === "video"
                  ? "Select Video"
                  : editingBannerId
                  ? "Update Banner Image"
                  : "Select Banner Image"
              }
              defaultCategory={
                mediaPickerMode === "model3d"
                  ? "3D Models"
                  : mediaPickerMode === "video"
                  ? "Videos"
                  : undefined
              }
              items={mediaItems}
              onSelect={handleMediaSelect}
            />
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Meta Title</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => onChange("metaTitle", e.target.value)}
                  placeholder="Defaults to blog title"
                />
                <p className="text-right text-[11px] text-gray-400">{form.metaTitle.length} / 60</p>
              </div>

              <div className="space-y-1.5">
                <Label>Meta Description</Label>
                <RichEditor
                  value={form.metaDescription}
                  onChange={(html) => onChange("metaDescription", html)}
                  minHeight={120}
                />
                <p className="text-right text-[11px] text-gray-400">{form.metaDescription.length} / 160</p>
              </div>

              <div className="space-y-1.5">
                <Label>Meta Keywords</Label>
                <Input
                  value={form.metaKeywords}
                  onChange={(e) => onChange("metaKeywords", e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-gray-400">Comma-separated keywords for search engines.</p>
              </div>
            </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-5">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Status</p>
              <div className="flex items-end gap-6 flex-wrap">
                <div className="space-y-1.5">
                  <Label>Published</Label>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                    <button
                      type="button"
                      onClick={() => onChange("isPublished", true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        form.isPublished
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange("isPublished", false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        !form.isPublished
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Publish Date</Label>
                  <Input
                    type="date"
                    value={form.publishDate}
                    onChange={(e) => onChange("publishDate", e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Project</p>
              <div className="space-y-1.5">
                <Label>Linked Project</Label>
                <Select
                  value={form.projectId}
                  onValueChange={(v) => onChange("projectId", v)}
                >
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">Link this blog to an existing project.</p>
              </div>
            </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Author</p>

              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit mb-4">
                <button
                  type="button"
                  onClick={() => onChange("authorMode", "manual")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    form.authorMode === "manual"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => onChange("authorMode", "team")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    form.authorMode === "team"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  From Team
                </button>
              </div>

              {form.authorMode === "manual" ? (
                <div className="flex items-end gap-6">
                  <div className="space-y-1.5">
                    <Label>Author Image</Label>
                    {authorPreview ? (
                      <div className="relative size-16 rounded-full border border-gray-200 overflow-hidden group">
                        <Image src={authorPreview} alt="Author" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setAuthorPreview(null);
                            onChange("authorImage", "");
                          }}
                          className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => authorInputRef.current?.click()}
                        className="size-16 rounded-full border border-dashed border-gray-200 grid place-items-center text-gray-500 hover:bg-gray-100 transition"
                      >
                        <Upload className="size-5" />
                      </button>
                    )}
                    <input
                      ref={authorInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImagePick(e, setAuthorPreview, "authorImage")}
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 max-w-sm">
                    <Label>Author Name</Label>
                    <Input
                      value={form.authorName}
                      onChange={(e) => onChange("authorName", e.target.value)}
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Select Team Member</Label>
                  <Select
                    value={form.authorTeamId}
                    onValueChange={(v) => onChange("authorTeamId", v)}
                  >
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {modelViewerPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModelViewerPreview(null)}>
          <div className="relative w-[80vw] h-[80vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <ModelViewer src={modelViewerPreview} className="w-full h-full" ar arModes="webxr scene-viewer quick-look" />
            <button
              type="button"
              onClick={() => setModelViewerPreview(null)}
              className="absolute top-3 right-3 size-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setVideoPreview(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <video src={videoPreview} controls autoPlay className="max-w-[90vw] max-h-[90vh] rounded-lg" />
            <button
              type="button"
              onClick={() => setVideoPreview(null)}
              className="absolute -top-3 -right-3 size-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
