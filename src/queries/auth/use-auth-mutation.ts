import { useMutation } from "@tanstack/react-query";
import * as authService from "@/services/auth/auth.service";
import type { LoginRequest, RegisterRequest } from "@/services/auth/auth-types";

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.registerAccount(payload),
  });
};
