export interface ConversionRule {
  to: string;
  factor: number;
}

export interface UnitConversionItem {
  id: string;
  title: string;
  slug: string;
  attribute_id: string | null;
  field_label: string;
  base_unit: string;
  conversions: ConversionRule[];
  is_active: boolean;
  blog_id: string;
  created_at: string;
  updated_at: string;
}

export type CreateUnitConversion = Omit<UnitConversionItem, "id" | "created_at" | "updated_at">;

export type UpdateUnitConversion = Partial<CreateUnitConversion>;
