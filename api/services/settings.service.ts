import { apiPrivate } from '../ServiceHelper/index';
import type { SiteSettings, SiteSettingsPayload } from '../types/settings.types';

export const SettingsAdmin = {
    put: (data: Partial<SiteSettingsPayload>) =>
        apiPrivate.put<SiteSettings>(`/settings/`, data).then(r => r.data),
};
