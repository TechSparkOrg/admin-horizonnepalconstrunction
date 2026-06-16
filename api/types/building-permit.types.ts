export interface BilingualPair {
  en: string;
  np: string;
}

export type BuildingPermitItemType = "workflow_step" | "doc_category" | "regulation" | "municipality";

export interface DocumentExample {
  document_name: string;
  image_url: string;
}

export interface BuildingPermitItem {
  id: string;
  type: BuildingPermitItemType;
  title: string;
  slug: string;
  order: number;
  is_active: boolean;
  step_number: number;
  description: BilingualPair;
  duration: string;
  documents: string[];
  label: BilingualPair;
  items: BilingualPair[];
  district: string;
  phone: string;
  document_examples: DocumentExample[];
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

export type BuildingPermitItemCreate = Omit<BuildingPermitItem, 'id' | 'created_at' | 'updated_at'>;
export type BuildingPermitItemUpdate = Partial<BuildingPermitItemCreate>;
