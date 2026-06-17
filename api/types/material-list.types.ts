export interface MaterialItem {
  id: string;
  name: string;
  price_per_unit: number;
  attribute_id: string | null;
  unit_value: string;
  company_value: string;
  photo: string;
  service_category_id: string | null;
  is_active: boolean;
  blog_id: string;
  created_at: string;
  updated_at: string;
}

export type CreateMaterial = Omit<MaterialItem, "id" | "created_at" | "updated_at">;

export type UpdateMaterial = Partial<CreateMaterial>;
