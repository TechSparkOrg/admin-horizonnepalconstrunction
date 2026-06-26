import { create } from "zustand";
import { ProjectAdmin } from "@/api/services/project.service";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toSlug } from "@/lib/slug";
import { stripHtml } from "@/lib/html-content";
import type { Project, Client, ProjectMilestone, SpendingRecord } from "@/api/types/project.types";

export interface ProjectFormData {
  title: string;
  slug: string;
  category_id: string | null;
  description: string;
  status: "ongoing" | "completed" | "paused";
  pause_reason: string;
  priority: "low" | "medium" | "high" | "top";
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_published: boolean;
  author: string;
  author_image: string;
  author_role: string;
  authorMode: "manual" | "team";
}

export const EMPTY_FORM: ProjectFormData = {
  title: "", slug: "", category_id: null, description: "",
  status: "ongoing", pause_reason: "", priority: "medium",
  meta_title: "", meta_description: "", meta_keywords: "",
  is_published: false, author: "", author_image: "", author_role: "",
  authorMode: "manual",
};

export const EMPTY_CLIENT: Client = { id: "", name: "", location: "", contract_value: 0, profession: "", document_id: null };
export const EMPTY_MILESTONE: ProjectMilestone = { id: "", date_started: "", estimated_end: "", completed_date: null, images: [], model_3d_url: "", video_url: "", video_embed_urls: [] };
export const EMPTY_SPENDING: SpendingRecord = { id: "", spending_type: "team", staff_member_id: null, material_id: null, time_spent: "", amount: 0 };

function genId() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

function apiToForm(item: Project): ProjectFormData {
  return {
    title: item.title, slug: item.slug, category_id: item.category_id,
    description: item.description, status: item.status, pause_reason: item.pause_reason,
    priority: item.priority,
    meta_title: stripHtml(item.meta_title),
    meta_description: stripHtml(item.meta_description),
    meta_keywords: stripHtml(item.meta_keywords),
    is_published: item.is_published,
    author: item.author, author_image: item.author_image, author_role: item.author_role,
    authorMode: "manual",
  };
}

type View = "list" | "form";

const ITEMS_PER_PAGE = 10;

interface ProjectStore {
  projects: Project[];
  total: number;
  currentPage: number;
  search: string;
  view: View;
  editingSlug: string | null;
  form: ProjectFormData;
  client: Client;
  milestones: ProjectMilestone[];
  spendingRecords: SpendingRecord[];
  bannerImages: { id: string; url: string; name: string; isPrimary?: boolean }[];

  fetchAll: () => Promise<void>;
  refetch: () => Promise<void>;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  openNew: () => void;
  openEdit: (item: Project) => void;
  back: () => void;
  setFormField: (key: string, value: string | boolean | null) => void;
  setClient: (client: Client) => void;
  setBannerImages: (images: { id: string; url: string; name: string; isPrimary?: boolean }[]) => void;
  setMilestones: (milestones: ProjectMilestone[]) => void;
  setSpendingRecords: (records: SpendingRecord[]) => void;
  confirmDelete: (slug: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  total: 0,
  currentPage: 1,
  search: "",
  view: "list",
  editingSlug: null,
  form: { ...EMPTY_FORM },
  client: { ...EMPTY_CLIENT },
  milestones: [],
  spendingRecords: [],
  bannerImages: [],

  fetchAll: async () => {
    const { currentPage, search } = get();
    try {
      const res = await ProjectAdmin.list({ search: search || undefined, page: currentPage, page_size: ITEMS_PER_PAGE });
      set({ projects: res.results ?? [], total: res.count ?? 0 });
    } catch (err) {
      ErrorHandler.toast(ErrorHandler.parse(err).message);
    }
  },

  refetch: async () => {
    const { currentPage, search } = get();
    try {
      const res = await ProjectAdmin.list({ search: search || undefined, page: currentPage, page_size: ITEMS_PER_PAGE });
      set({ projects: res.results ?? [], total: res.count ?? 0 });
    } catch (err) {
      ErrorHandler.toast(ErrorHandler.parse(err).message);
    }
  },

  setSearch: (search) => set({ search, currentPage: 1 }),

  setPage: (currentPage) => set({ currentPage }),

  openNew: () => {
    set({
      form: { ...EMPTY_FORM }, client: { ...EMPTY_CLIENT },
      milestones: [], spendingRecords: [], bannerImages: [],
      editingSlug: null, view: "form",
    });
  },

  openEdit: (item) => {
    set({
      form: apiToForm(item),
      client: item.clients?.[0] || { ...EMPTY_CLIENT },
      milestones: item.milestones,
      spendingRecords: item.spending_records,
      bannerImages: item.banner_images ?? [],
      editingSlug: item.slug,
      view: "form",
    });
  },

  back: () => {
    set({
      form: { ...EMPTY_FORM }, client: { ...EMPTY_CLIENT },
      milestones: [], spendingRecords: [], bannerImages: [],
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

  setClient: (client) => set({ client }),
  setBannerImages: (bannerImages) => set({ bannerImages }),
  setMilestones: (milestones) => set({ milestones }),
  setSpendingRecords: (spendingRecords) => set({ spendingRecords }),

  confirmDelete: async (slug) => {
    try {
      await ProjectAdmin.delete(slug);
      set((state) => ({
        projects: state.projects.filter((p) => p.slug !== slug),
        total: state.total - 1,
      }));
    } catch (err) {
      ErrorHandler.toast(ErrorHandler.parse(err).message);
    }
  },
}));
