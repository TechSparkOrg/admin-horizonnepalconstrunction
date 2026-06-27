import { apiPrivate } from '../ServiceHelper/index';
import type { Vendor, CreateVendor, UpdateVendor } from '../types/vendor.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const VendorAdmin = {
  search: (params: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<Vendor>>('/admin/vendors', { params }),

  get: (id: string) =>
    apiPrivate.get<Vendor>(`/admin/vendors/${id}`),

  create: (data: CreateVendor) =>
    apiPrivate.post<Vendor>('/admin/vendors', data),

  update: (id: string, data: UpdateVendor) =>
    apiPrivate.patch<Vendor>(`/admin/vendors/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/vendors/${id}`),
};
