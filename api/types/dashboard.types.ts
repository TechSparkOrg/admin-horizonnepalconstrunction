import type { ActivityItem } from "./activities.types";

export interface DashboardStats {
  projects: number;
  staff: number;
  inquiries: number;
  media: {
    total: number;
    images: number;
    videos: number;
    models: number;
  };
}

export interface DashboardFinancialPoint {
  date: string;
  income: number;
  expense: number;
}

export interface RecentInquiry {
  id: string;
  name: string;
  service: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  activities: ActivityItem[];
  recent_inquiries: RecentInquiry[];
}
