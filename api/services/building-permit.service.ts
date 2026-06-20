import { apiPrivate } from '../ServiceHelper/index';
import type { BuildingPermitItem, BuildingPermitItemCreate, BuildingPermitItemUpdate } from '../types/building-permit.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const BuildingPermitAdmin = {
  search: (params: { search?: string; type?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<BuildingPermitItem>>('/admin/building-permit', { params }),
  adminGet: (id: string) =>
    apiPrivate.get<BuildingPermitItem>(`/admin/building-permit/${id}`),
  createWorkflowStep: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/workflow-step', data),
  createDocCategory: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/doc-category', data),
  createRegulation: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/regulation', data),
  createMunicipality: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/municipality', data),
  update: (id: string, data: BuildingPermitItemUpdate) =>
    apiPrivate.patch<BuildingPermitItem>(`/admin/building-permit/${id}`, data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/building-permit/${id}`),
};
