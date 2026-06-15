import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import getEnv from './envschema';

const env = getEnv();

/* ─── Types ─── */

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface TokenPair {
    access: string;
    refresh: string;
}

/* ─── Token Manager ─── */

const isServer = () => typeof window === 'undefined';

const getServerCookies = async () => {
    const { cookies } = await import('next/headers');
    return cookies();
};

class TokenManager {
    private static refreshPromise: Promise<string | null> | null = null;

    static async getAccessToken(): Promise<string | undefined> {
        if (isServer()) return (await getServerCookies()).get('access_token')?.value;
        return getCookie('access_token');
    }

    static async getRefreshToken(): Promise<string | undefined> {
        if (isServer()) return (await getServerCookies()).get('refresh_token')?.value;
        return getCookie('refresh_token');
    }

    static async setTokens({ access, refresh }: TokenPair): Promise<void> {
        if (isServer()) {
            const c = await getServerCookies();
            await Promise.all([
                c.set('access_token', access, { maxAge: 86_400, httpOnly: true, sameSite: 'lax', path: '/' }),
                c.set('refresh_token', refresh, { maxAge: 86_400, httpOnly: true, sameSite: 'lax', path: '/' }),
            ]);
            return;
        }

        const options = { maxAge: 86_400, path: '/' };
        setCookie('access_token', access, options);
        setCookie('refresh_token', refresh, options);
    }

    static async clearTokens(): Promise<void> {
        if (isServer()) {
            const c = await getServerCookies();
            await Promise.all([c.delete('access_token'), c.delete('refresh_token')]);
            return;
        }

        deleteCookie('access_token');
        deleteCookie('refresh_token');
    }

    static async refresh(): Promise<string | null> {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            try {
                const refresh = await this.getRefreshToken();
                if (!refresh) throw new Error('Missing refresh token');

                const { data } = await axios.post<TokenPair>(
                    `${env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                    { refresh }
                );

                if (!data.access) throw new Error('Missing access token');

                await this.setTokens(data);
                return data.access;
            } catch {
                await this.clearTokens();
                return null;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }
}

/* ─── Auth Redirect ─── */



/* ─── Axios Factory ─── */

const createAxiosClient = (isPrivate = false): AxiosInstance => {
    const instance = axios.create({
        baseURL: env.NEXT_PUBLIC_API_URL,
        timeout: 30_000,
        headers: { 'Content-Type': 'application/json' },
    });

    if (!isPrivate) return instance;

    // Request interceptor: attach access token
    instance.interceptors.request.use(async (config) => {
        const token = await TokenManager.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Response interceptor: handle 401/403
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as RetryAxiosRequestConfig;
            const status = error.response?.status;

            // Attempt token refresh on first 401
            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const newToken = await TokenManager.refresh();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return instance(originalRequest);
                }
            }

            // Clear tokens and redirect on auth failure
            if (status === 401 || status === 403) {
                await TokenManager.clearTokens();
               window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

/* ─── Exports ─── */

export const apiPublic = createAxiosClient(false);
export const apiPrivate = createAxiosClient(true);
