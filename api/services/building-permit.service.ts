import { apiPrivate } from '../ServiceHelper/index';
import type { BuildingPermitItem, BuildingPermitItemCreate, BuildingPermitItemUpdate } from '../types/building-permit.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const BuildingPermitAdmin = {
  search: (params: { search?: string; type?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<BuildingPermitItem>>('/admin/building-permit', { params }).then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<BuildingPermitItem>(`/admin/building-permit/${id}`).then(r => r.data),
  createWorkflowStep: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/workflow-step', data).then(r => r.data),
  createDocCategory: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/doc-category', data).then(r => r.data),
  createRegulation: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/regulation', data).then(r => r.data),
  createMunicipality: (data: BuildingPermitItemCreate) =>
    apiPrivate.post<BuildingPermitItem>('/admin/building-permit/municipality', data).then(r => r.data),
  update: (id: string, data: BuildingPermitItemUpdate) =>
    apiPrivate.patch<BuildingPermitItem>(`/admin/building-permit/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/building-permit/${id}`).then(r => r.data),
};
