import { apiPrivate, apiPublic } from '../ServiceHelper/index';
import type { UnitConversionItem, CreateUnitConversion, UpdateUnitConversion } from '../types/unit-converter.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const UnitConversionAdmin = {
  search: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<UnitConversionItem>>('/admin/unit-conversion', { params }),

  adminGet: (slug: string) =>
    apiPrivate.get<UnitConversionItem>(`/admin/unit-conversion/${slug}`),

  create: (data: CreateUnitConversion) =>
    apiPrivate.post<UnitConversionItem>('/admin/unit-conversion', data),

  update: (slug: string, data: UpdateUnitConversion) =>
    apiPrivate.patch<UnitConversionItem>(`/admin/unit-conversion/${slug}`, data),

  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/unit-conversion/${slug}`),
};

export const UnitConversionPublic = {
  list: (params?: Record<string, unknown>) =>
    apiPublic.get<PaginatedResponse<UnitConversionItem>>('/unit-converter/', { params }),

  get: (slug: string) =>
    apiPublic.get<UnitConversionItem>(`/unit-converter/${slug}/`),
};
