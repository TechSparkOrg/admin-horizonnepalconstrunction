import { apiPrivate } from '../ServiceHelper/index';
import type { BuildingPermitConfig, BuildingPermitConfigUpdate } from '../types/building-permit.types';

export const BuildingPermitAdmin = {
  get: () =>
    apiPrivate.get<BuildingPermitConfig>('/admin/building-permit/').then(r => r.data),
  update: (data: BuildingPermitConfigUpdate) =>
    apiPrivate.put<BuildingPermitConfig>('/admin/building-permit/', data).then(r => r.data),
};
