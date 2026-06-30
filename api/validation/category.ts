import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["public", "internal"]),
  description: z.string().optional(),
  metaTitle: z.string().max(60, "Max 60 characters").optional(),
  metaDescription: z.string().max(160, "Max 160 characters").optional(),
  metaKeywords: z.string().max(255, "Max 255 characters").optional(),
  isActive: z.boolean(),
  image: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  faq_group_slug: z.string().optional(),
  service_id: z.string().nullable().optional(),
  bannerImages: z.array(z.object({ id: z.string(), url: z.string(), name: z.string(), isPrimary: z.boolean().optional() })),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
