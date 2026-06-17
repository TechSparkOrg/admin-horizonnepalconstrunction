export interface LoginFormData {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    name: string;
    role: string;
    is_superuser: boolean;
    is_active: boolean;
    created_at: string;
    permissions: string[];
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: AuthUser;
}

export type AdminSessionUser = Pick<AuthUser, "id" | "email" | "username" | "is_active">;

export type AdminAuthState = Readonly<{
    isAuthenticated: boolean;
    user: AdminSessionUser | null;
    hasHydrated: boolean;
}>;
