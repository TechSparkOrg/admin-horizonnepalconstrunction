import { apiPrivate } from '../ServiceHelper/index';
import type { AttributeItem, CreateAttribute, UpdateAttribute } from '../types/attribute.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const AttributeAdmin = {
  search: (params: { search?: string; used_in?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<AttributeItem>>('/admin/attributes', { params }).then(r => r.data),

  adminGet: (id: string) =>
    apiPrivate.get<AttributeItem>(`/admin/attributes/${id}`).then(r => r.data),

  create: (data: CreateAttribute) =>
    apiPrivate.post<AttributeItem>('/admin/attributes', data).then(r => r.data),

  update: (id: string, data: UpdateAttribute) =>
    apiPrivate.patch<AttributeItem>(`/admin/attributes/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/attributes/${id}`).then(r => r.data),
};
