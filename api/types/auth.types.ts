export interface LoginFormData {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    email: string;
    username: string;
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


