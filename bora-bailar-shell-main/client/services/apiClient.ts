/**
 * Centralized API Client with automatic Bearer token injection
 * All API calls should go through this client
 */
import { API_CONFIG } from "../config";
import { tokenStore } from "./tokenStore";

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: any;
    auth?: boolean; // Set to false for login/register (no token needed)
};

class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public data?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { auth = true, body, ...fetchOptions } = options;

    // Build URL - path should NOT include /api (BASE_URL already has it)
    const url = `${API_CONFIG.BASE_URL}${path}`;

    // Build headers
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Inject Bearer token if auth is enabled
    if (auth) {
        const token = await tokenStore.get();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
        if (__DEV__) {
            console.log(`[API] ${options.method || "GET"} ${url}`);
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Read response text (may be empty)
        const text = await response.text();

        // Try to parse JSON safely
        let data: any = null;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                // Not JSON, keep as null
                data = { message: text };
            }
        }

        // Handle errors
        if (!response.ok) {
            const errorMessage =
                data?.error || data?.message || `HTTP ${response.status}`;
            throw new ApiError(response.status, errorMessage, data);
        }

        return data as T;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Error && error.name === "AbortError") {
            throw new ApiError(0, "Timeout: servidor não respondeu");
        }

        throw new ApiError(0, (error as Error).message || "Erro de conexão");
    }
}

// Convenience methods
export const apiClient = {
    get: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
        apiRequest<T>(path, { ...options, method: "GET" }),

    post: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
        apiRequest<T>(path, { ...options, method: "POST", body }),

    put: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
        apiRequest<T>(path, { ...options, method: "PUT", body }),

    delete: <T>(path: string, options?: Omit<RequestOptions, "method">) =>
        apiRequest<T>(path, { ...options, method: "DELETE" }),
};
