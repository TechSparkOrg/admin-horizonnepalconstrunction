export type SectionType = "services" | "blog" | "faq" | "project";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  type: "public" | "internal";
  section: SectionType;
  is_active?: boolean;
  parent_id: string | null;
  children: Category[];
  created_at: string;
  updated_at: string;
}

export type CategoryCreate = Pick<
  Category,
  "name" | "slug" | "description" | "image" | "type" | "is_active" | "parent_id"
>;

export type CategoryUpdate = Partial<CategoryCreate>;
