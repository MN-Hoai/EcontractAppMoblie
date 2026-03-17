import { useAuthStore } from "@/store/authStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken } from "./authService";

const apiClient = axios.create({
    baseURL: "https://contract.officeai.vn", // Base for product /contract/api/list
    timeout: 15000,
});

// Request Interceptor: Add access token to headers
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Helper to handle multiple requests failing at the same time and refreshing once
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response Interceptor: Handle token expiration
apiClient.interceptors.response.use(
    (response) => {
        // According to user: if response.data.success is false and contains the expired token message
        if (
            response.data &&
            response.data.success === false &&
            response.data.message === "Token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token qua Server A."
        ) {
            console.log("Centralized Interceptor: Detected token expired message in success response.");
            return handleTokenRefresh(response.config);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const responseData: any = error.response?.data;

        // Requirement 6: Log explicit JSON error response from API
        if (responseData) {
            console.error("API Error Response JSON:", JSON.stringify(responseData, null, 2));
        } else {
            console.error("API Network Error:", error.message);
        }

        // Also check if the error response is 401 or contains the specific message
        if (
            error.response?.status === 401 ||
            (responseData &&
                responseData.success === false &&
                responseData.message === "Token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token qua Server A.")
        ) {
            if (!originalRequest._retry) {
                originalRequest._retry = true;
                console.log("Centralized Interceptor: Detected 401 or token expired message in error response (Status: " + error.response?.status + ").");
                return handleTokenRefresh(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

async function handleTokenRefresh(originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) {
    if (isRefreshing) {
        console.log("Centralized Interceptor: Already refreshing, queuing request.");
        return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
        })
            .then((token) => {
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = "Bearer " + token;
                }
                return apiClient(originalRequest);
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }

    isRefreshing = true;
    console.log("Centralized Interceptor: Starting token refresh process...");

    try {
        const { refreshToken, setAuthData, user, requestId, expiresAt, logout } = useAuthStore.getState();

        if (!refreshToken) {
            console.error("Centralized Interceptor: No refresh token found, logging out.");
            logout();
            isRefreshing = false;
            return Promise.reject(new Error("No refresh token available"));
        }

        const authResponse = await refreshAccessToken(refreshToken);

        if (authResponse && authResponse.success && authResponse.data) {
            console.log("Centralized Interceptor: Token refreshed successfully. Updating store and retrying...");

            const newAccessToken = authResponse.data.access_token;
            const newRefreshToken = authResponse.data.refresh_token || refreshToken;
            const newExpiresAt = authResponse.data.expires_at || expiresAt || "";
            const newUser = authResponse.data.user || user;

            // Ghi lại thông tin đăng nhập mới (Required by User)
            if (newUser && (requestId || newUser.id)) {
                setAuthData({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresAt: newExpiresAt,
                    user: newUser,
                    requestId: requestId || newUser.id,
                });
            }

            // Apply NEW token to the failed request
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = "Bearer " + newAccessToken;
            }

            processQueue(null, newAccessToken);
            return apiClient(originalRequest);
        } else {
            console.error("Centralized Interceptor: Refresh API failed, logging out.");
            logout();
            processQueue(new Error("Refresh token expired"), null);
            return Promise.reject(new Error("Refresh token failed"));
        }
    } catch (err) {
        console.error("Centralized Interceptor: Error during refresh process:", err);
        const { logout } = useAuthStore.getState();
        logout();
        processQueue(err, null);
        return Promise.reject(err);
    } finally {
        isRefreshing = false;
    }
}

export default apiClient;
