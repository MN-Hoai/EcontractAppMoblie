import axios from "axios";

const API_BASE_URL = "https://api.officeai.vn/v1";

export interface LoginRequest {
    email?: string;
    password?: string;
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
    user: UserInfo;
    access_token: string;
}

export interface LoginResponse {
    message: string;
    metadata: any;
    code: number;
    data: LoginResponseData;
    success: boolean;
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
        const url = `${API_BASE_URL}/auth/login`;
        const response = await axios.post<LoginResponse>(url, payload);
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};
