export type StaffType = "core" | "remote";

export const STAFF_TYPE_OPTIONS: { value: StaffType; label: string }[] = [
  { value: "core", label: "Core Team" },
  { value: "remote", label: "Remote User" },
];

export const STAFF_TYPE_STYLES: Record<StaffType, { color: string; label: string }> = {
  core: { color: "border-blue-200 bg-blue-50 text-blue-600", label: "Core" },
  remote: { color: "border-purple-200 bg-purple-50 text-purple-600", label: "Remote" },
};

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "tiktok",
  "youtube",
] as const;

export interface StaffSocialLink {
  platform: typeof SOCIAL_PLATFORMS[number];
  url: string;
}

export interface StaffMember {
  id: string;
  type: StaffType;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  designation_label: string;
  department_label: string;
  attribute_id: string | null;
  employee_id: string;
  joining_date: string | null;
  end_date: string | null;
  is_currently_working: boolean;
  photo: string;
  social_links: StaffSocialLink[];
  is_active: boolean;
  show_on_public: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateStaffMember = Omit<StaffMember, "id" | "created_at" | "updated_at">;

export type UpdateStaffMember = Partial<CreateStaffMember>;
