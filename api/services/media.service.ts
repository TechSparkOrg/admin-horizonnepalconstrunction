import { apiPrivate } from '../ServiceHelper/index';
import type { MediaItem, MediaItemCreate, MediaItemUpdate } from '../types/media.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const MediaService = {
  list: (page?: number) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media/', { params: page ? { page } : {} }).then(r => r.data),

  create: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media/', data).then(r => r.data),

  update: (id: string, data: MediaItemUpdate) =>
    apiPrivate.put<MediaItem>(`/admin/media/${id}/`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/media/${id}/`).then(r => r.data),

  uploadImage: (file: File, metadata?: Partial<MediaItemCreate>) => {
    const fd = new FormData();
    fd.append('file', file);
    if (metadata) {
      if (metadata.alt) fd.append('alt', metadata.alt);
      if (metadata.meta_title) fd.append('meta_title', metadata.meta_title);
      if (metadata.description) fd.append('description', metadata.description);
      if (metadata.keywords) fd.append('keywords', metadata.keywords);
      if (metadata.project_link) fd.append('project_link', metadata.project_link);
      if (metadata.banner !== undefined) fd.append('banner', String(metadata.banner));
      if (metadata.group_title) fd.append('group_title', metadata.group_title);
      if (metadata.custom_fields) fd.append('custom_fields', JSON.stringify(metadata.custom_fields));
    }
    return apiPrivate.post<MediaItem>('/admin/media/upload/', fd, { headers: { 'Content-Type': null } }).then(r => r.data);
  },
};
