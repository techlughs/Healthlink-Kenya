import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
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

function onRefreshed(newToken: string) {
    pendingRequests.forEach((callback) => callback(newToken));
    pendingRequests = [];
}

function logoutAndRedirect() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt a refresh once per request, and only on 401/403
        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh" &&
            originalRequest.url !== "/auth/login"
        ) {
            originalRequest._retry = true;

            const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

            if (!refreshToken) {
                logoutAndRedirect();
                return Promise.reject(error);
            }

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
                const refreshResponse = await axios.post(
                    "http://localhost:8080/api/auth/refresh",
                    { refreshToken }
                );

                const newToken = refreshResponse.data.token;
                localStorage.setItem("token", newToken);

                isRefreshing = false;
                onRefreshed(newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                pendingRequests = [];
                logoutAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;