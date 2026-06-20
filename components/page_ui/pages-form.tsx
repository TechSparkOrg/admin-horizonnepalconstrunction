"use client";

import { ImagePlus, X, User, Eye, Pencil, Trash2 } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useRef, useState, useEffect } from "react";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import { MediaPickerDialog } from "@/components/global_ui/media-handler-picker";
import type { PickerMediaItem } from "@/components/global_ui/media-handler-picker";
import { MediaService } from "@/api/services/media.service";
import { toast } from "sonner";
import { ImagePreviewDialog } from "@/components/global_ui/image-preview-dialog";

interface StaffMember {
  id: string;
  name: string;
  image?: string;
}

interface Project {
  id: string;
  title: string;
}

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  iconName: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  featuredImage: string;
  isActive: boolean;
  isPublished: boolean;
  publishDate: string;
  projectId: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
}

interface Props {
  form: PageFormData;
  editingSlug: string | null;
  saving: boolean;
  projects?: Project[];
  teamMembers?: StaffMember[];
  bannerImages: { id: string; url: string; name: string }[];
  onBannerImagesChange: (images: { id: string; url: string; name: string }[]) => void;
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

export function PagesForm({
  form,
  editingSlug,
  saving,
  projects = [],
  teamMembers = [],
  bannerImages,
  onBannerImagesChange,
  onChange,
  onSave,
  onBack,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(form.featuredImage || null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(form.authorImage || null);
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
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
    }
  };

  const removeBannerImage = (id: string) => {
    onBannerImagesChange(bannerImages.filter((img) => img.id !== id));
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
      <FormHeader
        breadcrumb="Pages"
        title={editingSlug ? form.title || "Edit Page" : "New Page"}
        onBack={onBack}
        onSave={onSave}
        saving={saving}
        saveDisabled={!form.title.trim() || saving}
        saveLabel={editingSlug ? "Update" : "Publish"}
      />

      <Tabs defaultValue="content" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"content","label":"Content"},{"value":"media","label":"Media"},{"value":"seo","label":"SEO"},{"value":"settings","label":"Settings"}]} />
        </div>

        <div>
          <TabsContent value="content" className="space-y-5 mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Page title"
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
                      placeholder="page-slug"
                      className="border-0 rounded-none font-mono focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

            <div className="space-y-1.5">
              <Label>Body</Label>
              <RichEditor
                value={form.content}
                onChange={(html) => onChange("content", html)}
                minHeight={380}
              />
            </div>
          </div>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Banner Images</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMediaPickerOpen(true)}
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
                            <div className="size-10 rounded-md overflow-hidden bg-gray-100">
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
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
                                onClick={() => setPreviewUrl(img.url)}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-sidebar-primary border-sidebar-primary/20 hover:bg-sidebar-primary/5"
                                onClick={() => {
                                  setEditingBannerId(img.id);
                                  setMediaPickerOpen(true);
                                }}
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
            </div>

            <MediaPickerDialog
              open={mediaPickerOpen}
              onOpenChange={(o) => {
                setMediaPickerOpen(o);
                if (!o) setEditingBannerId(null);
              }}
              mode="image"
              title={editingBannerId ? "Update Banner Image" : "Select Banner Image"}
              onSelect={handleBannerSelect}
            />
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
              <SeoFields
                metaTitle={form.metaTitle}
                metaDescription={form.metaDescription}
                metaKeywords={form.metaKeywords}
                onChange={onChange}
                titlePlaceholder="Defaults to page title"
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
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
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
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
                <p className="text-xs text-gray-400">Link this page to an existing project.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
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
                        <img src={authorPreview} alt="Author" className="w-full h-full object-cover" />
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
                        <User className="size-5" />
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
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
}
