export const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: "border-red-200 bg-red-50 text-red-600",
  manager: "border-blue-200 bg-blue-50 text-blue-600",
  content_writer: "border-green-200 bg-green-50 text-green-600",
  csr: "border-purple-200 bg-purple-50 text-purple-600",
};

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  content_writer: "Content Writer",
  csr: "CSR",
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  staff_member_id: string | null;
  staff_member_name: string | null;
  created_at: string;
  updated_at: string;
}
