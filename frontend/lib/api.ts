import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, 
});

api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function onRefreshed(newToken: string) {
    pendingRequests.forEach((callback) => callback(newToken));
    pendingRequests = [];
}

export function clearAuthStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
}

export async function performLogout() {
    clearAuthStorage();
    try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {

    }
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

function decodeTokenExpiry(token: string): number | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
    } catch {
        return null;
    }
}

async function refreshAccessToken(): Promise<string> {
    const refreshResponse = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
    );
    const newToken = refreshResponse.data.token;
    localStorage.setItem("token", newToken);
    scheduleTokenRefresh(newToken);
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("token-refreshed", { detail: newToken }));
    }
    return newToken;
}

export function scheduleTokenRefresh(token: string) {
    if (typeof window === "undefined") return;
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
    const expiryMs = decodeTokenExpiry(token);
    if (!expiryMs) return;

    const REFRESH_MARGIN_MS = 2 * 60 * 1000;
    const delay = expiryMs - Date.now() - REFRESH_MARGIN_MS;

    if (delay <= 0) {
        // Already inside the margin (or expired) — refresh right away.
        refreshAccessToken().catch(() => performLogout());
        return;
    }

    refreshTimer = setTimeout(() => {
        refreshAccessToken().catch(() => performLogout());
    }, delay);
}


if (typeof window !== "undefined") {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
        scheduleTokenRefresh(existingToken);
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh" &&
            originalRequest.url !== "/auth/login"
        ) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise((resolve) => {
                    pendingRequests.push((newToken: string) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }
            isRefreshing = true;
            try {
                const newToken = await refreshAccessToken();
                isRefreshing = false;
                onRefreshed(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                pendingRequests = [];
                await performLogout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;