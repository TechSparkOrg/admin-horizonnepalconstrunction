import { apiPrivate } from '../ServiceHelper/index';
import type { Page, PageCreate, PageUpdate } from '../types/page.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const PageAdmin = {
  list: () =>
    apiPrivate.get<PaginatedResponse<Page>>('/admin/pages/').then(r => r.data),
  adminGet: (slug: string) =>
    apiPrivate.get<Page>(`/admin/pages/${slug}/`).then(r => r.data),
  create: (data: PageCreate) =>
    apiPrivate.post<Page>('/admin/pages/', data).then(r => r.data),
  update: (slug: string, data: PageUpdate) =>
    apiPrivate.put<Page>(`/admin/pages/${slug}/`, data).then(r => r.data),
  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/pages/${slug}/`).then(r => r.data),
};
