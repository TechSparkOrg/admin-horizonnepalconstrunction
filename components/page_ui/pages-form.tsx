"use client";

import { ImagePlus, User, Eye, Pencil, Trash2, X } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { useState } from "react";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SearchableSelect } from "@/components/global_ui/searchable-select";
import { MediaService } from "@/api/services/media.service";
import { toast } from "sonner";
import { ImagePreviewDialog } from "@/components/global_ui/image-preview-dialog";

interface StaffMember {
  id: string;
  name: string;
  image?: string;
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
  faqGroupSlug: string;
  authorMode: "manual" | "team";
  authorName: string;
  authorImage: string;
  authorTeamId: string;
}

interface Props {
  form: PageFormData;
  editingSlug: string | null;
  saving: boolean;
  errors?: Record<string, string>;
  teamMembers?: StaffMember[];
  bannerImages: { id: string; url: string; name: string; isPrimary?: boolean }[];
  onBannerImagesChange: (images: { id: string; url: string; name: string; isPrimary?: boolean }[]) => void;
  onChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

export function PagesForm({
  form,
  editingSlug,
  saving,
  errors = {},
  teamMembers = [],
  bannerImages,
  onBannerImagesChange,
  onChange,
  onSave,
  onBack,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [authorPickerOpen, setAuthorPickerOpen] = useState(false);
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
                  <Label>
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Page title"
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Slug <span className="text-red-500">*</span>
                  </Label>
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
                  {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
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
              <div className="flex flex-col gap-6 flex-wrap">
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
                <div className="space-y-1.5 mt-5">
                  <Label>FAQ Title / Slug</Label>
                  <Input
                    value={form.faqGroupSlug}
                    onChange={(e) => onChange("faqGroupSlug", e.target.value)}
                    placeholder="e.g. cement-faq"
                  />
                  <p className="text-[11px] text-amber-600 leading-relaxed mt-1">
                    Slug must be exactly as typed in the FAQ section to display related Q&amp;A
                  </p>
                </div>
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
                    <button
                      type="button"
                      onClick={() => setAuthorPickerOpen(true)}
                      className="relative size-16 rounded-full overflow-hidden group"
                    >
                      <Avatar className="size-16">
                        <AvatarImage src={form.authorImage} alt={form.authorName} />
                        <AvatarFallback>
                          <User className="size-5 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full bg-black/40">
                        <Pencil className="size-4 text-white" />
                      </div>
                      {form.authorImage && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange("authorImage", "");
                          }}
                          className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition"
                        >
                          <X className="size-3" />
                        </span>
                      )}
                    </button>
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
                  <SearchableSelect
                    options={teamMembers.map((m) => ({ value: m.id, label: m.name }))}
                    value={form.authorTeamId}
                    onChange={(v) => onChange("authorTeamId", v)}
                    placeholder="Select a team member"
                    searchPlaceholder="Search members..."
                    emptyMessage="No team members found."
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {mediaPickerOpen && (
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
      )}

      {authorPickerOpen && (
        <MediaPickerDialog
          open={authorPickerOpen}
          onOpenChange={setAuthorPickerOpen}
          mode="image"
          title="Select Author Image"
          onSelect={(item) => {
            onChange("authorImage", item.url);
            setAuthorPickerOpen(false);
          }}
        />
      )}

      <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
}
