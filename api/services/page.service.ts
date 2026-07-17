import { apiPrivate } from '../ServiceHelper/index';
import type { PageListItem, PageDetail, PageCreate, PageUpdate } from '../types/page.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const PageAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<PageListItem>>('/admin/pages', { params }),
  adminGet: (slug: string) =>
    apiPrivate.get<PageDetail>(`/admin/pages/${slug}`),
  create: (data: PageCreate) =>
    apiPrivate.post<PageDetail>('/admin/pages', data),
  update: (slug: string, data: PageUpdate) =>
    apiPrivate.put<PageDetail>(`/admin/pages/${slug}`, data),
  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/pages/${slug}`),
};
