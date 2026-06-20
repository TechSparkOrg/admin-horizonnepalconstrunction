"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsAdmin } from "@/api/services/settings.service";
import { queryKeys } from "@/api/query-keys";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { toast } from "sonner";
import type { SiteSettings, SiteSettingsPayload } from "@/api/types/settings.types";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: () => SettingsAdmin.get(),
  });
}

export function useSettingsMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettingsPayload>) => {
      return SettingsAdmin.put(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings.all, data);
      toast.success("Settings saved");
    },
    onError: (err) => {
      const parsed = ErrorHandler.parse(err);
      ErrorHandler.toast(parsed.message);
    },
  });

  return { updateMutation };
}
