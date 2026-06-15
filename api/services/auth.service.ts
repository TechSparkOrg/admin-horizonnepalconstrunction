import { apiPublic, apiPrivate } from '../ServiceHelper/index';
import type { LoginFormData, LoginResponse, AuthUser } from '../types/auth.types';


export const AuthService = {
    login: async (data: LoginFormData) => {
        return apiPublic.post<LoginResponse>(`/auth/login/`, data).then(res => res.data);
    },

    me: () =>
        apiPrivate.get<AuthUser>('/auth/me/').then(r => r.data),
};
