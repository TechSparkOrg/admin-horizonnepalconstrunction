import { create } from "zustand";
import { ProjectAdmin } from "@/api/services/project.service";
import { CategoryAdmin } from "@/api/services/category.service";
import { StaffAdmin } from "@/api/services/staff.service";
import { MaterialListAdmin } from "@/api/services/material-list.service";
import { DocumentAdmin } from "@/api/services/document.service";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toSlug } from "@/lib/slug";
import { projectSchema } from "@/api/validation/project";
import type { Category } from "@/api/types/category.types";
import type { StaffMember } from "@/api/types/staff.types";
import type { MaterialItem } from "@/api/types/material-list.types";
import type { DocumentItem } from "@/api/types/document.types";
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
    priority: item.priority, meta_title: item.meta_title, meta_description: item.meta_description,
    meta_keywords: item.meta_keywords, is_published: item.is_published,
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
  deleteSlug: string | null;
  saving: boolean;
  form: ProjectFormData;
  client: Client;
  milestones: ProjectMilestone[];
  spendingRecords: SpendingRecord[];
  thumbnail: string;
  categories: Category[];
  staffMembers: StaffMember[];
  materials: MaterialItem[];
  documents: DocumentItem[];

  fetchAll: () => Promise<void>;
  refetch: () => Promise<void>;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setDeleteSlug: (slug: string | null) => void;
  openNew: () => void;
  openEdit: (item: Project) => void;
  back: () => void;
  setFormField: (key: string, value: string | boolean | null) => void;
  setClient: (client: Client) => void;
  setThumbnail: (thumbnail: string) => void;
  addMilestone: () => void;
  updateMilestone: (id: string, data: Partial<ProjectMilestone>) => void;
  removeMilestone: (id: string) => void;
  setMilestones: (milestones: ProjectMilestone[]) => void;
  addMilestoneImage: (msId: string, item: { id: string; url: string; name: string }) => void;
  removeMilestoneImage: (msId: string, imgId: string) => void;
  addMilestoneEmbed: (msId: string, embed: ProjectMilestone["video_embed_urls"][number]) => void;
  removeMilestoneEmbed: (msId: string, embedId: string) => void;
  addSpendingRecord: () => void;
  updateSpendingRecord: (id: string, data: Partial<SpendingRecord>) => void;
  removeSpendingRecord: (id: string) => void;
  setSpendingRecords: (records: SpendingRecord[]) => void;
  save: () => Promise<void>;
  confirmDelete: (slug: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  total: 0,
  currentPage: 1,
  search: "",
  view: "list",
  editingSlug: null,
  deleteSlug: null,
  saving: false,
  form: { ...EMPTY_FORM },
  client: { ...EMPTY_CLIENT },
  milestones: [],
  spendingRecords: [],
  thumbnail: "",
  categories: [],
  staffMembers: [],
  materials: [],
  documents: [],

  fetchAll: async () => {
    const { currentPage } = get();
    try {
      const [projectRes, catRes, staffRes, materialRes, docRes] = await Promise.all([
        ProjectAdmin.list({ page: currentPage, page_size: ITEMS_PER_PAGE }),
        CategoryAdmin.listProject(),
        StaffAdmin.search({}),
        MaterialListAdmin.search({}),
        DocumentAdmin.search({}),
      ]);
      set({
        projects: projectRes.results ?? [],
        total: projectRes.count ?? 0,
        categories: catRes.results ?? [],
        staffMembers: staffRes.results ?? [],
        materials: materialRes.results ?? [],
        documents: docRes.results ?? [],
      });
    } catch (err) {
      ErrorHandler.toast(ErrorHandler.parse(err).message);
    }
  },

  refetch: async () => {
    const { currentPage } = get();
    try {
      const res = await ProjectAdmin.list({ page: currentPage, page_size: ITEMS_PER_PAGE });
      set({ projects: res.results ?? [], total: res.count ?? 0 });
    } catch (err) {
      ErrorHandler.toast(ErrorHandler.parse(err).message);
    }
  },

  setSearch: (search) => set({ search, currentPage: 1 }),

  setPage: (currentPage) => set({ currentPage }),

  setDeleteSlug: (deleteSlug) => set({ deleteSlug }),

  openNew: () => {
    set({
      form: { ...EMPTY_FORM }, client: { ...EMPTY_CLIENT },
      milestones: [], spendingRecords: [], thumbnail: "",
      editingSlug: null, view: "form",
    });
  },

  openEdit: (item) => {
    set({
      form: apiToForm(item),
      client: item.clients?.[0] || { ...EMPTY_CLIENT },
      milestones: item.milestones,
      spendingRecords: item.spending_records,
      thumbnail: item.thumbnail,
      editingSlug: item.slug,
      view: "form",
    });
  },

  back: () => {
    set({
      form: { ...EMPTY_FORM }, client: { ...EMPTY_CLIENT },
      milestones: [], spendingRecords: [], thumbnail: "",
      deleteSlug: null, view: "list",
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
  setThumbnail: (thumbnail) => set({ thumbnail }),
  setMilestones: (milestones) => set({ milestones }),

  addMilestone: () => {
    const ms: ProjectMilestone = { ...EMPTY_MILESTONE, id: genId() };
    set((state) => ({ milestones: [...state.milestones, ms] }));
  },

  updateMilestone: (id, data) => {
    set((state) => ({
      milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
  },

  removeMilestone: (id) => {
    set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) }));
  },

  addMilestoneImage: (msId, item) => {
    set((state) => ({
      milestones: state.milestones.map((ms) =>
        ms.id === msId ? { ...ms, images: [...ms.images, item] } : ms
      ),
    }));
  },

  removeMilestoneImage: (msId, imgId) => {
    set((state) => ({
      milestones: state.milestones.map((ms) =>
        ms.id === msId ? { ...ms, images: ms.images.filter((img) => img.id !== imgId) } : ms
      ),
    }));
  },

  addMilestoneEmbed: (msId, embed) => {
    set((state) => ({
      milestones: state.milestones.map((ms) =>
        ms.id === msId ? { ...ms, video_embed_urls: [...(ms.video_embed_urls || []), embed] } : ms
      ),
    }));
  },

  removeMilestoneEmbed: (msId, embedId) => {
    set((state) => ({
      milestones: state.milestones.map((ms) =>
        ms.id === msId ? { ...ms, video_embed_urls: ms.video_embed_urls.filter((e) => e.id !== embedId) } : ms
      ),
    }));
  },

  addSpendingRecord: () => {
    const record: SpendingRecord = { ...EMPTY_SPENDING, id: genId() };
    set((state) => ({ spendingRecords: [...state.spendingRecords, record] }));
  },

  updateSpendingRecord: (id, data) => {
    set((state) => ({
      spendingRecords: state.spendingRecords.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }));
  },

  removeSpendingRecord: (id) => {
    set((state) => ({ spendingRecords: state.spendingRecords.filter((r) => r.id !== id) }));
  },

  setSpendingRecords: (spendingRecords) => set({ spendingRecords }),

  save: async () => {
    const { form, editingSlug, client, milestones, spendingRecords, thumbnail } = get();
    const parsed = projectSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Validation failed";
      ErrorHandler.toast(first);
      return;
    }
    set({ saving: true });
    try {
      const { authorMode, ...formData } = form;
      const payload = {
        ...formData,
        thumbnail,
        clients: client.name ? [client] : [],
        milestones,
        spending_records: spendingRecords,
      };
      if (editingSlug) {
        await ProjectAdmin.update(editingSlug, payload);
      } else {
        await ProjectAdmin.create(payload as any);
      }
      await get().refetch();
      get().back();
    } catch (err) {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    } finally {
      set({ saving: false });
    }
  },

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
    set({ deleteSlug: null });
  },
}));
