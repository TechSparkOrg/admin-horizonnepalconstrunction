import { apiPrivate } from '../ServiceHelper/index';
import type { FaqGroup, FaqGroupCreate, FaqGroupUpdate } from '../types/faq.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const FaqAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<FaqGroup>>('/admin/faq/', { params }).then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<FaqGroup>(`/admin/faq/${id}/`).then(r => r.data),
  create: (data: FaqGroupCreate) =>
    apiPrivate.post<FaqGroup>('/admin/faq/', data).then(r => r.data),
  update: (id: string, data: FaqGroupUpdate) =>
    apiPrivate.put<FaqGroup>(`/admin/faq/${id}/`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/faq/${id}/`).then(r => r.data),
};
