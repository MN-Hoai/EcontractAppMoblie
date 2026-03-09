import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { login } from "@/services/authService";
import { addOrUpdateCustomer, checkCustomerExist, CustomerRequestDTO } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const { setAuthData } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [tempAuthData, setTempAuthData] = useState<any>(null);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
    const [customerError, setCustomerError] = useState("");

    const handleLogin = async () => {
        if (email.includes("@") && password.length >= 6) {
            try {
                setIsLoading(true);
                setErrorMessage("");
                const response = await login({ email, password });

                if (response.success && response.data) {
                    const reqId = response.data.user?.id;
                    if (reqId) {
                        try {
                            console.log("================================");
                            console.log("Account ID for CheckCustomerExist:", reqId);
                            const checkRes = await checkCustomerExist(reqId);
                            console.log("Check customer API response:", JSON.stringify(checkRes));
                            const dataObj = checkRes?.data || checkRes?.Data || {};

                            const isExist = dataObj.exists === true || String(dataObj.exists).toLowerCase() === "true";
                            const hasEmailOrPhone = dataObj.hasEmailOrPhone === true || String(dataObj.hasEmailOrPhone).toLowerCase() === "true";

                            if (!isExist || !hasEmailOrPhone) {
                                const fullName = `${response.data.user.first_name || ""} ${response.data.user.last_name || ""}`.trim() || "";
                                const emailToken = response.data.user.email || "";

                                setCustomerName(fullName);
                                setCustomerEmail(emailToken);
                                setCustomerPhone("");
                                setCustomerError("");
                                setTempAuthData({
                                    accessToken: response.data.access_token,
                                    refreshToken: response.data.refresh_token,
                                    expiresAt: response.data.expires_at,
                                    user: response.data.user,
                                    requestId: reqId
                                });
                                setShowCustomerModal(true);
                                setIsLoading(false);
                                return; // Stop login flow until user provides info
                            }
                        } catch (err) {
                            console.log("Lỗi khi kiểm tra/tạo thông tin khách hàng:", err);
                            setErrorMessage("Không thể giao tiếp với hệ thống khách hàng. Vui lòng thử lại.");
                            setIsLoading(false);
                            return;
                        }
                    }

                    setAuthData({
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        expiresAt: response.data.expires_at,
                        user: response.data.user,
                        requestId: reqId
                    });
                    router.replace("/(tabs)");
                } else {
                    setErrorMessage("Sai thông tin tài khoản, vui lòng kiểm tra lại.");
                }
            } catch (error: any) {
                setErrorMessage("Sai thông tin tài khoản, vui lòng kiểm tra lại.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdateCustomer = async () => {
        if (!tempAuthData || !tempAuthData.requestId) return;
        if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
            setCustomerError("Vui lòng nhập đầy đủ thông tin: họ tên, email và số điện thoại.");
            return;
        }

        try {
            setIsUpdatingCustomer(true);
            setCustomerError("");
            const customerData: CustomerRequestDTO = {
                FullName: customerName,
                Phone: customerPhone,
                Email: customerEmail,
                IsCA: false
            };

            const addRes = await addOrUpdateCustomer(tempAuthData.requestId, customerData);
            const addSuccess = addRes?.success === true || addRes?.Success === true;
            if (!addSuccess) {
                setCustomerError(addRes?.message || addRes?.Message || "Đã xảy ra lỗi khi tạo thông tin khách hàng mới. Vui lòng thử lại.");
                setIsUpdatingCustomer(false);
                return;
            }

            // Update success, complete auth login
            setShowCustomerModal(false);
            setAuthData(tempAuthData);
            router.replace("/(tabs)");

        } catch (err) {
            console.log("Lỗi khi tạo/cập nhật thông tin khách hàng:", err);
            setCustomerError("Lỗi kết nối tới hệ thống khách hàng. Vui lòng thử lại.");
        } finally {
            setIsUpdatingCustomer(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
                styles.container,
                { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <MaterialCommunityIcons name="signature" size={60} color="#2092EC" />
                    </View>
                    <ThemedText type="title" style={styles.appName}>
                        eContract
                    </ThemedText>
                    <ThemedText style={styles.tagline}>
                        Giải pháp ký số thông minh
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    <ThemedText style={styles.inputLabel}>Email</ThemedText>
                    <View
                        style={[
                            styles.inputContainer,
                            { backgroundColor: isDark ? "#1D3D47" : "#F5F7FA" },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="email-outline"
                            size={20}
                            color={isDark ? "#AAA" : "#666"}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, { color: isDark ? "#FFF" : "#333" }]}
                            placeholder="Nhập email của bạn"
                            placeholderTextColor={isDark ? "#666" : "#AAA"}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <ThemedText style={styles.inputLabel}>Mật khẩu</ThemedText>
                    <View
                        style={[
                            styles.inputContainer,
                            { backgroundColor: isDark ? "#1D3D47" : "#F5F7FA" },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="lock-outline"
                            size={20}
                            color={isDark ? "#AAA" : "#666"}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.input, { color: isDark ? "#FFF" : "#333" }]}
                            placeholder="Nhập mật khẩu"
                            placeholderTextColor={isDark ? "#666" : "#AAA"}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {errorMessage ? (
                        <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
                    ) : null}

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            { opacity: (email.includes("@") && password.length >= 6 && !isLoading) ? 1 : 0.6 },
                        ]}
                        onPress={handleLogin}
                        disabled={!email.includes("@") || password.length < 6 || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>Bạn chưa có tài khoản? </ThemedText>
                        <TouchableOpacity onPress={() => router.push("/register")}>
                            <ThemedText style={styles.registerLink}>Đăng ký ngay</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Modal Nhập Thông Tin Customer */}
            <Modal visible={showCustomerModal} transparent animationType="slide">
                <View style={[styles.modalOverlay]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={[styles.modalContent, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}
                    >
                        <ThemedText style={styles.modalTitle}>Bổ sung thông tin</ThemedText>
                        <ThemedText style={{ opacity: 0.7, marginBottom: 20, textAlign: "center" }}>
                            Vui lòng cung cấp đầy đủ thông tin (Họ tên, Email, SĐT) để tiếp tục sử dụng ứng dụng.
                        </ThemedText>

                        {/* Tên */}
                        <View style={[styles.inputContainer, { backgroundColor: isDark ? "#0D1B23" : "#F5F7FA", marginBottom: 16 }]}>
                            <MaterialCommunityIcons name="account-outline" size={20} color={isDark ? "#AAA" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: isDark ? "#FFF" : "#333" }]}
                                placeholder="Họ và tên"
                                placeholderTextColor={isDark ? "#666" : "#AAA"}
                                value={customerName}
                                onChangeText={setCustomerName}
                            />
                        </View>

                        {/* Email */}
                        <View style={[styles.inputContainer, { backgroundColor: isDark ? "#0D1B23" : "#F5F7FA", marginBottom: 16 }]}>
                            <MaterialCommunityIcons name="email-outline" size={20} color={isDark ? "#AAA" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: isDark ? "#FFF" : "#333" }]}
                                placeholder="Địa chỉ Email"
                                placeholderTextColor={isDark ? "#666" : "#AAA"}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={customerEmail}
                                onChangeText={setCustomerEmail}
                            />
                        </View>

                        {/* Số điện thoại */}
                        <View style={[styles.inputContainer, { backgroundColor: isDark ? "#0D1B23" : "#F5F7FA", marginBottom: 16 }]}>
                            <MaterialCommunityIcons name="phone-outline" size={20} color={isDark ? "#AAA" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: isDark ? "#FFF" : "#333" }]}
                                placeholder="Số điện thoại"
                                placeholderTextColor={isDark ? "#666" : "#AAA"}
                                keyboardType="phone-pad"
                                value={customerPhone}
                                onChangeText={setCustomerPhone}
                            />
                        </View>

                        {customerError ? (
                            <ThemedText style={styles.errorText}>{customerError}</ThemedText>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.loginButton, { marginTop: 16 }]}
                            onPress={handleUpdateCustomer}
                            disabled={isUpdatingCustomer}
                        >
                            {isUpdatingCustomer ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <ThemedText style={styles.loginButtonText}>Xác nhận & Đăng nhập</ThemedText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ marginTop: 24, alignItems: 'center' }}
                            onPress={() => {
                                setShowCustomerModal(false);
                                setTempAuthData(null);
                            }}
                        >
                            <ThemedText style={{ color: '#2092EC', fontWeight: '600' }}>Hủy bỏ đăng nhập</ThemedText>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: "center",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 48,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(32, 146, 236, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
        fontWeight: "800",
        color: "#2092EC",
    },
    tagline: {
        fontSize: 14,
        opacity: 0.6,
    },
    form: {
        width: "100%",
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 24,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
    },
    loginButton: {
        backgroundColor: "#2092EC",
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    loginButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        marginBottom: 16,
        textAlign: "center",
        fontWeight: "500",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
        opacity: 0.6,
    },
    registerLink: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2092EC",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
});
