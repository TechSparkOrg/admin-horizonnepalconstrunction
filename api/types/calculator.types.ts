export interface CalcBuildingType {
  name: string;
}

export interface CalcMaterial {
  id: string;
  name: string;
  parent_name: string;
  building_type: string;
  unit_price: number;
  units_per_sqft: number;
  size: string;
  custom: { key: string; value: string }[];
  created_at: string;
  updated_at: string;
}

export type CalcMaterialCreate = Omit<CalcMaterial, 'id' | 'created_at' | 'updated_at'>;
export type CalcMaterialUpdate = Partial<CalcMaterialCreate>;

