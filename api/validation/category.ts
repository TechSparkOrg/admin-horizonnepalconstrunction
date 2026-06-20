import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["public", "internal"]),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean(),
  image: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  bannerImages: z.array(z.object({ id: z.string(), url: z.string(), name: z.string() })),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
