import { apiPrivate } from '../ServiceHelper/index';
import type { Category, CategoryCreate, CategoryUpdate } from '../types/category.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const CategoryAdmin = {
  listServices: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/services', { params }).then(r => r.data),

  createService: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/services', data).then(r => r.data),

  updateService: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/services/${id}`, data).then(r => r.data),

  deleteService: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/services/${id}`).then(r => r.data),

  listBlog: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/blog', { params }).then(r => r.data),

  createBlog: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/blog', data).then(r => r.data),

  updateBlog: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/blog/${id}`, data).then(r => r.data),

  deleteBlog: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/blog/${id}`).then(r => r.data),

  listFaq: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/faq', { params }).then(r => r.data),

  createFaq: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/faq', data).then(r => r.data),

  updateFaq: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/faq/${id}`, data).then(r => r.data),

  deleteFaq: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/faq/${id}`).then(r => r.data),

  listProject: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/project', { params }).then(r => r.data),

  createProject: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/project', data).then(r => r.data),

  updateProject: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/project/${id}`, data).then(r => r.data),

  deleteProject: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/project/${id}`).then(r => r.data),
};
