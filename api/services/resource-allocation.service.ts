import { apiPrivate } from '../ServiceHelper/index';
import type { TeamAllocation } from '../types/resource-allocation.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const TeamAllocationAdmin = {
  list: (params?: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<TeamAllocation>>('/admin/team-allocations', { params }).then(r => r.data),

  adminGet: (id: string) =>
    apiPrivate.get<TeamAllocation>(`/admin/team-allocations/${id}`).then(r => r.data),

  create: (data: Partial<TeamAllocation>) =>
    apiPrivate.post<TeamAllocation>('/admin/team-allocations', data).then(r => r.data),

  update: (id: string, data: Partial<TeamAllocation>) =>
    apiPrivate.put<TeamAllocation>(`/admin/team-allocations/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/team-allocations/${id}`).then(r => r.data),
};
