import { apiPrivate } from '../ServiceHelper/index';
import type { TeamAllocation } from '../types/resource-allocation.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const TeamAllocationAdmin = {
  list: (params?: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<TeamAllocation>>('/admin/team-allocations', { params }),

  adminGet: (id: string) =>
    apiPrivate.get<TeamAllocation>(`/admin/team-allocations/${id}`),

  create: (data: Partial<TeamAllocation>) =>
    apiPrivate.post<TeamAllocation>('/admin/team-allocations', data),

  update: (id: string, data: Partial<TeamAllocation>) =>
    apiPrivate.put<TeamAllocation>(`/admin/team-allocations/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/team-allocations/${id}`),
};
