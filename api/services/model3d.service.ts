import { apiPrivate } from '../ServiceHelper/index';
import type { ModelItem, ModelItemCreate, ModelItemUpdate } from '../types/model3d.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const Model3dAdmin = {
  list: () =>
    apiPrivate.get<PaginatedResponse<ModelItem>>('/admin/models/').then(r => r.data),
  create: (data: ModelItemCreate) =>
    apiPrivate.post<ModelItem>('/admin/models/', data).then(r => r.data),
  update: (id: string, data: ModelItemUpdate) =>
    apiPrivate.put<ModelItem>(`/admin/models/${id}/`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/models/${id}/`).then(r => r.data),
  uploadModel: (file: File, metadata?: Partial<ModelItemCreate>) => {
    const fd = new FormData();
    fd.append('file', file);
    if (metadata) {
      if (metadata.title) fd.append('title', metadata.title);
      if (metadata.slug) fd.append('slug', metadata.slug);
      if (metadata.description) fd.append('description', metadata.description);
      if (metadata.meta_title) fd.append('meta_title', metadata.meta_title);
      if (metadata.meta_description) fd.append('meta_description', metadata.meta_description);
      if (metadata.keywords) fd.append('keywords', metadata.keywords);
      if (metadata.project_id) fd.append('project_id', metadata.project_id);
    }
    return apiPrivate.post<ModelItem>('/admin/models/upload/', fd, { headers: { 'Content-Type': null } }).then(r => r.data);
  },
};
