/**
 * sessionManager.ts
 * Quản lý session timeout cho cơ chế "Nhớ đăng nhập".
 * Nếu app ở background vượt quá ngưỡng → yêu cầu xác thực lại.
 */
import * as SecureStore from "expo-secure-store";

const BACKGROUND_TIME_KEY = "session_background_time";
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 phút

/**
 * Lưu thời điểm app vào background.
 */
export const recordBackgroundTime = async (): Promise<void> => {
    try {
        await SecureStore.setItemAsync(BACKGROUND_TIME_KEY, Date.now().toString());
    } catch {
        // Silent fail
    }
};

/**
 * Kiểm tra xem thời gian background có vượt timeout không.
 * @returns true nếu đã hết timeout (cần xác thực lại)
 */
export const checkSessionTimeout = async (): Promise<boolean> => {
    try {
        const raw = await SecureStore.getItemAsync(BACKGROUND_TIME_KEY);
        if (!raw) return false; // Không có background time = lần đầu mở

        const backgroundAt = parseInt(raw, 10);
        const elapsed = Date.now() - backgroundAt;
        return elapsed > SESSION_TIMEOUT_MS;
    } catch {
        return false;
    }
};

/**
 * Xóa thời gian background (khi user vào app thành công).
 */
export const clearBackgroundTime = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(BACKGROUND_TIME_KEY);
    } catch {
        // Silent fail
    }
};

/**
 * Lấy thời gian ngưỡng timeout (ms) để hiển thị nếu cần.
 */
export const getSessionTimeoutMs = (): number => SESSION_TIMEOUT_MS;
