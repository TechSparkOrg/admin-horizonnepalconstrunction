import { apiPrivate } from '../ServiceHelper/index';
import type { Category, CategoryCreate, CategoryUpdate } from '../types/category.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const CategoryAdmin = {
  listServices: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/services', { params }),

  createService: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/services', data),

  updateService: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/services/${id}`, data),

  deleteService: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/services/${id}`),

  listBlog: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/blog', { params }),

  createBlog: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/blog', data),

  updateBlog: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/blog/${id}`, data),

  deleteBlog: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/blog/${id}`),

  listFaq: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/faq', { params }),

  createFaq: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/faq', data),

  updateFaq: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/faq/${id}`, data),

  deleteFaq: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/faq/${id}`),

  listProject: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<Category>>('/admin/categories/project', { params }),

  createProject: (data: CategoryCreate) =>
    apiPrivate.post<Category>('/admin/categories/project', data),

  updateProject: (id: string, data: CategoryUpdate) =>
    apiPrivate.put<Category>(`/admin/categories/project/${id}`, data),

  deleteProject: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/categories/project/${id}`),
};
