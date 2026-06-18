import { apiPrivate } from '../ServiceHelper/index';
import type { Bank, BankCreate, BankUpdate, BankListParams } from '../types/emi.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const EmiBankAdmin = {
  search: (params?: BankListParams) =>
    apiPrivate.get<PaginatedResponse<Bank>>('/admin/emi/banks', { params }).then(r => r.data),

  get: (id: string) =>
    apiPrivate.get<Bank>(`/admin/emi/banks/${id}`).then(r => r.data),

  create: (data: BankCreate) =>
    apiPrivate.post<Bank>('/admin/emi/banks', data).then(r => r.data),

  update: (id: string, data: BankUpdate) =>
    apiPrivate.patch<Bank>(`/admin/emi/banks/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/emi/banks/${id}`).then(r => r.data),
};
