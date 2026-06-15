import { apiPrivate } from '../ServiceHelper/index';
import type { FaqItem, FaqItemCreate, FaqItemUpdate } from '../types/faq.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const FaqAdmin = {
  list: () =>
    apiPrivate.get<PaginatedResponse<FaqItem>>('/admin/faq/').then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<FaqItem>(`/admin/faq/${id}/`).then(r => r.data),
  create: (data: FaqItemCreate) =>
    apiPrivate.post<FaqItem>('/admin/faq/', data).then(r => r.data),
  update: (id: string, data: FaqItemUpdate) =>
    apiPrivate.put<FaqItem>(`/admin/faq/${id}/`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/faq/${id}/`).then(r => r.data),
};
