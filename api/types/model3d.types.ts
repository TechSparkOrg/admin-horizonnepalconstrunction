export interface ModelItem {
  id: string;
  url: string;
  title: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export type ModelItemCreate = Omit<ModelItem, 'id' | 'created_at' | 'updated_at'>;
export type ModelItemUpdate = Partial<ModelItemCreate>;
