import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";

export type StaffType = "core" | "remote";

export const STAFF_TYPE_OPTIONS: { value: StaffType; label: string }[] = [
  { value: "core", label: "Core Team" },
  { value: "remote", label: "Remote User" },
];

export const STAFF_TYPE_STYLES: Record<StaffType, { color: string; label: string }> = {
  core: { color: "border-blue-200 bg-blue-50 text-blue-600", label: "Core" },
  remote: { color: "border-purple-200 bg-purple-50 text-purple-600", label: "Remote" },
};


export interface StaffSocialLink {
  platform: typeof SOCIAL_PLATFORMS[number];
  url: string;
}

export interface StaffMemberListItem {
  id: string;
  type: StaffType;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  is_active: boolean;
  photo: string;
  employee_id: string;
  joining_date: string | null;
}

export interface StaffMember {
  id: string;
  type: StaffType;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  employee_id: string;
  joining_date: string | null;
  end_date: string | null;
  is_currently_working: boolean;
  photo: string;
  social_links: StaffSocialLink[];
  salary_amount: string | null;
  is_active: boolean;
  show_on_public: boolean;
  created_at: string;
  updated_at: string;
}
