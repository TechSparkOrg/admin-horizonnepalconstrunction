import { z } from "zod";

export const faqItemSchema = z.object({
  id: z.string().optional(),
  question: z.object({
    en: z.string(),
    np: z.string(),
  }),
  answer: z.object({
    en: z.string(),
    np: z.string(),
  }),
  order: z.number(),
});

export const faqSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  categoryId: z.string().optional(),
  order: z.number(),
  isActive: z.boolean(),
  items: z.array(faqItemSchema),
});

export type FaqFormData = z.infer<typeof faqSchema>;
