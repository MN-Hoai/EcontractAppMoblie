/**
 * biometricService.ts
 * Wrapper cho expo-local-authentication.
 * Chịu trách nhiệm kiểm tra và thực hiện xác thực sinh trắc học.
 */
import * as LocalAuthentication from "expo-local-authentication";

export type BiometricType = "fingerprint" | "faceId" | "iris" | "none";

/**
 * Kiểm tra xem thiết bị có hỗ trợ sinh trắc học không.
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
    try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) return false;
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        return enrolled;
    } catch {
        return false;
    }
};

/**
 * Lấy loại sinh trắc học được hỗ trợ.
 */
export const getBiometricType = async (): Promise<BiometricType> => {
    try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return "faceId";
        }
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return "fingerprint";
        }
        if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            return "iris";
        }
        return "none";
    } catch {
        return "none";
    }
};

export interface BiometricResult {
    success: boolean;
    error?: string;
}

/**
 * Thực hiện xác thực sinh trắc học.
 */
export const authenticateWithBiometric = async (
    promptMessage = "Xác thực để mở khóa ứng dụng"
): Promise<BiometricResult> => {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            cancelLabel: "Hủy",
            fallbackLabel: "Nhập mật khẩu",
            disableDeviceFallback: true, // We handle password fallback ourselves
        });

        if (result.success) {
            return { success: true };
        }

        if (result.error === "user_cancel" || result.error === "system_cancel") {
            return { success: false, error: "cancelled" };
        }

        return { success: false, error: result.error };
    } catch (error: any) {
        return { success: false, error: error?.message || "unknown" };
    }
};
