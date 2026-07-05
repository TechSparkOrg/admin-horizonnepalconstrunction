import { apiPrivate } from '../ServiceHelper/index';
import type { TemplateItem } from '../types/template.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const TemplateAdmin = {
  search: (params: { attribute_id?: string; search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<TemplateItem>>('/admin/templates', { params }),

  get: (id: string) =>
    apiPrivate.get<TemplateItem>(`/admin/templates/${id}`),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<TemplateItem>('/admin/templates', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<TemplateItem>(`/admin/templates/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/templates/${id}`),

  previewHtml: (
    id: string,
    vars?: Record<string, string>,
    data?: {
      materials?: Array<{ name: string; variant: string; price: number; qty: number; total: number; group: string }>;
      team?: Array<{ name: string; role: string; rate: number; hours: number; days: number; total: number; group: string }>;
      taxes?: Array<{ label: string; rate_display: string; type: string; amount: number }>;
    }
  ) =>
    apiPrivate.post<string>(`/admin/templates/${id}/preview`, { ...(vars ?? {}), ...(data ?? {}) }),
};
