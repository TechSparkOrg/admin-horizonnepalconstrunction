export interface BillingMaterialEntry {
  id: string;
  material_id: string;
  material_name: string;
  variant_id: string;
  variant_name: string;
  price: number;
  quantity: number;
  total: number;
  group?: string;
}

export interface BillingTeamEntry {
  id: string;
  staff_member_id: string;
  member_name: string;
  role: string;
  price: number;
  hours_per_day: number;
  days: number;
  total: number;
  group?: string;
}

export interface TaxEntry {
  id: string;
  label: string;
  rate: number;
  tax_type?: "percent" | "fixed";
}

export interface BillingCalculation {
  id: string;
  title: string;
  project_id: string;
  project_title: string;
  is_active: boolean;
  materials_title: string;
  team_title: string;
  material_entries?: BillingMaterialEntry[];
  team_entries?: BillingTeamEntry[];
  taxes?: TaxEntry[];
  material_total: number;
  team_total: number;
  tax_total: number;
  grand_total: number;
  material_count?: number;
  team_count?: number;
  created_at: string;
  updated_at: string;
}

export interface MaterialGroup {
  id: string;
  groupLabel: string;
  entries: BillingMaterialEntry[];
}

export interface TeamGroup {
  id: string;
  groupLabel: string;
  entries: BillingTeamEntry[];
}

export interface BillingFormData {
  title: string;
  project_id: string;
  is_active: boolean;
  materials_title: string;
  team_title: string;
}
