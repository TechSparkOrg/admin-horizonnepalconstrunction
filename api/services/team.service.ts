import { apiPrivate } from '../ServiceHelper/index';
import type { TeamMember, TeamMemberCreate, TeamMemberUpdate } from '../types/team.types';
import type { PaginatedResponse } from '../types/consultation.types';

export const TeamAdmin = {
  list: () =>
    apiPrivate.get<PaginatedResponse<TeamMember>>('/admin/team/').then(r => r.data),
  adminGet: (id: string) =>
    apiPrivate.get<TeamMember>(`/admin/team/${id}/`).then(r => r.data),
  create: (data: TeamMemberCreate) =>
    apiPrivate.post<TeamMember>('/admin/team/', data).then(r => r.data),
  update: (id: string, data: TeamMemberUpdate) =>
    apiPrivate.put<TeamMember>(`/admin/team/${id}/`, data).then(r => r.data),
  delete: (id: string) =>
    apiPrivate.delete<{ ok: boolean }>(`/admin/team/${id}/`).then(r => r.data),
};
