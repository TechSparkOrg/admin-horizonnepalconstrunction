import { z } from "zod";

export const adminUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  currentPassword: z.string().min(8, "Current password is required for verification"),
  staffMemberId: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type AdminUserFormData = z.infer<typeof adminUserSchema>;
