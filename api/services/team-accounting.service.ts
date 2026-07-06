import { apiPrivate } from '../ServiceHelper/index';
import type { TeamPaymentRecord } from '../types/team-accounting.types';
import type { PaginatedResponse } from '../types/consultation.types';

export interface TeamPaymentListParams {
  staff_member_id: string;
  payment_type?: "salary" | "commission";
}

export const TeamAccountingAdmin = {
  list: (params: TeamPaymentListParams) =>
    apiPrivate.get<PaginatedResponse<TeamPaymentRecord>>('/admin/team-payments', { params }),

  create: (data: Record<string, unknown>) =>
    apiPrivate.post<TeamPaymentRecord>('/admin/team-payments', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiPrivate.patch<TeamPaymentRecord>(`/admin/team-payments/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/team-payments/${id}`),
};
