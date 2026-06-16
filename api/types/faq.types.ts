export interface BilingualField {
  en: string;
  np: string;
}

export interface FaqItemData {
  id?: string;
  question: BilingualField;
  answer: BilingualField;
  order: number;
}

export interface FaqGroup {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  order: number;
  is_active: boolean;
  items: FaqItemData[];
  created_at: string;
  updated_at: string;
}

export type FaqGroupCreate = Omit<FaqGroup, 'id' | 'created_at' | 'updated_at'>;

export type FaqGroupUpdate = Partial<FaqGroupCreate>;
