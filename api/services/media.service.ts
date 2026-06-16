import { apiPrivate } from '../ServiceHelper/index';
import type { MediaItem, MediaItemCreate, MediaItemUpdate } from '../types/media.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const MediaService = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params }).then(r => r.data),

  listImages: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { group_title: 'Images', ...params } }).then(r => r.data),

  listVideos: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { group_title: 'Videos', ...params } }).then(r => r.data),

  listModels: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { group_title: '3D Models', ...params } }).then(r => r.data),

  listBanners: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { banner: true, ...params } }).then(r => r.data),

  create: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', data).then(r => r.data),

  createImage: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, group_title: 'Images' }).then(r => r.data),

  createVideo: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, group_title: 'Videos' }).then(r => r.data),

  createModel: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, group_title: '3D Models' }).then(r => r.data),

  createBanner: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, banner: true }).then(r => r.data),

  update: (id: string, data: MediaItemUpdate) =>
    apiPrivate.patch<MediaItem>(`/admin/media/update/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiPrivate.delete(`/admin/media/delete/${id}`).then(r => r.data),

  uploadImage: async (file: File, metadata?: Partial<MediaItemCreate>) => {
    const { upload_url, media } = await apiPrivate.post<{ upload_url: string; media: MediaItem }>(
      '/admin/media/request-upload',
      { filename: file.name, ...metadata }
    ).then(r => r.data);

    await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    return media;
  },
};
