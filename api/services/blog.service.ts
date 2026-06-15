import { apiPrivate } from '../ServiceHelper/index';
import type { BlogPost, BlogPostCreate, BlogPostUpdate } from '../types/blog.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const BlogAdmin = {
  list: (page?: number) =>
    apiPrivate.get<PaginatedResponse<BlogPost>>('/admin/blogs/', {
      params: page ? { page } : {},
    }).then(r => r.data),
  adminGet: (slug: string) =>
    apiPrivate.get<BlogPost>(`/admin/blogs/${slug}/`).then(r => r.data),
  create: (data: BlogPostCreate) =>
    apiPrivate.post<BlogPost>('/admin/blogs/', data).then(r => r.data),
  update: (slug: string, data: BlogPostUpdate) =>
    apiPrivate.put<BlogPost>(`/admin/blogs/${slug}/`, data).then(r => r.data),
  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/blogs/${slug}/`).then(r => r.data),
};
