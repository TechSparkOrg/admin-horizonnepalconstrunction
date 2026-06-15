import { apiPrivate } from '../ServiceHelper/index';
import type { VastuConfig } from '@/stores/admin-types';

export const VastuAdmin = {
  update: (data: Partial<VastuConfig>) =>
    apiPrivate.put<VastuConfig>('/admin/vastu/', data).then(r => r.data),
};
