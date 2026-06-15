export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  meta_title: string;
  description: string;
  keywords: string;
  project_link: string;
  banner: boolean;
  group_title: string;
  custom_fields: { key: string; value: string }[];
  created_at: string;
  updated_at: string;
}

export type MediaItemCreate = Omit<MediaItem, 'id' | 'created_at' | 'updated_at'>;
export type MediaItemUpdate = Partial<MediaItemCreate>;
