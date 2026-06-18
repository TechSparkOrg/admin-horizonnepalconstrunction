export interface PrivateDocDocumentItem {
  type: "government" | "personal";
  title: string;
  image: string;
}

export interface PrivateDocProposalItem {
  type: "company" | "client";
  title: string;
  document_url?: string;
  agreement_id?: string;
  agreement_name?: string;
}

export interface PrivateDocument {
  id: string;
  title: string;
  slug: string;
  project_id: string | null;
  project_name: string | null;
  documents: PrivateDocDocumentItem[];
  proposals: PrivateDocProposalItem[];
  status: "active" | "inactive";
  contract_closed: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export type PrivateDocumentCreate = Omit<PrivateDocument, "id" | "created_at" | "updated_at">;
export type PrivateDocumentUpdate = Partial<PrivateDocumentCreate>;

export interface PrivateDocumentListParams {
  search?: string;
  page?: number;
  page_size?: number;
}
