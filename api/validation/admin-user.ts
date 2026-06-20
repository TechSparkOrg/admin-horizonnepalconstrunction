import { z } from "zod";

export const adminUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  password: z.string().optional(),
  currentPassword: z.string().min(1, "Current password is required"),
  staffMemberId: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type AdminUserFormData = z.infer<typeof adminUserSchema>;
