import { apiPrivate } from "../ServiceHelper/index";
import type { DashboardData, DashboardFinancialPoint } from "../types/dashboard.types";

export const DashboardService = {
  load: () =>
    apiPrivate.get<DashboardData>("/admin/dashboard"),

  financial: (days = 30) =>
    apiPrivate.get<{ data: DashboardFinancialPoint[] }>("/admin/dashboard/financial", {
      params: { days },
    }),
};
