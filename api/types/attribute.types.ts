export const USED_IN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "services", label: "Services" },
  { value: "blog", label: "Blog" },
  { value: "project", label: "Project" },
] as const;

export type UsedIn = (typeof USED_IN_OPTIONS)[number]["value"];

export interface AttributeValue {
  label: string;
  values: string[];
}

export interface AttributeItem {
  id: string;
  title: string;
  slug: string;
  used_in: UsedIn;
  values: AttributeValue[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateAttribute = Omit<AttributeItem, "id" | "created_at" | "updated_at">;

export type UpdateAttribute = Partial<CreateAttribute>;
