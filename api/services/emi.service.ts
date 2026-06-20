import { apiPrivate } from '../ServiceHelper/index';
import type { Bank, BankCreate, BankUpdate, BankListParams } from '../types/emi.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const EmiBankAdmin = {
  search: (params?: BankListParams) =>
    apiPrivate.get<PaginatedResponse<Bank>>('/admin/emi/banks', { params }),

  get: (id: string) =>
    apiPrivate.get<Bank>(`/admin/emi/banks/${id}`),

  create: (data: BankCreate) =>
    apiPrivate.post<Bank>('/admin/emi/banks', data),

  update: (id: string, data: BankUpdate) =>
    apiPrivate.patch<Bank>(`/admin/emi/banks/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/emi/banks/${id}`),
};
