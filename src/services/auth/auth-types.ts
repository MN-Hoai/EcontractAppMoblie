/**
 * Auth domain types
 */

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
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
