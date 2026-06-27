import { z } from "zod";

export const vendorSocialMediaSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().min(1, "URL is required"),
});

export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  owner_name: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  location: z.string().default(""),
  social_media: z.array(vendorSocialMediaSchema).default([]),
  logo: z.string().default(""),
  is_active: z.boolean(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
