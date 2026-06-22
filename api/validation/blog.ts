import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  metaTitle: z.string().max(60, "Max 60 characters").optional(),
  metaDescription: z.string().max(160, "Max 160 characters").optional(),
  metaKeywords: z.string().max(255, "Max 255 characters").optional(),
  isActive: z.boolean(),
  isPublished: z.boolean(),
  publishDate: z.string().optional(),
  projectId: z.string().optional(),
  authorMode: z.enum(["manual", "team"]),
  authorName: z.string().optional(),
  authorImage: z.string().optional(),
  authorTeamId: z.string().optional(),
  categoryId: z.string().optional(),
  model3dBlock: z.string().optional(),
  videoBlockUrl: z.string().optional(),
  videoEmbedUrl: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.authorMode === "manual" && !data.authorName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Author name is required",
      path: ["authorName"],
    });
  }
  if (data.authorMode === "team" && !data.authorTeamId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Team member is required",
      path: ["authorTeamId"],
    });
  }
});

export type BlogFormData = z.infer<typeof blogSchema>;
