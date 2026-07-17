import { apiPrivate } from '../ServiceHelper/index';
import type { PermissionGroup, RoleItem, RoleDetail, RoleConfig, RoleOptionItem } from '../types/permission.types';

export const PermissionAdmin = {
  listPermissions: () =>
    apiPrivate.get<PermissionGroup[]>('/admin/permissions'),

  getRoleConfig: () =>
    apiPrivate.get<RoleConfig[]>('/admin/role-config'),

  getRoleOptions: () =>
    apiPrivate.get<RoleOptionItem[]>('/admin/role-options'),

  search: () =>
    apiPrivate.get<RoleItem[]>('/admin/roles'),

  get: (id: number) =>
    apiPrivate.get<RoleDetail>(`/admin/roles/${id}`),

  create: (data: { name: string; permission_ids: number[] }) =>
    apiPrivate.post<RoleDetail>('/admin/roles', data),

  update: (id: number, data: { name: string; permission_ids: number[] }) =>
    apiPrivate.patch<RoleDetail>(`/admin/roles/${id}`, data),

  delete: (id: number) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/roles/${id}`),
};
