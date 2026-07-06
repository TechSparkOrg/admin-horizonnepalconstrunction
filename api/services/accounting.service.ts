import { apiPrivate } from '../ServiceHelper/index';
import type { AccountingEntry, DashboardDataPoint } from '../types/accounting.types';
import type { PaginatedResponse } from '../types/consultation.types';

export interface AccountingListParams {
  project_id: string;
  type?: "income" | "expense";
}

export const AccountingAdmin = {
  list: (params: AccountingListParams) =>
    apiPrivate.get<PaginatedResponse<AccountingEntry>>('/admin/accounting', { params }),

  adminGet: (id: string) =>
    apiPrivate.get<AccountingEntry>(`/admin/accounting/${id}`),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<AccountingEntry>('/admin/accounting', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<AccountingEntry>(`/admin/accounting/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/accounting/${id}`),

  dashboard: (days = 30) =>
    apiPrivate.get<{ data: DashboardDataPoint[] }>('/admin/accounting/dashboard', { params: { days } }),
};
