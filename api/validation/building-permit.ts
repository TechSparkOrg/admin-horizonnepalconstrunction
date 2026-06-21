import { z } from "zod";

const bilingualPairSchema = z.object({
  en: z.string(),
  np: z.string(),
});

const documentExampleSchema = z.object({
  document_name: z.string(),
  image_url: z.string(),
});

export const buildingPermitSchema = z.object({
  type: z.enum(["workflow_step", "doc_category", "regulation", "municipality"]),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  order: z.number(),
  isActive: z.boolean(),
  stepNumber: z.number(),
  description: bilingualPairSchema,
  duration: z.string().optional(),
  documents: z.array(z.string()),
  label: bilingualPairSchema,
  items: z.array(bilingualPairSchema),
  district: z.string().optional(),
  phone: z.string().optional(),
  documentExamples: z.array(documentExampleSchema),
  metaTitle: z.string().max(60, "Max 60 characters").optional(),
  metaKeywords: z.string().max(255, "Max 255 characters").optional(),
  metaDescription: z.string().max(160, "Max 160 characters").optional(),
});

export type BuildingPermitFormData = z.infer<typeof buildingPermitSchema>;
