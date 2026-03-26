import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    authenticateWithBiometric,
    getBiometricType,
    isBiometricAvailable,
    BiometricType,
} from "@/services/biometricService";
import { clearBackgroundTime } from "@/services/sessionManager";
import { login } from "@/services/authService";
import { refreshAccessToken } from "@/services/authService";
import { getTokens } from "@/services/secureStorage";

interface LockScreenProps {
    onSwitchAccount: () => Promise<void>;
}

export default function LockScreen({ onSwitchAccount }: LockScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const user = useAuthStore((s) => s.user);
    const email = useAuthStore((s) => s.email);
    const expiresAt = useAuthStore((s) => s.expiresAt);
    const requestId = useAuthStore((s) => s.requestId);
    const unlockSession = useAuthStore((s) => s.unlockSession);
    const setAuthData = useAuthStore((s) => s.setAuthData);

    const [biometricType, setBiometricType] = useState<BiometricType>("none");
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [biometricAttempts, setBiometricAttempts] = useState(0);

    const displayName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "Người dùng"
        : "Người dùng";

    const avatarUri = user?.avatar || null;

    useEffect(() => {
        const init = async () => {
            const available = await isBiometricAvailable();
            setBiometricAvailable(available);
            if (available) {
                const type = await getBiometricType();
                setBiometricType(type);
                // Auto-prompt biometric on screen open
                handleBiometricAuth();
            }
        };
        init();
    }, []);

    // ─── Handle successful unlock ───────────────────────────────────────────
    const handleUnlockSuccess = useCallback(async () => {
        setIsLoading(true);
        try {
            // Silently refresh token if needed
            const now = Date.now();
            const expiry = expiresAt ? new Date(expiresAt).getTime() : 0;
            const isExpired = !expiresAt || now >= expiry - 60_000;

            if (isExpired) {
                const { refreshToken } = await getTokens();
                if (refreshToken) {
                    const authResponse = await refreshAccessToken(refreshToken);
                    if (authResponse?.success && authResponse.data && user) {
                        await setAuthData({
                            accessToken: authResponse.data.access_token,
                            refreshToken: authResponse.data.refresh_token || refreshToken,
                            expiresAt: authResponse.data.expires_at || "",
                            user: authResponse.data.user || user,
                            requestId: requestId || user.id,
                        });
                    }
                }
            }
            await clearBackgroundTime();
            unlockSession();
        } finally {
            setIsLoading(false);
        }
    }, [expiresAt, user, requestId]);

    // ─── Biometric Auth ─────────────────────────────────────────────────────
    const handleBiometricAuth = useCallback(async () => {
        if (!biometricAvailable) {
            setShowPasswordForm(true);
            return;
        }

        const biometricLabel =
            biometricType === "faceId"
                ? "Nhận diện khuôn mặt"
                : biometricType === "fingerprint"
                ? "Vân tay"
                : "Sinh trắc học";

        const result = await authenticateWithBiometric(`Xác thực bằng ${biometricLabel} để vào ứng dụng`);

        if (result.success) {
            await handleUnlockSuccess();
            return;
        }

        if (result.error === "cancelled") return;

        // Too many failures → fallback to password
        const newAttempts = biometricAttempts + 1;
        setBiometricAttempts(newAttempts);
        if (newAttempts >= 3) {
            setShowPasswordForm(true);
        }
    }, [biometricAvailable, biometricType, biometricAttempts, handleUnlockSuccess]);

    // ─── Password Auth ──────────────────────────────────────────────────────
    const handlePasswordAuth = useCallback(async () => {
        if (!password.trim()) return;
        setIsLoading(true);
        setErrorMsg("");
        try {
            const response = await login({ email, password });
            if (response.success && response.data) {
                await handleUnlockSuccess();
            } else {
                setErrorMsg("Mật khẩu không đúng. Vui lòng thử lại.");
            }
        } catch {
            setErrorMsg("Mật khẩu không đúng. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [email, password, handleUnlockSuccess]);

    // ─── Biometric icon label ───────────────────────────────────────────────
    const biometricIcon =
        biometricType === "faceId" ? "face-recognition" : "fingerprint";
    const biometricLabel =
        biometricType === "faceId"
            ? "Mở khóa bằng FaceID"
            : biometricType === "fingerprint"
            ? "Mở khóa bằng Vân tay"
            : "Mở khóa sinh trắc học";

    return (
        <LinearGradient
            colors={isDark ? ["#0D1B23", "#0F172A"] : ["#1565C0", "#2092EC"]}
            style={styles.container}
        >
            {/* Decorative blur circles */}
            <View style={[styles.decorCircle, { top: -80, right: -60, opacity: 0.08 }]} />
            <View style={[styles.decorCircle, { bottom: 100, left: -80, opacity: 0.06, width: 280, height: 280 }]} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
                {/* Avatar + Name */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitial}>
                                    {displayName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.lockBadge}>
                            <MaterialCommunityIcons name="shield-lock" size={14} color="#FFF" />
                        </View>
                    </View>
                    <Text style={styles.greeting}>Chào mừng trở lại</Text>
                    <Text style={styles.username}>{displayName}</Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>

                {/* Auth Section */}
                {showPasswordForm ? (
                    <View style={styles.passwordSection}>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color="#1565C0" />
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="rgba(21, 101, 192, 0.4)"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={(t) => { setPassword(t); setErrorMsg(""); }}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handlePasswordAuth}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialCommunityIcons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#1565C0"
                                />
                            </TouchableOpacity>
                        </View>

                        {!!errorMsg && (
                            <Text style={styles.errorText}>{errorMsg}</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.unlockBtn, { opacity: password.trim() && !isLoading ? 1 : 0.5 }]}
                            onPress={handlePasswordAuth}
                            disabled={!password.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#ffffffff" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="lock-open-outline" size={18} color="#1565C0" />
                                    <Text style={styles.unlockBtnText}>Mở khóa</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Back to biometric */}
                        {biometricAvailable && biometricAttempts < 3 && (
                            <TouchableOpacity style={styles.altBtn} onPress={() => {
                                setShowPasswordForm(false);
                                handleBiometricAuth();
                            }}>
                                <MaterialCommunityIcons name={biometricIcon as any} size={18} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.altBtnText}>{biometricLabel}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.biometricSection}>
                        <TouchableOpacity
                            style={styles.biometricBtn}
                            onPress={handleBiometricAuth}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" size="large" />
                            ) : (
                                <MaterialCommunityIcons
                                    name={biometricIcon as any}
                                    size={52}
                                    color="rgba(255,255,255,0.9)"
                                />
                            )}
                        </TouchableOpacity>
                        <Text style={styles.biometricLabel}>{biometricLabel}</Text>

                        <TouchableOpacity style={styles.altBtn} onPress={() => setShowPasswordForm(true)}>
                            <MaterialCommunityIcons name="keyboard-outline" size={16} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.altBtnText}>Nhập mật khẩu</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Switch Account */}
                <TouchableOpacity
                    style={styles.switchAccountBtn}
                    onPress={() => {
                        Alert.alert(
                            "Đăng nhập tài khoản khác",
                            "Phiên đăng nhập hiện tại sẽ bị xóa. Bạn có chắc muốn tiếp tục?",
                            [
                                { text: "Hủy", style: "cancel" },
                                { text: "Xác nhận", style: "destructive", onPress: onSwitchAccount },
                            ]
                        );
                    }}
                >
                    <MaterialCommunityIcons name="account-switch-outline" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.switchAccountText}>Đăng nhập tài khoản khác</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { paddingTop: 45,
    flex: 1 },
    inner: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
    decorCircle: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "#FFFFFF",
    },

    // Profile
    profileSection: { alignItems: "center", marginBottom: 48 },
    avatarWrapper: { position: "relative", marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
    avatarFallback: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 3, borderColor: "rgba(255,255,255,0.4)",
    },
    avatarInitial: { fontSize: 40, fontWeight: "800", color: "#FFF" },
    lockBadge: {
        position: "absolute", bottom: 2, right: 2,
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: "rgba(32, 146, 236, 0.9)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: "#FFF",
    },
    greeting: { fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
    username: { fontSize: 26, fontWeight: "800", color: "#FFF", marginBottom: 4 },
    emailText: { fontSize: 13, color: "rgba(255,255,255,0.5)" },

    // Biometric
    biometricSection: { alignItems: "center", width: "100%", gap: 16 },
    biometricBtn: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: "rgba(255,255,255,0.25)",
        marginBottom: 8,
    },
    biometricLabel: { fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: "600" },

    // Password
    passwordSection: { width: "100%", gap: 12, marginBottom: 24 },
    inputContainer: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16, paddingHorizontal: 16, height: 56,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
        gap: 12,
    },
    passwordInput: { flex: 1, color: "#1565C0", fontSize: 15, fontWeight: "500" },
    errorText: { color: "#FFB3B3", fontSize: 13, textAlign: "center" },
    unlockBtn: {
        flexDirection: "row", gap: 8,
        backgroundColor: "#ffffffff", borderRadius: 16, height: 52,
        justifyContent: "center", alignItems: "center",
    },
    unlockBtnText: { fontSize: 15, fontWeight: "700", color: "#1565C0" },

    // Shared alt button
    altBtn: {
        flexDirection: "row", alignItems: "center", gap: 8,
        paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
        marginTop: 4,
    },
    altBtnText: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "500" },

    // Switch account
    switchAccountBtn: {
        flexDirection: "row", alignItems: "center", gap: 6,
        marginTop: 48, paddingVertical: 10,
    },
    switchAccountText: { fontSize: 13, color: "rgba(255,255,255,0.55)" },
});
