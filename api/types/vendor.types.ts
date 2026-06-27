export interface VendorSocialMedia {
  platform: string;
  url: string;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  phone: string;
  email: string;
  location: string;
  social_media: VendorSocialMedia[];
  logo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateVendor = Omit<Vendor, "id" | "created_at" | "updated_at">;
export type UpdateVendor = Partial<CreateVendor>;
