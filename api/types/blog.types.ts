export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'image' | 'quote' | 'list' | 'subheading';
  value?: string;
  items?: string[];
  caption?: string;
  src?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  title_np: string;
  excerpt: string;
  excerpt_np: string;
  category_id: string;
  project_id: string;
  image: string;
  date: string;
  author: string;
  author_role: string;
  author_image: string;
  content: ContentBlock[];
  content_np: ContentBlock[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active?: boolean;
  is_published?: boolean;
  publish_date?: string;
  banner_images?: { id: string; url: string; name: string }[];
  content_html?: string;
  created_at: string;
  updated_at: string;
}

export type BlogPostCreate = Omit<BlogPost, 'id' | 'slug' | 'created_at' | 'updated_at'>;
export type BlogPostUpdate = Partial<BlogPostCreate>;
