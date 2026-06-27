import { z } from "zod";

export const conversionRuleSchema = z.object({
  to: z.string(),
  factor: z.number(),
});

export const unitConverterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  attributeId: z.string().nullable().optional(),
  fieldLabel: z.string().optional(),
  baseUnit: z.string().optional(),
  conversions: z.array(conversionRuleSchema),
  isActive: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  bannerUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export type UnitConverterFormData = z.infer<typeof unitConverterSchema>;
