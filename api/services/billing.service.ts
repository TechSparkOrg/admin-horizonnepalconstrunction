import { apiPrivate } from '../ServiceHelper/index';
import type { BillingCalculation } from '../types/billing.types';
import type { PaginatedResponse } from '../types/consultation.types';

export interface BillingListParams {
  search?: string;
  page?: number;
  page_size?: number;
}

export const BillingAdmin = {
  list: (params?: BillingListParams) =>
    apiPrivate.get<PaginatedResponse<BillingCalculation>>('/admin/billing-calculations', { params }),

  adminGet: (id: string) =>
    apiPrivate.get<BillingCalculation>(`/admin/billing-calculations/${id}`),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<BillingCalculation>('/admin/billing-calculations', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<BillingCalculation>(`/admin/billing-calculations/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/billing-calculations/${id}`),
};
