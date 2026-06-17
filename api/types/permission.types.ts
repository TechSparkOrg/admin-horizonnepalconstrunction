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

export interface RoleItem {
  id: number;
  name: string;
  permission_count: number;
  user_count: number;
}

export interface RoleDetail {
  id: number;
  name: string;
  permissions: PermissionItem[];
  permission_ids: number[];
}
