import { apiPrivate } from '../ServiceHelper/index';
import type { BuildingPermit, BuildingPermitCreate, BuildingPermitUpdate } from '../types/building-permit.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const BuildingPermitAdmin = {
  search: (params: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<BuildingPermit>>('/admin/building-permit', { params }),
  adminGet: (id: string) =>
    apiPrivate.get<BuildingPermit>(`/admin/building-permit/${id}`),
  create: (data: BuildingPermitCreate) =>
    apiPrivate.post<BuildingPermit>('/admin/building-permit', data),
  update: (id: string, data: BuildingPermitUpdate) =>
    apiPrivate.patch<BuildingPermit>(`/admin/building-permit/${id}`, data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/building-permit/${id}`),
};
