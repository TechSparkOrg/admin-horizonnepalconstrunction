import { z } from "zod";

export const reviewItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  role: z.string(),
  quote: z.object({
    en: z.string(),
    np: z.string(),
  }),
  rating: z.number().min(1).max(5),
  order: z.number(),
});

export const reviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  order: z.number(),
  isActive: z.boolean(),
  items: z.array(reviewItemSchema),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
