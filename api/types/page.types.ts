export interface PageSection {
  id: string;
  page: string;
  section_key: string;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  icon_name: string;
  images: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageSvgItem {
  id: string;
  url: string;
  name: string;
  lazy_spinner: boolean;
  sort_order: number;
}

export interface BannerImage {
  id: string;
  url: string;
  name: string;
  isPrimary?: boolean;
}

export interface PageListItem {
  id: string;
  title: string;
  slug: string;
  is_active?: boolean;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageDetail extends PageListItem {
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  faq_group_slug?: string;
  author_name?: string;
  author_image?: string;
  author_team_id?: string;
  banner_images?: BannerImage[];
  svg_items?: PageSvgItem[];
}

export type PageCreate = Omit<PageDetail, 'id' | 'created_at' | 'updated_at'>;
export type PageUpdate = Partial<PageCreate>;
