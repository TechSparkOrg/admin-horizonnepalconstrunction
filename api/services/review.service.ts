import { apiPrivate } from '../ServiceHelper/index';
import type { Review, ReviewCreate, ReviewUpdate } from '../types/review.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const ReviewAdmin = {
  list: () =>
    apiPrivate.get<PaginatedResponse<Review>>('/admin/reviews/').then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<Review>(`/admin/reviews/${id}/`).then(r => r.data),
  create: (data: ReviewCreate) =>
    apiPrivate.post<Review>('/admin/reviews/', data).then(r => r.data),
  update: (id: string, data: ReviewUpdate) =>
    apiPrivate.put<Review>(`/admin/reviews/${id}/`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/reviews/${id}/`).then(r => r.data),
};
