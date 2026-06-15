import { apiPrivate } from '../ServiceHelper/index';
import type { PageSection, PageSectionCreate, PageSectionUpdate } from '../types/page.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const PageSectionAdmin = {
  list: (pageSlug?: string) =>
    apiPrivate.get<PaginatedResponse<PageSection>>(`/admin/page-sections/${pageSlug ? `?page=${pageSlug}` : ''}`).then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<PageSection>(`/admin/page-sections/${id}/`).then(r => r.data),
  create: (data: PageSectionCreate) =>
    apiPrivate.post<PageSection>('/admin/page-sections/', data).then(r => r.data),
  update: (id: string, data: PageSectionUpdate) =>
    apiPrivate.put<PageSection>(`/admin/page-sections/${id}/`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/page-sections/${id}/`).then(r => r.data),
};
