import { apiPrivate } from '../ServiceHelper/index';
import type { PrivateDocument, PrivateDocumentCreate, PrivateDocumentUpdate, PrivateDocumentListParams } from '../types/private-document.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const PrivateDocumentAdmin = {
  search: (params?: PrivateDocumentListParams) =>
    apiPrivate.get<PaginatedResponse<PrivateDocument>>('/admin/private-documents', { params }),

  get: (id: string) =>
    apiPrivate.get<PrivateDocument>(`/admin/private-documents/${id}`),

  create: (data: PrivateDocumentCreate) =>
    apiPrivate.post<PrivateDocument>('/admin/private-documents', data),

  update: (id: string, data: PrivateDocumentUpdate) =>
    apiPrivate.patch<PrivateDocument>(`/admin/private-documents/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/private-documents/${id}`),
};
