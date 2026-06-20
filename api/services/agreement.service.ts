import { apiPrivate } from '../ServiceHelper/index';
import type { AgreementItem } from '../types/agreement.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const AgreementAdmin = {
  search: (params: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<AgreementItem>>('/admin/agreements', { params }),

  get: (id: string) =>
    apiPrivate.get<AgreementItem>(`/admin/agreements/${id}`),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<AgreementItem>('/admin/agreements', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<AgreementItem>(`/admin/agreements/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/agreements/${id}`),
};
