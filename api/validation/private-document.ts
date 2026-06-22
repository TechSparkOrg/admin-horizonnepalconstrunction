import { z } from "zod";

export const privateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  project_id: z.string().optional(),
  documents: z.array(z.object({
    type: z.enum(["government", "personal"]),
    title: z.string(),
    image: z.string(),
  })),
  proposals: z.array(z.object({
    type: z.enum(["company", "client"]),
    title: z.string(),
    document_url: z.string().optional(),
    agreement_id: z.string().optional(),
    agreement_name: z.string().optional(),
  })),
  status: z.enum(["active", "inactive"]),
  contract_closed: z.boolean(),
  date: z.string(),
});

export type PrivateDocumentFormData = z.infer<typeof privateDocumentSchema>;
