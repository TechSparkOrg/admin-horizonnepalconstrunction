export interface UsageTag {
  type: string;
  count: number;
}

export interface MediaItem {
  id: string;
  url: string;
  thumbnail_url?: string;
  alt: string;
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  project_link: string;
  banner: boolean;
  is_active: boolean;
  group_title: string;
  custom_fields: { key: string; value: string }[];
  usage_tags?: UsageTag[];
  created_at: string;
  updated_at: string;
}

export interface BannerImage {
  id: string;
  url: string;
  title: string;
  alt?: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  is_active: boolean;
  created_at: string;
  group_title: string;
}

export interface BannerGroup {
  slug: string;
  title: string;
  alt: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  is_active: boolean;
  created_at: string;
  group_title: string;
  url: string;
  image_count: number;
  images: BannerImage[];
}

export type MediaItemCreate = Omit<MediaItem, 'id' | 'created_at' | 'updated_at'>;
export type MediaItemUpdate = Partial<MediaItemCreate>;
