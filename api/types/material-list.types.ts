export type UnitType = "weight" | "volume" | "dimension";

export const UNIT_OPTIONS: Record<UnitType, string[]> = {
  weight: ["kg", "g", "ton", "lb"],
  volume: ["L", "mL", "m3", "gal"],
  dimension: ["m", "cm", "mm", "ft", "in"],
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  weight: "Weight",
  volume: "Volume",
  dimension: "Dimension",
};

export interface MaterialItem {
  id: string;
  name: string;
  price_per_unit: number;
  unit_type: UnitType;
  unit: string;
  photo: string;
  company: string;
  service_category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateMaterial = Omit<MaterialItem, "id" | "created_at" | "updated_at">;

export type UpdateMaterial = Partial<CreateMaterial>;
