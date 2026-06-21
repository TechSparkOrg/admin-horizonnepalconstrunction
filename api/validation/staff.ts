import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { z } from "zod";

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z.string(),
});

export const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  employeeId: z.string().optional(),
  type: z.enum(["core", "remote"]),
  attributeId: z.string().nullable().optional(),
  designationLabel: z.string().min(1, "Designation label is required"),
  designationValue: z.string().min(1, "Designation is required"),
  departmentLabel: z.string().min(1, "Department label is required"),
  departmentValue: z.string().min(1, "Department is required"),
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
