/**
 * secureStorage.ts
 * Wrapper cho expo-secure-store để quản lý tokens nhạy cảm.
 * Tokens (access_token, refresh_token) KHÔNG được lưu trong AsyncStorage.
 */
import * as SecureStore from "expo-secure-store";

const KEYS = {
    ACCESS_TOKEN: "secure_access_token",
    REFRESH_TOKEN: "secure_refresh_token",
};

export interface StoredTokens {
    accessToken: string | null;
    refreshToken: string | null;
}

/**
 * Lưu cả hai tokens vào SecureStore.
 */
export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
        await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
        if (__DEV__) console.log("[SecureStorage] Failed to save tokens:", error);
    }
};

/**
 * Đọc cả hai tokens từ SecureStore.
 */
export const getTokens = async (): Promise<StoredTokens> => {
    try {
        const accessToken = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
        const refreshToken = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
        return { accessToken, refreshToken };
    } catch (error) {
        if (__DEV__) console.log("[SecureStorage] Failed to read tokens:", error);
        return { accessToken: null, refreshToken: null };
    }
};

/**
 * Xóa tokens khỏi SecureStore khi đăng xuất.
 */
export const clearTokens = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    } catch (error) {
        if (__DEV__) console.log("[SecureStorage] Failed to clear tokens:", error);
    }
};
