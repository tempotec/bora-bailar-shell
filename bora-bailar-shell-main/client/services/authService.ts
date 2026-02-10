/**
 * Authentication Service
 * Handles register, login, me, and password change
 */
import { apiClient } from "./apiClient";

// Types
export interface AuthUser {
    id: number | string;
    email: string;
    name: string;
    phone?: string | null;
    birth_date?: string | null;
    role?: string;
    status?: string;
    avatar_url?: string | null;
    profile?: {
        bio?: string;
        dance_styles?: string[];
    };
}

export interface AuthResponse {
    message: string;
    token: string;
    user: AuthUser;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    birth_date?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

// Service
export const authService = {
    /**
     * Register a new user
     * POST /auth/register (no auth required)
     */
    register: (payload: RegisterPayload): Promise<AuthResponse> =>
        apiClient.post<AuthResponse>("/auth/register", payload, { auth: false }),

    /**
     * Login with email and password
     * POST /auth/login (no auth required)
     */
    login: (payload: LoginPayload): Promise<AuthResponse> =>
        apiClient.post<AuthResponse>("/auth/login", payload, { auth: false }),

    /**
     * Get current user data (requires token)
     * GET /auth/me
     */
    me: (): Promise<{ user: AuthUser }> =>
        apiClient.get<{ user: AuthUser }>("/auth/me"),

    /**
     * Change password (requires token)
     * POST /auth/change-password
     */
    changePassword: (payload: {
        current_password: string;
        new_password: string;
    }): Promise<{ message: string }> =>
        apiClient.post<{ message: string }>("/auth/change-password", payload),

    /**
     * Update current user profile (requires token)
     * PUT /auth/me
     */
    updateProfile: (payload: {
        name?: string;
        phone?: string;
        birth_date?: string;
    }): Promise<{ message: string; user: AuthUser }> =>
        apiClient.put<{ message: string; user: AuthUser }>("/auth/me", payload),
};
