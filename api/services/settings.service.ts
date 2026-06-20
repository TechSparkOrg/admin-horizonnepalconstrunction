import { apiPrivate } from '../ServiceHelper/index';
import type { SiteSettings, SiteSettingsPayload } from '../types/settings.types';

export const SettingsAdmin = {
    get: () =>
        apiPrivate.get<SiteSettings>(`/settings/`),
    put: (data: Partial<SiteSettingsPayload>) =>
        apiPrivate.put<SiteSettings>(`/settings/`, data),
};
