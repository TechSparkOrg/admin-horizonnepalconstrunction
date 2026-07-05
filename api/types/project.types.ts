export interface Client {
  id: string;
  name: string;
  location: string;
  contract_value: number;
  profession: string;
  document_id: string | null;
}

export interface ProjectMilestoneImage {
  id: string;
  url: string;
  name: string;
}

export interface ProjectMilestoneEmbed {
  platform: string;
  id: string;
  url: string;
}

export interface ProjectMilestone {
  id: string;
  date_started: string;
  estimated_end: string;
  completed_date: string | null;
  description: string;
  images: ProjectMilestoneImage[];
  model_3d_url: string;
  video_url: string;
  video_embed_urls: ProjectMilestoneEmbed[];
}

export interface ProjectListItem {
  id: string;
  title: string;
  slug: string;
  status: "ongoing" | "completed" | "paused";
  priority: "low" | "medium" | "high" | "top";
  created_at: string;
  thumbnail: string;
  category_id: string | null;
  is_published: boolean;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  status: "ongoing" | "completed" | "paused";
  pause_reason: string;
  priority: "low" | "medium" | "high" | "top";
  description: string;
  thumbnail: string;
  banner_images?: { id: string; url: string; name: string; isPrimary?: boolean }[];
  clients: Client[];
  milestones: ProjectMilestone[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_published: boolean;
  faq_group_slug?: string;
  boq_slug?: string;
  author: string;
  author_image: string;
  author_role: string;
  created_at: string;
  updated_at: string;
}

export type ProjectCreate = Omit<Project, "id" | "slug" | "created_at" | "updated_at">;
export type ProjectUpdate = Partial<ProjectCreate>;

export interface ProjectListParams {
  search?: string;
  category?: string;
  page?: number;
  page_size?: number;
}
