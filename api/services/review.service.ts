import { apiPrivate } from '../ServiceHelper/index';
import type { AdminReview, AdminReviewCreate, AdminReviewUpdate } from '../types/review.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const ReviewAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<AdminReview>>('/admin/reviews', { params }),
  get: (id: string) =>
    apiPrivate.get<AdminReview>(`/admin/reviews/${id}`),
  create: (data: AdminReviewCreate) =>
    apiPrivate.post<AdminReview>('/admin/reviews', data),
  update: (id: string, data: AdminReviewUpdate) =>
    apiPrivate.put<AdminReview>(`/admin/reviews/${id}`, data),
  patchStatus: (id: string, status: AdminReview["status"]) =>
    apiPrivate.patch<AdminReview>(`/admin/reviews/${id}/status`, { status }),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/reviews/${id}`),
};
