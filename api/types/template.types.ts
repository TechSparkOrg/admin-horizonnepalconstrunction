export interface TemplateItem {
  id: string;
  attribute: string;
  attribute_name: string;
  title: string;
  slug: string;
  is_active: boolean;
  content: string;
  master_template_file?: string;
  created_at: string;
  updated_at: string;
}
