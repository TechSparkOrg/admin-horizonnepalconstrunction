export interface ClientRef {
  id: string;
  name: string;
  location: string;
  profession: string;
  document_id: string | null;
  contract_value: number;
}

export interface ProjectRef {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status?: string;
  clients?: ClientRef[];
  img?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: { slug: string; name: string ,id:string } | null;
  project: ProjectRef | null;
  category_id: string;
  project_id: string;
  image: string;
  date: string;
  author: string;
  author_image: string;
  author_role: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active?: boolean;
  is_published?: boolean;
  publish_date?: string;
  banner_images?: { id: string; url: string; name: string; isPrimary?: boolean }[];
  model_3d_block?: string;
  video_block_url?: string;
  video_embed_url?: string;
  reel_blocks?: { url: string }[];
  created_at: string;
  updated_at: string;
}

export type BlogPostCreate = Omit<BlogPost, 'id' | 'slug' | 'created_at' | 'updated_at' | 'category' | 'project'>;
export type BlogPostUpdate = Partial<BlogPostCreate>;
