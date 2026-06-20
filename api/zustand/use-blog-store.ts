import { create } from "zustand";
import { MediaService } from "@/api/services/media.service";
import { toSlug } from "@/lib/slug";
import { blogSchema } from "@/api/validation/blog";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toast } from "sonner";
import type { MediaItem } from "@/api/types/media.types";
import type { BlogPost } from "@/api/types/blog.types";

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

const EMPTY_FORM: BlogFormData = {
  title: "", slug: "", content: "",
  metaTitle: "", metaDescription: "", metaKeywords: "",
  isActive: true, isPublished: false, publishDate: "",
  projectId: "", authorMode: "manual", authorName: "", authorImage: "", authorTeamId: "",
  categoryId: "",
  model3dBlock: "", videoBlockUrl: "", videoEmbedUrl: "",
};

function apiToForm(p: BlogPost): BlogFormData {
  return {
    title: p.title,
    slug: p.slug,
    content: p.content_html ?? "",
    metaTitle: p.meta_title ?? "",
    metaDescription: p.meta_description ?? "",
    metaKeywords: p.meta_keywords ?? "",
    isActive: p.is_active ?? true,
    isPublished: p.is_published ?? false,
    publishDate: p.publish_date ?? "",
    projectId: p.project_id ?? "",
    authorMode: "manual",
    authorName: p.author ?? "",
    authorImage: p.author_image ?? "",
    authorTeamId: "",
    categoryId: p.category_id ?? "",
    model3dBlock: p.model_3d_block ?? "",
    videoBlockUrl: p.video_block_url ?? "",
    videoEmbedUrl: p.video_embed_url ?? "",
  };
}

type View = "list" | "form";

interface BlogUiStore {
  view: View;
  editingSlug: string | null;
  form: BlogFormData;
  bannerImages: { id: string; url: string; name: string }[];
  reelBlocks: { url: string }[];
  saving: boolean;
  search: string;
  currentPage: number;

  openNew: () => void;
  openEdit: (item: BlogPost) => void;
  back: () => void;
  setFormField: (key: string, value: string | boolean) => void;
  setBannerImages: (images: { id: string; url: string; name: string }[]) => void;
  setReelBlocks: (blocks: { url: string }[]) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setSaving: (saving: boolean) => void;
  uploadMedia: (file: File, altText?: string) => Promise<MediaItem | null>;
  validateForm: () => boolean;
}

export const useBlogUiStore = create<BlogUiStore>((set, get) => ({
  view: "list",
  editingSlug: null,
  form: { ...EMPTY_FORM },
  bannerImages: [],
  reelBlocks: [],
  saving: false,
  search: "",
  currentPage: 1,

  openNew: () => {
    set({
      form: { ...EMPTY_FORM },
      bannerImages: [],
      reelBlocks: [],
      editingSlug: null,
      view: "form",
    });
  },

  openEdit: (item) => {
    set({
      form: apiToForm(item),
      bannerImages: item.banner_images ?? [],
      reelBlocks: item.reel_blocks ?? [],
      editingSlug: item.slug,
      view: "form",
    });
  },

  back: () => {
    set({
      form: { ...EMPTY_FORM },
      reelBlocks: [],
      view: "list",
    });
  },

  setFormField: (key, value) => {
    set((state) => {
      const updated = { ...state.form, [key]: value };
      if (key === "title" && !state.editingSlug && typeof value === "string") {
        updated.slug = toSlug(value);
      }
      return { form: updated };
    });
  },

  setBannerImages: (bannerImages) => set({ bannerImages }),
  setReelBlocks: (reelBlocks) => set({ reelBlocks }),
  setSearch: (search) => set({ search, currentPage: 1 }),
  setPage: (currentPage) => set({ currentPage }),
  setSaving: (saving) => set({ saving }),

  uploadMedia: async (file: File, altText?: string) => {
    try {
      const uploaded = await MediaService.uploadImage(file, { alt: altText || "" });
      toast.success("Image uploaded");
      return uploaded;
    } catch {
      toast.error("Failed to upload image");
      return null;
    }
  },

  validateForm: () => {
    const { form } = get();
    const parsed = blogSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Validation failed";
      ErrorHandler.toast(first);
      return false;
    }
    return true;
  },
}));
