import { apiPrivate } from '../ServiceHelper/index';
import type { Project, ProjectCreate, ProjectUpdate, ProjectListParams } from '../types/project.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const ProjectAdmin = {
  list: (params?: ProjectListParams) =>
    apiPrivate.get<PaginatedResponse<Project>>('/admin/projects', { params }),

  adminGet: (slug: string) =>
    apiPrivate.get<Project>(`/admin/projects/${slug}`),

  create: (data: ProjectCreate) =>
    apiPrivate.post<Project>('/admin/projects', data),

  update: (slug: string, data: ProjectUpdate) =>
    apiPrivate.put<Project>(`/admin/projects/${slug}`, data),

  delete: (slug: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/projects/${slug}`),
};
