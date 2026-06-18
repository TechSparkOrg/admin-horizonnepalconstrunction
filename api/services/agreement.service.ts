import { apiPrivate } from '../ServiceHelper/index';
import type { AgreementItem } from '../types/agreement.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const AgreementAdmin = {
  search: (params: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<AgreementItem>>('/admin/agreements', { params }).then(r => r.data),

  get: (id: string) =>
    apiPrivate.get<AgreementItem>(`/admin/agreements/${id}`).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<AgreementItem>('/admin/agreements', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<AgreementItem>(`/admin/agreements/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/agreements/${id}`).then(r => r.data),
};
