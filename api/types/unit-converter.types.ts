export interface ConversionRule {
  to: string;
  factor: number;
}

export interface BannerImage {
  id: string;
  url: string;
  name: string;
  isPrimary?: boolean;
}

export interface UnitConversionItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  attribute_id: string | null;
  field_label: string;
  base_unit: string;
  conversions: ConversionRule[];
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  banner_url?: string;
  banner_images: BannerImage[];
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateUnitConversion = Omit<UnitConversionItem, "id" | "created_at" | "updated_at">;

export type UpdateUnitConversion = Partial<CreateUnitConversion>;
