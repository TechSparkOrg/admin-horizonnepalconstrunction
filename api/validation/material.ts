import { z } from "zod";

const variantItemSchema = z.object({
  id: z.string(),
  img: z.string(),
  price: z.number(),
  market_name: z.string(),
});

export const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  pricePerUnit: z.union([z.number(), z.literal("")]).optional(),
  unitValue: z.string().optional(),
  companyId: z.string().nullable().optional(),
  logo: z.string().optional(),
  serviceCategoryId: z.string().nullable().optional(),
  faqCategoryId: z.string().nullable().optional(),
  faqGroupSlug: z.string().optional(),
  variants: z.array(variantItemSchema).optional(),
  isActive: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  bannerImages: z.array(z.any()).optional(),
  videoUrl: z.string().optional(),
});

export type MaterialFormData = z.infer<typeof materialSchema>;
