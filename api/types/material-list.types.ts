export interface BannerImage {
  id: string;
  url: string;
  name: string;
  isPrimary?: boolean;
}

export interface VariantItem {
  id: string;
  img: string;
  price: number;
  market_name: string;
}

export interface MaterialItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_per_unit: number;
  unit_value: string;
  company_id: string | null;
  logo: string;
  service_category_id: string | null;
  faq_category_id: string | null;
  variants: VariantItem[];
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  banner_url?: string;
  banner_images: BannerImage[];
  video_url: string;
  created_at: string;
  updated_at: string;
}

export type CreateMaterial = Omit<MaterialItem, "id" | "created_at" | "updated_at">;
export type UpdateMaterial = Partial<CreateMaterial>;
