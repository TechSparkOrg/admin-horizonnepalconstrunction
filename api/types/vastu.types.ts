export interface BilingualPair {
  en: string;
  np: string;
}

export type VastuItemType = "section" | "room" | "direction";

export interface VastuItem {
  id: string;
  type: VastuItemType;
  title: string;
  slug: string;
  order: number;
  is_active: boolean;
  content_list: BilingualPair[];
  benefits: BilingualPair[];
  avoids: BilingualPair[];
  ideal_direction: BilingualPair;
  facing_direction: BilingualPair;
  deity: string;
  element: string;
  description: BilingualPair;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  author_mode: "manual" | "team";
  author_name: string;
  author_image: string;
  author_team_id: string;
  created_at: string;
  updated_at: string;
}

export type VastuItemCreate = Omit<VastuItem, 'id' | 'created_at' | 'updated_at'>;

export type VastuItemUpdate = Partial<VastuItemCreate>;
