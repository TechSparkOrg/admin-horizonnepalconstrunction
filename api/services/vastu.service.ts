import { apiPrivate } from '../ServiceHelper/index';
import type { VastuItem, VastuItemCreate, VastuItemUpdate } from '../types/vastu.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const VastuAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<VastuItem>>('/admin/vastu', { params }).then(r => r.data),
  search: (params: { search?: string; type?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<VastuItem>>('/admin/vastu', { params }).then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<VastuItem>(`/admin/vastu/${id}`).then(r => r.data),
  createSection: (data: VastuItemCreate) =>
    apiPrivate.post<VastuItem>('/admin/vastu/section', data).then(r => r.data),
  createRoom: (data: VastuItemCreate) =>
    apiPrivate.post<VastuItem>('/admin/vastu/room', data).then(r => r.data),
  createDirection: (data: VastuItemCreate) =>
    apiPrivate.post<VastuItem>('/admin/vastu/direction', data).then(r => r.data),
  update: (id: string, data: VastuItemUpdate) =>
    apiPrivate.patch<VastuItem>(`/admin/vastu/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/vastu/${id}`).then(r => r.data),
};
