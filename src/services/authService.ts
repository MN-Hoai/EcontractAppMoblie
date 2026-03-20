import apiClient from "./apiClient";
import axios from "axios";
import { handleApiError } from "../utils/errorUtils";

const API_BASE_URL = "https://api.officeai.vn/v1";

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
}

export interface RegisterResponse {
    message: string;
    metadata: any;
    code: number;
    data: any;
    success: boolean;
}

export interface LoginRequest {
    email?: string;
    password?: string;
    refresh_token?: string;
}

export interface UserInfo {
    first_name: string;
    last_name: string;
    avatar: string;
    id: string;
    email: string;
    username: string;
}

export interface LoginResponseData {
    expires_at: string;
    refresh_token: string;
    user?: UserInfo;
    access_token: string;
}

export interface LoginResponse {
    message: string;
    metadata: any;
    code: number;
    data: LoginResponseData;
    success: boolean;
}

/**
 * Đăng ký tài khoản mới.
 * _skipAlert = true: màn hình Register tự xử lý hiển thị lỗi.
 */
export const registerAccount = async (payload: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const response = await apiClient.post<RegisterResponse>(
            `${API_BASE_URL}/auth/register`,
            payload,
            { _skipAlert: true } as any
        );
        return response.data;
    } catch (error) {
        const message = handleApiError(error);
        if (message) throw new Error(message);
        throw error;
    }
};

/**
 * Đăng nhập.
 * _skipAlert = true: màn hình Login sẽ tự hiển thị inline error, không cần Alert popup.
 */
export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await apiClient.post<LoginResponse>(
            `${API_BASE_URL}/auth/login`,
            payload,
            { _skipAlert: true } as any
        );
        return response.data;
    } catch (error) {
        const message = handleApiError(error);
        if (message) throw new Error(message);
        throw error;
    }
};

/**
 * Làm mới access token bằng refresh token.
 * Dùng axios trực tiếp (không qua interceptor) để tránh vòng lặp vô hạn.
 */
export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refresh_token: refreshToken }
        );
        return response.data;
    } catch (error) {
        if (__DEV__) console.log("[Auth] Token refresh failed:", error);
        throw error;
    }
};
