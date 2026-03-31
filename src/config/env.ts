/**
 * Centralized environment configuration.
 * Uses Expo's EXPO_PUBLIC_ prefix for automatic availability.
 */
export const ENV = {
  API_AUTH_URL:
    process.env.EXPO_PUBLIC_API_AUTH_URL || "https://api.officeai.vn/v1",
  API_CONTRACT_URL:
    process.env.EXPO_PUBLIC_API_CONTRACT_URL || "https://contract.officeai.vn",
  API_CONTRACT_LOCAL_URL:
    process.env.EXPO_PUBLIC_API_CONTRACT_LOCAL_URL ||
    "http://192.168.1.82:5000",
};
