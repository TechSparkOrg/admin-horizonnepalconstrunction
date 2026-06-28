import { apiPrivate } from '../ServiceHelper/index';
import type { ConsultationSubmission } from '../types/consultation.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const ConsultationAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<ConsultationSubmission>>('/admin/consultation/submissions', { params }),
  adminGet: (id: string) =>
    apiPrivate.get<ConsultationSubmission>(`/admin/consultation/submissions/${id}`),
  markRead: (id: string) =>
    apiPrivate.patch<ConsultationSubmission>(`/admin/consultation/submissions/${id}`, { is_read: true }),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/consultation/submissions/${id}`),
};
