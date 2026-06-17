import { apiPrivate } from '../ServiceHelper/index';
import type { SiteSettings, SiteSettingsPayload } from '../types/settings.types';

export const SettingsAdmin = {
    get: () =>
        apiPrivate.get<SiteSettings>(`/settings/`).then(r => r.data),
    put: (data: Partial<SiteSettingsPayload>) =>
        apiPrivate.put<SiteSettings>(`/settings/`, data).then(r => r.data),
};
