import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category_id: z.string().nullable().optional(),
  description: z.string().optional(),
  status: z.enum(["ongoing", "completed", "paused"]),
  pause_reason: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "top"]),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  is_published: z.boolean(),
  author: z.string().optional(),
  author_image: z.string().optional(),
  author_role: z.string().optional(),
  authorMode: z.enum(["manual", "team"]),
}).superRefine((data, ctx) => {
  if (data.authorMode === "manual" && (!data.author || !data.author.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Author name is required", path: ["author"] });
  }
});

export type ProjectFormData = z.infer<typeof projectSchema>;
