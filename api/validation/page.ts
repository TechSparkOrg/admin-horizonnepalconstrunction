import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  iconName: z.string().optional(),
  metaTitle: z.string().max(60, "Max 60 characters").optional(),
  metaDescription: z.string().max(160, "Max 160 characters").optional(),
  metaKeywords: z.string().max(255, "Max 255 characters").optional(),
  featuredImage: z.string().optional(),
  isActive: z.boolean(),
  isPublished: z.boolean(),
  publishDate: z.string().optional(),
  projectId: z.string().optional(),
  authorMode: z.enum(["manual", "team"]),
  authorName: z.string().optional(),
  authorImage: z.string().optional(),
  authorTeamId: z.string().optional(),
});

export type PageFormData = z.infer<typeof pageSchema>;
