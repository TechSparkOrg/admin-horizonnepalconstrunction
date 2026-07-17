export interface PermissionItem {
  id: number;
  codename: string;
  name: string;
  resource: string;
}

export interface PermissionGroup {
  resource: string;
  label: string;
  permissions: PermissionItem[];
}

export interface RoleConfigPermission {
  codename: string;
  label: string;
}

export interface RoleConfig {
  role: string;
  label: string;
  permissions: RoleConfigPermission[];
}

export interface RoleItem {
  id: number | null;
  name: string;
  permission_count: number;
  user_count: number;
  is_system: boolean;
}

export interface RoleOptionItem {
  value: string;
  label: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  permissions: PermissionItem[];
  permission_ids: number[];
  is_system: boolean;
}
