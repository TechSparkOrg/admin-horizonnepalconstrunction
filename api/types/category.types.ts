export type SectionType = "services" | "blog" | "faq" | "project";

export interface BannerImage {
  id: string;
  url: string;
  name: string;
  isPrimary?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  type: "public" | "internal";
  section: SectionType;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  banner_images?: BannerImage[];
  parent_id: string | null;
  children: Category[];
  created_at: string;
  updated_at: string;
}

export type CategoryCreate = Pick<
  Category,
  | "name" | "slug" | "description" | "image" | "type" | "is_active"
  | "parent_id" | "meta_title" | "meta_description" | "meta_keywords"
  | "banner_images"
>;

export type CategoryUpdate = Partial<CategoryCreate>;
