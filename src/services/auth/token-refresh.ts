import axios from "axios";
import { ENV } from "../../config/env";
import { AUTH_ENDPOINTS } from "./auth-constants";
import type { LoginResponse } from "./auth-types";

/**
 * Làm mới access token bằng refresh token.
 * File riêng biệt để tránh circular import với api-client.
 * Dùng axios trực tiếp (không qua interceptor).
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${ENV.API_AUTH_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
      { refresh_token: refreshToken }
    );
    return response.data;
  } catch (error) {
    if (__DEV__) console.log("[Auth] Token refresh failed:", error);
    throw error;
  }
};
