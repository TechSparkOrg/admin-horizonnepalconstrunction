export interface AgreementFormData {
  name: string;
  clientName: string;
  templateId: string;
  variables: Record<string, string>;
  projectId: string;
  status: "draft" | "completed";
}

export interface AgreementItem {
  id: string;
  name: string;
  client_name: string;
  template: string;
  template_name: string;
  variables: Record<string, string>;
  project: string | null;
  project_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const EMPTY_AGREEMENT: AgreementFormData = {
  name: "",
  clientName: "",
  templateId: "",
  variables: {},
  projectId: "",
  status: "draft",
};
