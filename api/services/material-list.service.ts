import { apiPrivate } from '../ServiceHelper/index';
import type { MaterialItem, CreateMaterial, UpdateMaterial } from '../types/material-list.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const MaterialListAdmin = {
  search: (params: { search?: string; unit_type?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<MaterialItem>>('/admin/material-list', { params }),

  adminGet: (id: string) =>
    apiPrivate.get<MaterialItem>(`/admin/material-list/${id}`),

  create: (data: CreateMaterial) =>
    apiPrivate.post<MaterialItem>('/admin/material-list', data),

  update: (id: string, data: UpdateMaterial) =>
    apiPrivate.patch<MaterialItem>(`/admin/material-list/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/material-list/${id}`),
};
