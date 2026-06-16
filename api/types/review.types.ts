export interface BilingualQuote {
  en: string;
  np: string;
}

export interface ReviewItemData {
  id?: string;
  name: string;
  role: string;
  quote: BilingualQuote;
  rating: number;
  order: number;
}

export interface ReviewGroup {
  id: string;
  title: string;
  slug: string;
  order: number;
  is_active: boolean;
  items: ReviewItemData[];
  created_at: string;
  updated_at: string;
}

export type ReviewGroupCreate = Omit<ReviewGroup, 'id' | 'created_at' | 'updated_at'>;

export type ReviewGroupUpdate = Partial<ReviewGroupCreate>;
