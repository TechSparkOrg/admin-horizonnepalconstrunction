import { apiPrivate } from '../ServiceHelper/index';
import type { ReviewGroup, ReviewGroupCreate, ReviewGroupUpdate } from '../types/review.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const ReviewAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<ReviewGroup>>('/admin/reviews/', { params }).then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<ReviewGroup>(`/admin/reviews/${id}/`).then(r => r.data),
  create: (data: ReviewGroupCreate) =>
    apiPrivate.post<ReviewGroup>('/admin/reviews/', data).then(r => r.data),
  update: (id: string, data: ReviewGroupUpdate) =>
    apiPrivate.put<ReviewGroup>(`/admin/reviews/${id}/`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/reviews/${id}/`).then(r => r.data),
};
