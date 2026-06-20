import { z } from "zod";

export const settingsSchema = z.object({
  company_info: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
  social_links: z.array(z.object({
    platform: z.string(),
    url: z.string().url("Invalid URL"),
    id: z.string().optional(),
  })),
  contact_info: z.object({
    phone: z.string().optional(),
    email: z.string().email("Invalid email").or(z.literal("")),
    address: z.string().optional(),
    mapEmbed: z.string().optional(),
    whatsappNumber: z.string().optional(),
  }),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }),
  scripts: z.object({
    head: z.string().optional(),
    body: z.string().optional(),
  }),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
