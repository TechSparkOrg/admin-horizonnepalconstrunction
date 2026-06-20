import { apiPrivate } from '../ServiceHelper/index';
import type { VastuItem, VastuItemCreate, VastuItemUpdate } from '../types/vastu.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const VastuAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<VastuItem>>('/admin/vastu', { params }),
  search: (params: { search?: string; type?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<VastuItem>>('/admin/vastu', { params }),
  adminGet: (id: string) =>
    apiPrivate.get<VastuItem>(`/admin/vastu/${id}`),
  createSection: (data: VastuItemCreate) =>
    apiPrivate.post<VastuItem>('/admin/vastu/section', data),
  createRoom: (data: VastuItemCreate) =>
    apiPrivate.post<VastuItem>('/admin/vastu/room', data),
  createDirection: (data: VastuItemCreate) =>
    apiPrivate.post<VastuItem>('/admin/vastu/direction', data),
  update: (id: string, data: VastuItemUpdate) =>
    apiPrivate.patch<VastuItem>(`/admin/vastu/${id}`, data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/vastu/${id}`),
};
