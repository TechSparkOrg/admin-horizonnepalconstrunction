import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  pricePerUnit: z.union([z.number(), z.literal("")]).optional(),
  attributeId: z.string().nullable().optional(),
  unitValue: z.string().optional(),
  companyValue: z.string().optional(),
  photo: z.string().optional(),
  serviceCategoryId: z.string().nullable().optional(),
  isActive: z.boolean(),
  blogId: z.string().optional(),
});

export type MaterialFormData = z.infer<typeof materialSchema>;
