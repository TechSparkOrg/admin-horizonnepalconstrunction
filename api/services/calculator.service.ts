import { apiPrivate } from '../ServiceHelper/index';
import type { CalcBuildingType, CalcMaterial, CalcMaterialCreate, CalcMaterialUpdate } from '../types/calculator.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const CalculatorAdmin = {
  listBuildingTypes: () =>
    apiPrivate.get<CalcBuildingType[]>('/admin/calculator/building-types/').then(r => r.data),
  createBuildingType: (name: string) =>
    apiPrivate.post<CalcBuildingType>('/admin/calculator/building-types/', { name }).then(r => r.data),
  deleteBuildingType: (name: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/calculator/building-types/${name}/`).then(r => r.data),
  listMaterials: () =>
    apiPrivate.get<PaginatedResponse<CalcMaterial>>('/admin/calculator/materials/').then(r => r.data),
  createMaterial: (data: CalcMaterialCreate) =>
    apiPrivate.post<CalcMaterial>('/admin/calculator/materials/', data).then(r => r.data),
  updateMaterial: (id: string, data: CalcMaterialUpdate) =>
    apiPrivate.put<CalcMaterial>(`/admin/calculator/materials/${id}/`, data).then(r => r.data),
  deleteMaterial: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/calculator/materials/${id}/`).then(r => r.data),
};
