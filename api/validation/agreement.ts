import { z } from "zod";

export const agreementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientName: z.string().optional(),
  templateId: z.string().min(1, "Template is required"),
  variables:z.record(z.string(), z.string()),
  projectId: z.string().optional(),
  status: z.enum(["draft", "completed"]),
});

export type AgreementFormData = z.infer<typeof agreementSchema>;
