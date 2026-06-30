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

  uploadToWorker: (uploadUrl: string, file: File, onProgress?: (pct: number) => void) =>
    new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => resolve(new Response(null, { status: xhr.status }));
      xhr.onerror = () => reject(new Error('Upload to Worker failed'));
      xhr.send(file);
    }),

  uploadImage: async (file: File, metadata?: Partial<MediaItemCreate>, onProgress?: (pct: number) => void) => {
    const { upload_url, media } = await MediaService.requestUpload(file.name, metadata);
    const res = await MediaService.uploadToWorker(upload_url, file, onProgress);
    if (!res.ok) throw new Error(`Upload to Worker failed: ${res.status}`);
    return media;
  },

  duplicate: (id: string) =>
    apiPrivate.post<MediaItem>(`/admin/media/${id}/duplicate`),

  scanUsage: () =>
    apiPrivate.post<{ deleted: number; created: number; models_scanned: number }>('/admin/media/scan-usage'),

  getUsageTypes: () =>
    apiPrivate.get<string[]>('/admin/media/usage-types'),

  getUsageDetail: (id: string) =>
    apiPrivate.get<{ total: number; groups: { type: string; label: string; items: { id: string; label: string; field: string }[] }[] }>(`/admin/media/${id}/usage-detail`),

};
