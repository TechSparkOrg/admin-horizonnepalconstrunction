import { apiPrivate } from '../ServiceHelper/index';
import type { BannerGroup, MediaItem, MediaItemCreate, MediaItemUpdate } from '../types/media.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const MediaService = {
  list: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params }),

  listImages: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { group_title: 'Images', ...params } }),

  listVideos: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { group_title: 'Videos', ...params } }),

  listModels: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { group_title: '3D Models', ...params } }),

  listBanners: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<MediaItem>>('/admin/media', { params: { banner: true, ...params } }),

  listBannerGroups: (params?: Record<string, unknown>) =>
    apiPrivate.get<PaginatedResponse<BannerGroup>>('/admin/media/banner-groups', { params }),

  get: (id: string) =>
    apiPrivate.get<MediaItem>(`/admin/media/detail/${id}`),

  create: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', data),

  createImage: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, group_title: 'Images' }),

  createVideo: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, group_title: 'Videos' }),

  createModel: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, group_title: '3D Models' }),

  createBanner: (data: MediaItemCreate) =>
    apiPrivate.post<MediaItem>('/admin/media', { ...data, banner: true }),

  update: (id: string, data: MediaItemUpdate) =>
    apiPrivate.patch<MediaItem>(`/admin/media/update/${id}`, data),

  delete: (id: string) =>
    apiPrivate.delete(`/admin/media/delete/${id}`),

  requestUpload: async (filename: string, metadata?: Partial<MediaItemCreate>) => {
    return await apiPrivate.post<{ upload_url: string; media: MediaItem }>(
      '/admin/media/request-upload',
      { filename, ...metadata }
    );
  },

  uploadToWorker: (uploadUrl: string, file: File) =>
    fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': 'application/octet-stream' } }),

  uploadImage: async (file: File, metadata?: Partial<MediaItemCreate>) => {
    const { upload_url, media } = await MediaService.requestUpload(file.name, metadata);
    const res = await MediaService.uploadToWorker(upload_url, file);
    if (!res.ok) throw new Error(`Upload to Worker failed: ${res.status}`);
    return media;
  },
};
