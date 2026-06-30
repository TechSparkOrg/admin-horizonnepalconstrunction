export interface Bank {
  id: string;
  name: string;
  slug: string;
  logo: string;
  code: string;
  is_active: boolean;
  tenure_options: number[];
  created_at: string;
  updated_at: string;
}

export type BankCreate = Omit<Bank, "id" | "created_at" | "updated_at">;
export type BankUpdate = Partial<BankCreate>;

export interface BankListParams {
  search?: string;
  page?: number;
  page_size?: number;
}
