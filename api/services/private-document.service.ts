import { apiPrivate } from '../ServiceHelper/index';
import type { PrivateDocument, PrivateDocumentCreate, PrivateDocumentUpdate, PrivateDocumentListParams } from '../types/private-document.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const PrivateDocumentAdmin = {
  search: (params?: PrivateDocumentListParams) =>
    apiPrivate.get<PaginatedResponse<PrivateDocument>>('/admin/private-documents', { params }).then(r => r.data),

  get: (id: string) =>
    apiPrivate.get<PrivateDocument>(`/admin/private-documents/${id}`).then(r => r.data),

  create: (data: PrivateDocumentCreate) =>
    apiPrivate.post<PrivateDocument>('/admin/private-documents', data).then(r => r.data),

  update: (id: string, data: PrivateDocumentUpdate) =>
    apiPrivate.patch<PrivateDocument>(`/admin/private-documents/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/private-documents/${id}`).then(r => r.data),
};
