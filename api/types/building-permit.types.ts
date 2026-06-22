export interface BilingualPair {
  en: string;
  np: string;
}

export interface BuildingPermit {
  id: string;
  title: string;
  slug: string;
  is_active: boolean;
  workflow_steps: {
    name: string;
    description: BilingualPair;
    duration: string;
    requiredDocs: { name: string; imageUrl: string }[];
  }[];
  regulation_items: {
    name: string;
    items: BilingualPair[];
  }[];
  municipality_items: {
    district: string;
    phone: string;
    location: string;
  }[];
  banners: { url: string; name: string }[];
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

export type BuildingPermitCreate = Omit<BuildingPermit, 'id' | 'created_at' | 'updated_at'>;
export type BuildingPermitUpdate = Partial<BuildingPermitCreate>;
