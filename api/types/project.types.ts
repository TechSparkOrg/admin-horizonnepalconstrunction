export interface ProjectMaterial {
  name: string;
  desc: string;
}

export interface CostEstimation {
  item: string;
  amount: string;
}

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface ProjectSocialLink {
  platform: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  file: string;
  location: string;
  start_date: string;
  completion: string;
  thumbnail: string;
  images: string[];
  description: string;
  materials: ProjectMaterial[];
  cost_estimation: CostEstimation[];
  specs: ProjectSpec[];
  gallery: string[];
  social_links: ProjectSocialLink[];
  created_at: string;
  updated_at: string;
}

export type ProjectCreate = Omit<Project, 'id' | 'slug' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectCreate>;

export interface ProjectListParams {
  category?: string;
  page?: number;
  page_size?: number;
}
