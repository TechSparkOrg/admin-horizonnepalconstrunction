import { apiPrivate } from '../ServiceHelper/index';
import type { PermissionGroup, RoleItem, RoleDetail } from '../types/permission.types';

export const PermissionAdmin = {
  listPermissions: () =>
    apiPrivate.get<PermissionGroup[]>('/admin/permissions').then(r => r.data),

  search: () =>
    apiPrivate.get<RoleItem[]>('/admin/roles').then(r => r.data),

  get: (id: number) =>
    apiPrivate.get<RoleDetail>(`/admin/roles/${id}`).then(r => r.data),

  create: (data: { name: string; permission_ids: number[] }) =>
    apiPrivate.post<RoleDetail>('/admin/roles', data).then(r => r.data),

  update: (id: number, data: { name: string; permission_ids: number[] }) =>
    apiPrivate.patch<RoleDetail>(`/admin/roles/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/roles/${id}`).then(r => r.data),
};
