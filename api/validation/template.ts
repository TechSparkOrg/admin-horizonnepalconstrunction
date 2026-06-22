import { z } from "zod";

export const templateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean(),
  backgroundImage: z.boolean(),
  backgroundImageUrl: z.string().optional(),
  showStamp: z.boolean(),
  stampImageUrl: z.string().optional(),
  showSignature: z.boolean(),
  signatureImageUrl: z.string().optional(),
  content: z.string().optional(),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
