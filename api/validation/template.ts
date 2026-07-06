import { z } from "zod";

export const templateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean(),
  content: z.string().optional(),
  masterTemplateFile: z.string().optional(),
  attributeId: z.string().optional(),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
