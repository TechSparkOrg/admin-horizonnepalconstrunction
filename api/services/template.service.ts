import { apiPrivate } from '../ServiceHelper/index';
import type { TemplateItem } from '../types/template.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const TemplateAdmin = {
  search: (params: { attribute_id?: string; search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<TemplateItem>>('/admin/templates', { params }).then(r => r.data),

  get: (id: string) =>
    apiPrivate.get<TemplateItem>(`/admin/templates/${id}`).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<TemplateItem>('/admin/templates', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<TemplateItem>(`/admin/templates/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/templates/${id}`).then(r => r.data),
};
