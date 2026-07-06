import { apiPrivate } from '../ServiceHelper/index';
import type { FaqGroup, FaqGroupCreate, FaqGroupUpdate, FaqSelectorItem } from '../types/faq.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const FaqAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<FaqGroup>>('/admin/faq', { params }),
  adminGet: (id: string) =>
    apiPrivate.get<FaqGroup>(`/admin/faq/${id}`),
  create: (data: FaqGroupCreate) =>
    apiPrivate.post<FaqGroup>('/admin/faq', data),
  update: (id: string, data: FaqGroupUpdate) =>
    apiPrivate.put<FaqGroup>(`/admin/faq/${id}`, data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/faq/${id}`),
  selector: () =>
    apiPrivate.get<FaqSelectorItem[]>('/admin/faq/selector'),
};
