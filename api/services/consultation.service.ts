import { apiPrivate } from '../ServiceHelper/index';
import type { ConsultationSettings, ConsultationSettingsUpdate, ConsultationSubmission, ApiResponse } from '../types/consultation.types';

export const ConsultationAdmin = {
  getSettings: () =>
    apiPrivate.get<ConsultationSettings>('/admin/consultation/settings/').then(r => r.data),
  updateSettings: (data: ConsultationSettingsUpdate) =>
    apiPrivate.put<ConsultationSettings>('/admin/consultation/settings/', data).then(r => r.data),
  listSubmissions: () =>
    apiPrivate.get<ConsultationSubmission[]>('/admin/consultation/submissions/').then(r => r.data),
  getSubmission: (id: string) =>
    apiPrivate.get<ConsultationSubmission>(`/admin/consultation/submissions/${id}/`).then(r => r.data),
  deleteSubmission: (id: string) =>
    apiPrivate.delete<ApiResponse>(`/admin/consultation/submissions/${id}/`).then(r => r.data),
};
