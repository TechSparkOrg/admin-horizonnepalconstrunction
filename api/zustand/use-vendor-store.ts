import { create } from "zustand";
import { toSlug } from "@/lib/slug";
import { vendorSchema } from "@/api/validation/vendor";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import type { Vendor } from "@/api/types/vendor.types";
import type { VendorSocialMedia } from "@/api/types/vendor.types";

interface VendorFormData {
  name: string;
  slug: string;
  owner_name: string;
  phone: string;
  email: string;
  location: string;
  social_media: VendorSocialMedia[];
  logo: string;
  is_active: boolean;
}

const EMPTY_FORM: VendorFormData = {
  name: "", slug: "", owner_name: "",
  phone: "", email: "", location: "",
  social_media: [], logo: "", is_active: true,
};

type View = "list" | "form";

interface VendorUiStore {
  view: View;
  editingId: string | null;
  form: VendorFormData;
  search: string;
  currentPage: number;

  openNew: () => void;
  openEdit: (item: Vendor) => void;
  back: () => void;
  setFormField: (key: string, value: string | boolean | number | null | VendorSocialMedia[]) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  validateForm: () => boolean;
}

export const useVendorUiStore = create<VendorUiStore>((set, get) => ({
  view: "list",
  editingId: null,
  form: { ...EMPTY_FORM },
  search: "",
  currentPage: 1,

  openNew: () => {
    set({ form: { ...EMPTY_FORM }, editingId: null, view: "form" });
  },

  openEdit: (item) => {
    set({
      form: {
        name: item.name,
        slug: item.slug,
        owner_name: item.owner_name,
        phone: item.phone,
        email: item.email,
        location: item.location,
        social_media: item.social_media,
        logo: item.logo,
        is_active: item.is_active,
      },
      editingId: item.slug,
      view: "form",
    });
  },

  back: () => {
    set({ form: { ...EMPTY_FORM }, view: "list" });
  },

  setFormField: (key, value) => {
    set((state) => {
      const updated = { ...state.form, [key]: value } as VendorFormData;
      if (key === "name" && !state.editingId && typeof value === "string") {
        updated.slug = toSlug(value);
      }
      return { form: updated };
    });
  },

  setSearch: (search) => set({ search, currentPage: 1 }),
  setPage: (currentPage) => set({ currentPage }),

  validateForm: () => {
    const { form } = get();
    const parsed = vendorSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Validation failed";
      ErrorHandler.toast(first);
      return false;
    }
    return true;
  },
}));
