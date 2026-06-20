import { apiPrivate } from '../ServiceHelper/index';
import type { UnitConversionItem, CreateUnitConversion, UpdateUnitConversion } from '../types/unit-converter.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const UnitConversionAdmin = {
  search: (params: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<UnitConversionItem>>('/admin/unit-conversion', { params }),

  adminGet: (id: string) =>
    apiPrivate.get<UnitConversionItem>(`/admin/unit-conversion/${id}`),

  create: (data: CreateUnitConversion) =>
    apiPrivate.post<UnitConversionItem>('/admin/unit-conversion', data),

  update: (id: string, data: UpdateUnitConversion) =>
    apiPrivate.patch<UnitConversionItem>(`/admin/unit-conversion/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/unit-conversion/${id}`),
};
