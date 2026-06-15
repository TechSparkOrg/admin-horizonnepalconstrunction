"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, ImagePlus, Eye, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichEditor } from "@/components/page_ui/rich-editor";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaPickerDialog } from "@/components/global_ui/MediahanlderPicker";
import type { MediaItem } from "@/components/global_ui/MediahanlderPicker";
import { MediaService } from "@/api/services/media.service";
import { CategoryAdmin } from "@/api/services/category.service";
import type { Category } from "@/api/types/category.types";
import { toast } from "sonner";
import { toSlug } from "@/lib/slug";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["public", "internal"]),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean(),
  image: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  bannerImages: z.array(z.object({ id: z.string(), url: z.string(), name: z.string() })),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  editing: Category | null;
  saving: boolean;
  defaultValues?: Partial<CategoryFormData>;
  onSave: (data: CategoryFormData) => Promise<void>;
  onBack: () => void;
  parentCats?: Category[];
  showTypeField?: boolean;
}

export function CategoryForm({ editing, saving, defaultValues, onSave, onBack, parentCats: propParentCats, showTypeField = true }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugEdited = useRef(false);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerPage, setBannerPage] = useState(1);

  const [parentCats, setParentCats] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("content");
  const mediaFetched = useRef(false);

  const BANNER_PER_PAGE = 5;

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      type: "public",
      description: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isActive: true,
      image: "",
      parent_id: null,
      bannerImages: [],
      ...defaultValues,
    },
  });

  const nameValue = watch("name");
  const parentIdValue = watch("parent_id");
  const bannerImages = watch("bannerImages");
  const totalBannerPages = Math.ceil(bannerImages.length / BANNER_PER_PAGE);
  const paginatedBanners = bannerImages.slice(
    (bannerPage - 1) * BANNER_PER_PAGE,
    bannerPage * BANNER_PER_PAGE
  );

  useEffect(() => {
    if (propParentCats) {
      setParentCats(propParentCats);
      return;
    }
    CategoryAdmin.listServices({ page: 1 })
      .then((res) => setParentCats(res.results ?? []))
      .catch(() => {});
  }, [propParentCats]);

  const loadMedia = useCallback(() => {
    if (mediaFetched.current) return;
    mediaFetched.current = true;
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
    if (editing) {
      reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description || "",
        type: editing.type,
        image: editing.image || "",
        parent_id: editing.parent_id,
        metaTitle: defaultValues?.metaTitle || "",
        metaDescription: defaultValues?.metaDescription || "",
        metaKeywords: defaultValues?.metaKeywords || "",
        isActive: defaultValues?.isActive ?? true,
        bannerImages: defaultValues?.bannerImages || [],
      });
      setPreview(editing.image || "");
      setFile(null);
      slugEdited.current = true;
    } else {
      reset({
        name: "",
        slug: "",
        type: "public",
        description: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        isActive: true,
        image: "",
        parent_id: null,
        bannerImages: [],
        ...defaultValues,
      });
      setPreview("");
      setFile(null);
      slugEdited.current = false;
    }
  }, [editing, defaultValues, reset]);

  useEffect(() => {
    if (!slugEdited.current && nameValue) {
      setValue("slug", toSlug(nameValue));
    }
  }, [nameValue, setValue]);

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
      setValue(
        "bannerImages",
        bannerImages.map((img) =>
          img.id === editingBannerId
            ? { ...img, name: altText || img.name }
            : img
        )
      );
      setEditingBannerId(null);
    } else {
      setValue("bannerImages", [
        ...bannerImages,
        { ...newItem, name: altText || newItem.name },
      ]);
      setMediaItems((prev) => [...prev, { ...newItem, name: altText || newItem.name }]);
    }
  };

  const removeBannerImage = (id: string) => {
    setValue(
      "bannerImages",
      bannerImages.filter((img) => img.id !== id)
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview("");
    setValue("image", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: CategoryFormData) => {
    setUploading(true);
    try {
      let imageUrl = data.image || "";
      if (file) {
        const uploaded = await MediaService.uploadImage(file);
        imageUrl = uploaded.url;
      }
      await onSave({
        ...data,
        image: imageUrl,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Categories</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-none">
              {editing ? "Edit Category" : "New Category"}
            </h1>
          </div>
        </div>
        <Button
          type="submit"
          form="category-form"
          disabled={isSubmitting || uploading || saving}
          className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white"
        >
          {(uploading || saving) && <Loader2 className="size-4 animate-spin" />}
          {uploading ? "Uploading..." : saving ? "Saving..." : editing ? "Update" : "Publish"}
        </Button>
      </div>

      <form id="category-form" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("parent_id")} />
        <input type="hidden" {...register("bannerImages")} />

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === "media") loadMedia(); }} className="w-full flex flex-col">
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
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input
                      {...register("name")}
                      placeholder="Category name"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                      <span className="px-3 flex items-center text-xs text-gray-500 bg-gray-100 border-r border-gray-200 shrink-0">
                        /
                      </span>
                      <Input
                        {...register("slug")}
                        placeholder="category-slug"
                        className="border-0 rounded-none font-mono focus-visible:ring-0"
                        onChange={(e) => { slugEdited.current = true; register("slug").onChange(e); }}
                      />
                    </div>
                    {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                  </div>
                </div>

                {showTypeField && (
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                      <button
                        type="button"
                        onClick={() => setValue("type", "public")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          watch("type") === "public"
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("type", "internal")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          watch("type") === "internal"
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Internal
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <RichEditor
                    value={watch("description") || ""}
                    onChange={(html) => setValue("description", html)}
                    minHeight={260}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Parent Category</Label>
                  <Select
                    value={parentIdValue ?? "__none__"}
                    onValueChange={(v) => setValue("parent_id", v === "__none__" ? null : v)}
                  >
                    <SelectTrigger className="max-w-sm">
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None (top-level)</SelectItem>
                      {parentCats
                        .filter((c) => c.id !== editing?.id)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 w-full">
                <div className="space-y-1.5">
                  <Label>Meta Title</Label>
                  <Input
                    {...register("metaTitle")}
                    placeholder="Defaults to category name"
                  />
                  <p className="text-right text-[11px] text-gray-400">{(watch("metaTitle") || "").length} / 60</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Meta Description</Label>
                  <RichEditor
                    value={watch("metaDescription") || ""}
                    onChange={(html) => setValue("metaDescription", html)}
                    minHeight={120}
                  />
                  <p className="text-right text-[11px] text-gray-400">{(watch("metaDescription") || "").length} / 160</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Meta Keywords</Label>
                  <Input
                    {...register("metaKeywords")}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-xs text-gray-400">Comma-separated keywords for search engines.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-4 space-y-5">
    

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
                                  onClick={() => window.open(img.url, "_blank")}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[lab(20_23.9_-60.14)] border-[lab(20_23.9_-60.14)]/20 hover:bg-[lab(20_23.9_-60.14)]/5"
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

            <TabsContent value="settings" className="mt-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
                <p className="text-sm font-semibold text-gray-900 mb-4">Status</p>
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
                  <button
                    type="button"
                    onClick={() => setValue("isActive", true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                      watch("isActive")
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("isActive", false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                      !watch("isActive")
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </form>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={(o) => {
          setMediaPickerOpen(o);
          if (!o) setEditingBannerId(null);
        }}
        mode="image"
        title={editingBannerId ? "Update Banner Image" : "Select Banner Image"}
        items={mediaItems}
        onSelect={handleBannerSelect}
      />

      {viewerOpen && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewerOpen(false)}>
          <img src={preview} alt="Full preview" className="max-w-full max-h-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
