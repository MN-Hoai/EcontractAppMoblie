import { useAuthStore } from "@/store/auth-store";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Alert } from "react-native";
import { handleApiError } from "../utils/error-utils";
import { getTokens, saveTokens } from "./secure-storage";
import { refreshAccessToken } from "./auth/token-refresh";
import { ENV } from "../config/env";

// Extend AxiosRequestConfig to support _skipAlert flag
declare module "axios" {
    interface InternalAxiosRequestConfig {
        _skipAlert?: boolean;
        _retry?: boolean;
    }
    interface AxiosRequestConfig {
        _skipAlert?: boolean;
    }
}

const apiClient = axios.create({
    baseURL: ENV.API_CONTRACT_URL,
    timeout: 15000,
});

// ─── Request Interceptor: Attach access token from SecureStore ─────────────
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const { accessToken } = useAuthStore.getState();
            // Use in-memory token first (faster), fallback to SecureStore
            const token = accessToken || (await getTokens()).accessToken;
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // Silent fail - request proceeds without token
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// ─── Token refresh queue ───────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token!);
    });
    failedQueue = [];
};

async function handleTokenRefresh(originalRequest: InternalAxiosRequestConfig) {
    // Queue subsequent requests while refreshing
    if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then((token) => {
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
        });
    }

    isRefreshing = true;

    try {
        const { refreshToken, setAuthData, user, requestId, expiresAt, logout } =
            useAuthStore.getState();
        const storedRefreshToken = refreshToken || (await getTokens()).refreshToken;

        if (!storedRefreshToken) {
            await logout();
            return Promise.reject(new Error("No refresh token"));
        }

        const authResponse = await refreshAccessToken(storedRefreshToken);

        if (authResponse?.success && authResponse.data) {
            const newAccessToken = authResponse.data.access_token;
            const newRefreshToken = authResponse.data.refresh_token || storedRefreshToken;
            const newExpiresAt = authResponse.data.expires_at || expiresAt || "";
            const newUser = authResponse.data.user || user;

            if (newUser && (requestId || newUser.id)) {
                await setAuthData({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresAt: newExpiresAt,
                    user: newUser,
                    requestId: requestId || newUser.id,
                });
            } else {
                // Just update tokens in SecureStore if user info not returned
                await saveTokens(newAccessToken, newRefreshToken);
                useAuthStore.setState({ accessToken: newAccessToken, refreshToken: newRefreshToken });
            }

            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            processQueue(null, newAccessToken);
            return apiClient(originalRequest);
        } else {
            const { logout: doLogout, isAuthenticated } = useAuthStore.getState();
            if (isAuthenticated) {
                Alert.alert("Thông báo", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                await doLogout();
            }
            processQueue(new Error("Refresh token expired"), null);
            return Promise.reject(new Error("Refresh failed"));
        }
    } catch (err) {
        const { logout: doLogout, isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
            Alert.alert("Thông báo", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            await doLogout();
        }
        processQueue(err, null);
        return Promise.reject(err);
    } finally {
        isRefreshing = false;
    }
}

// ─── Response Interceptor ─────────────────────────────────────────────────
apiClient.interceptors.response.use(
    (response) => {
        // Handle token expired message returned as 200 OK
        if (
            response.data?.success === false &&
            response.data?.message === "Token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token qua Server A."
        ) {
            return handleTokenRefresh(response.config);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;
        const responseData: any = error.response?.data;

        // Debug log only in dev
        if (__DEV__) {
            if (responseData) {
                console.log("[API Debug] Error response:", JSON.stringify(responseData));
            } else {
                console.log("[API Debug] Network error:", error.message);
            }
        }

        const isTokenExpired =
            error.response?.status === 401 ||
            (responseData?.success === false &&
                responseData?.message === "Token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token qua Server A.");

        if (isTokenExpired && !originalRequest._retry) {
            originalRequest._retry = true;
            return handleTokenRefresh(originalRequest);
        }

        // Show user-friendly dialog only for non-token errors
        // AND only if the caller hasn't set _skipAlert
        // We also skip alerts for auth-related paths as they handle their own errors inline
        const isAuthPath = originalRequest?.url?.includes("/auth/") || false;
        const skipAlert = originalRequest?._skipAlert === true || isAuthPath;

        if (!isTokenExpired && !skipAlert) {
            const message = handleApiError(error);
            if (message) {
                Alert.alert("Thông báo", message);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
