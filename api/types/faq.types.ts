export interface BilingualField {
  en: string;
  np: string;
}

export interface FaqItem {
  id: string;
  category_id: string;
  question: BilingualField;
  answer: BilingualField;
  order: number;
  created_at: string;
  updated_at: string;
}

export type FaqItemCreate = Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>;
export type FaqItemUpdate = Partial<FaqItemCreate>;
