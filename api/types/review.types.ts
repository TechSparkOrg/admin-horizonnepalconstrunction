export interface BilingualQuote {
  en: string;
  np: string;
}

export interface Review {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: BilingualQuote;
  rating: number;
  created_at: string;
  updated_at: string;
}

export type ReviewCreate = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type ReviewUpdate = Partial<ReviewCreate>;
