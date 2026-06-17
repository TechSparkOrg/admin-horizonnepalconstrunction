import { apiPrivate } from '../ServiceHelper/index';
import type { StaffMember } from '../types/staff.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const StaffAdmin = {
  search: (params: { search?: string; type?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<StaffMember>>('/admin/staff', { params }).then(r => r.data),

  adminGet: (id: string) =>
    apiPrivate.get<StaffMember>(`/admin/staff/${id}`).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<StaffMember>('/admin/staff', data).then(r => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<StaffMember>(`/admin/staff/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/staff/${id}`).then(r => r.data),
};
