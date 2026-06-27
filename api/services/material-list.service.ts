import { apiPrivate } from '../ServiceHelper/index';
import type { MaterialItem, CreateMaterial, UpdateMaterial } from '../types/material-list.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const MaterialListAdmin = {
  search: (params: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MaterialItem>>('/admin/material-list', { params }),

  adminGet: (slug: string) =>
    apiPrivate.get<MaterialItem>(`/admin/material-list/${slug}`),

  create: (data: CreateMaterial) =>
    apiPrivate.post<MaterialItem>('/admin/material-list', data),

  update: (slug: string, data: UpdateMaterial) =>
    apiPrivate.patch<MaterialItem>(`/admin/material-list/${slug}`, data),

  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/material-list/${slug}`),
};
