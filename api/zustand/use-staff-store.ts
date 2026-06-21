import { create } from "zustand";
import type { StaffFormData } from "@/components/page_ui/staff-form";
import { EMPTY } from "@/components/page_ui/staff-form";

type View = "list" | "form";

interface StaffUiState {
  view: View;
  editingId: string | null;
  form: StaffFormData;
  saving: boolean;
  search: string;
  typeFilter: string;
  currentPage: number;

  openNew: () => void;
  openEdit: (id: string, form: StaffFormData) => void;
  back: () => void;
  setFormField: (key: string, value: string | boolean | { platform: string; url: string }[] | null) => void;
  setForm: (form: StaffFormData) => void;
  setSaving: (saving: boolean) => void;
  setSearch: (search: string) => void;
  setTypeFilter: (filter: string) => void;
  setPage: (page: number) => void;
}

export const useStaffUiStore = create<StaffUiState>((set) => ({
  view: "list",
  editingId: null,
  form: { ...EMPTY },
  saving: false,
  search: "",
  typeFilter: "all",
  currentPage: 1,

  openNew: () => set({ view: "form", editingId: null, form: { ...EMPTY } }),

  openEdit: (id, form) => set({ view: "form", editingId: id, form }),

  back: () => set({ view: "list", editingId: null, form: { ...EMPTY } }),

  setFormField: (key, value) =>
    set((state) => ({
      form: { ...state.form, [key]: value },
    })),

  setForm: (form) => set({ form }),

  setSaving: (saving) => set({ saving }),

  setSearch: (search) => set({ search, currentPage: 1 }),

  setTypeFilter: (filter) => set({ typeFilter: filter, currentPage: 1 }),

  setPage: (page) => set({ currentPage: page }),
}));
