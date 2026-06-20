import { apiPrivate } from '../ServiceHelper/index';
import type { DocumentItem } from '../types/document.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const DocumentAdmin = {
  search: (params: { search?: string; page?: number; page_size?: number }) =>
    apiPrivate.get<PaginatedResponse<DocumentItem>>('/admin/documents', { params }),
};
