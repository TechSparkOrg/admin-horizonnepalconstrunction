export type SocialLink = {
  platform: string;
  url: string;
  id: string;
};

export type CompanyInfo = {
  name: string;
  description: string;
};

export type ContactInfo = {
  phone: string;
  email: string;
  address: string;
  mapEmbed: string;
  whatsappNumber: string;
};

export type SeoSettings = {
  title: string;
  description: string;
  keywords: string;
};

export type ScriptSettings = {
  head: string;
  body: string;
};

export type SiteSettings = {
  company_info: CompanyInfo;
  social_links: SocialLink[];
  contact_info: ContactInfo;
  seo: SeoSettings;
  scripts: ScriptSettings;
  created_at?: string;
  updated_at?: string;
};

export type SiteSettingsPayload = Omit<SiteSettings, "created_at" | "updated_at">;
