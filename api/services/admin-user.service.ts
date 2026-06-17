import { apiPrivate } from '../ServiceHelper/index';
import type { AdminUser } from '../types/admin-user.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const AdminUserAdmin = {
  search: (params: { search?: string; role?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<AdminUser>>('/admin/admin-users', { params }).then(r => r.data),

  adminGet: (id: string) =>
    apiPrivate.get<AdminUser>(`/admin/admin-users/${id}`).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<AdminUser>('/admin/admin-users', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<AdminUser>(`/admin/admin-users/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/admin-users/${id}`).then(r => r.data),
};
