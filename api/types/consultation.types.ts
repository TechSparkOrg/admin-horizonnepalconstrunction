export interface ConsultationSettings {
  section_label: string;
  heading: string;
  description: string;
  form_title: string;
  service_options: string[];
  privacy_text: string;
  success_heading: string;
  success_message: string;
  created_at: string;
  updated_at: string;
}

export type ConsultationSettingsUpdate = Partial<ConsultationSettings>;

export interface ConsultationSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  preferred_date: string;
  created_at: string;
}

export interface ApiResponse {
  ok: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
