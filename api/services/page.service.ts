import { apiPrivate } from '../ServiceHelper/index';
import type { Page, PageCreate, PageUpdate } from '../types/page.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const PageAdmin = {
  list: () =>
    apiPrivate.get<PaginatedResponse<Page>>('/admin/pages'),
  adminGet: (slug: string) =>
    apiPrivate.get<Page>(`/admin/pages/${slug}`),
  create: (data: PageCreate) =>
    apiPrivate.post<Page>('/admin/pages', data),
  update: (slug: string, data: PageUpdate) =>
    apiPrivate.put<Page>(`/admin/pages/${slug}`, data),
  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/pages/${slug}`),
};
