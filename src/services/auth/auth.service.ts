import apiClient from "../api-client";
import { handleApiError } from "../../utils/error-utils";
import { ENV } from "../../config/env";
import { AUTH_ENDPOINTS } from "./auth-constants";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "./auth-types";

/**
 * Đăng ký tài khoản mới.
 * _skipAlert = true: màn hình Register tự xử lý hiển thị lỗi.
 */
export const registerAccount = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>(
      `${ENV.API_AUTH_URL}${AUTH_ENDPOINTS.REGISTER}`,
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
export const login = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      `${ENV.API_AUTH_URL}${AUTH_ENDPOINTS.LOGIN}`,
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
