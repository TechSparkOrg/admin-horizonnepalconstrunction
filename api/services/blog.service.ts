import { apiPrivate } from '../ServiceHelper/index';
import type { BlogPost, BlogPostCreate, BlogPostUpdate } from '../types/blog.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const BlogAdmin = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<BlogPost>>('/admin/blogs', { params }),
  adminGet: (slug: string) =>
    apiPrivate.get<BlogPost>(`/admin/blogs/${slug}`),
  create: (data: BlogPostCreate) =>
    apiPrivate.post<BlogPost>('/admin/blogs', data),
  update: (slug: string, data: BlogPostUpdate) =>
    apiPrivate.put<BlogPost>(`/admin/blogs/${slug}`, data),
  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/blogs/${slug}`),
};
