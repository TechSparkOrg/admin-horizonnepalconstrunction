import { apiPrivate } from '../ServiceHelper/index';
import type { StaffMember, StaffMemberListItem } from '../types/staff.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const StaffAdmin = {
  search: (params: { search?: string; type?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<StaffMemberListItem>>('/admin/staff', { params }),

  adminGet: (id: string) =>
    apiPrivate.get<StaffMember>(`/admin/staff/${id}`),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<StaffMember>('/admin/staff', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<StaffMember>(`/admin/staff/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/staff/${id}`),
};
