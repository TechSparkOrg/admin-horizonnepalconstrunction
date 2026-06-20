import { z } from "zod";

export const socialLinkSchema = z.object({
  platform: z.enum(["facebook", "instagram", "twitter", "linkedin", "tiktok", "youtube"]),
  url: z.string(),
});

export const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  employeeId: z.string().optional(),
  type: z.enum(["core", "remote"]),
  attributeId: z.string().nullable().optional(),
  designationLabel: z.string().optional(),
  designationValue: z.string().optional(),
  departmentLabel: z.string().optional(),
  departmentValue: z.string().optional(),
  joiningDate: z.string().optional(),
  currentlyWorking: z.boolean(),
  endDate: z.string().optional(),
  photo: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  socialLinks: z.array(socialLinkSchema),
  isActive: z.boolean(),
  showOnPublic: z.boolean(),
});

export type StaffFormData = z.infer<typeof staffSchema>;
