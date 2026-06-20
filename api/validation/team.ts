import { z } from "zod";

export const salaryEntrySchema = z.object({
  id: z.string(),
  amount: z.number(),
  effective_date: z.string(),
  status: z.enum(["paid", "unpaid"]),
});

export const projectBasisEntrySchema = z.object({
  id: z.string(),
  project_id: z.string(),
  budget_plan: z.number(),
  payment_condition: z.string(),
  progress_rate: z.number(),
  status: z.enum(["ongoing", "completed"]),
  workers_under: z.number(),
});

export const projectAssignmentSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  status: z.enum(["ongoing", "completed"]),
});

export const teamAllocationSchema = z.object({
  staff_member_id: z.string().min(1, "Staff member is required"),
  user_type: z.enum(["core", "remote"]),
  pay_type: z.enum(["salary", "project-based"]),
  is_active: z.boolean(),
  notes: z.string().optional(),
});

export type TeamAllocationFormData = z.infer<typeof teamAllocationSchema>;
