import axios from "axios";

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

export const registerAccount = async (payload: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const url = `${API_BASE_URL}/auth/register`;
        const response = await axios.post<RegisterResponse>(url, payload);
        return response.data;
    } catch (error) {
        console.log("Error during registration:", error);
        throw error;
    }
};

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
        const url = `${API_BASE_URL}/auth/login`;
        const response = await axios.post<LoginResponse>(url, payload);
        return response.data;
    } catch (error) {
        console.log("Error during login:", error);
        throw error;
    }
};

export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
    try {
        const url = `${API_BASE_URL}/auth/refresh-token`; // Fallback to refresh-token endpoint
        const response = await axios.post<LoginResponse>(url, { refresh_token: refreshToken });
        return response.data;
    } catch (error) {
        console.log("Error during token refresh:", error);
        throw error;
    }
};
