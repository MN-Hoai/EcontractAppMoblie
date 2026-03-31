/**
 * Auth service endpoints & query keys
 */

export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh-token",
} as const;

/**
 * Query keys for React Query
 */
export const AUTH_KEYS = {
  all: ["auth"] as const,
  login: () => [...AUTH_KEYS.all, "login"] as const,
  register: () => [...AUTH_KEYS.all, "register"] as const,
};
