export interface AttributeValue {
  label: string;
  values: string[];
}

export interface AttributeItem {
  id: string;
  title: string;
  slug: string;
  used_in: string;
  values: AttributeValue[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateAttribute = Omit<AttributeItem, "id" | "created_at" | "updated_at">;

export type UpdateAttribute = Partial<CreateAttribute>;
