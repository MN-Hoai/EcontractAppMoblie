import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { registerAccount } from "@/services/auth/auth.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegisterScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!formData.email || !formData.password) {
            Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
            return;
        }

        setIsLoading(true);
        try {
            const nameParts = formData.name.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

            await registerAccount({
                email: formData.email,
                password: formData.password,
                username: formData.email,
                firstName: firstName,
                lastName: lastName,
                avatar: ""
            });

            Alert.alert("Thành công", "Đăng ký tài khoản thành công", [
                { text: "OK", onPress: () => router.replace("/login") }
            ]);
        } catch (error: any) {
            Alert.alert("Lỗi đăng ký", error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F8FAFC" }]}>
            <LinearGradient
                colors={isDark ? ["#1E293B", "#0D1B23"] : ["#F1F5F9", "#F8FAFC"]}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.headerSection}>
                        {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#FFF" : "#1E293B"} />
                        </TouchableOpacity> */}

                        <View style={styles.logoRow}>
                            {/* <View style={styles.logoWrapper}>
                                <LinearGradient
                                    colors={["#2092EC", "#1565C0"]}
                                    style={styles.logoCircle}
                                >
                                    <MaterialCommunityIcons name="account-plus-outline" size={32} color="#FFF" />
                                </LinearGradient>
                                <View style={styles.logoBadge}>
                                    <MaterialCommunityIcons name="check-decagram" size={12} color="#FFF" />
                                </View>
                            </View>

                            <View style={styles.exchangeIconWrapper}>
                                <MaterialCommunityIcons name="swap-horizontal" size={28} color="#2092EC" />
                            </View> */}

                            <Image
                                source={require("@/assets/images/logo-text-128x128.webp")}
                                style={styles.logoTextImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* <ThemedText type="title" style={styles.title}>Đăng ký tài khoản</ThemedText> */}
                        <ThemedText style={styles.subtitle}>
                            Bắt đầu trải nghiệm giải pháp ký số thông minh và bảo mật hàng đầu
                        </ThemedText>
                    </View>

                    <View style={styles.formContainer}>
                        <InputField
                            label="Họ và tên"
                            placeholder="Nhập họ và tên đầy đủ"
                            icon="account-outline"
                            isDark={isDark}
                            value={formData.name}
                            onChangeText={(text: string) => setFormData({ ...formData, name: text })}
                        />
                        <InputField
                            label="Địa chỉ Email"
                            placeholder="example@gmail.com"
                            icon="email-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            isDark={isDark}
                            value={formData.email}
                            onChangeText={(text: string) => setFormData({ ...formData, email: text })}
                        />
                        <InputField
                            label="Số điện thoại"
                            placeholder="0xxx xxx xxx"
                            icon="phone-outline"
                            keyboardType="phone-pad"
                            isDark={isDark}
                            value={formData.phone}
                            onChangeText={(text: string) => setFormData({ ...formData, phone: text })}
                        />
                        <InputField
                            label="Mật khẩu"
                            placeholder="Tối thiểu 6 ký tự"
                            icon="lock-outline"
                            secureTextEntry
                            isDark={isDark}
                            value={formData.password}
                            onChangeText={(text: string) => setFormData({ ...formData, password: text })}
                        />

                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                { opacity: (formData.email.includes("@") && formData.password.length >= 6 && !isLoading) ? 1 : 0.6 }
                            ]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={["#2092EC", "#1565C0"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <ThemedText style={styles.registerButtonText}>Đăng ký ngay </ThemedText>
                                        <MaterialCommunityIcons name="chevron-right" size={20} color="#FFF" style={{ marginLeft: 4 }} />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
                            <TouchableOpacity onPress={() => router.push("/login")}>
                                <ThemedText style={styles.loginLink}>Đăng nhập ngay</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function InputField({ label, icon, isDark, ...props }: any) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = props.secureTextEntry !== undefined;

    return (
        <View style={styles.inputWrapper}>
            <View style={styles.labelRow}>
                <ThemedText style={styles.inputLabel}>{label}</ThemedText>
                {isFocused && <View style={styles.focusDot} />}
            </View>
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFF",
                        borderColor: isFocused ? "#2092EC" : (isDark ? "#1D3D47" : "#E2E8F0"),
                        borderWidth: 1.5,
                        shadowOpacity: isFocused ? 0.1 : 0.02
                    }
                ]}
            >
                <View style={[styles.iconBox, { backgroundColor: isFocused ? "rgba(32, 146, 236, 0.1)" : "transparent" }]}>
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={isFocused ? "#2092EC" : (isDark ? "#64748B" : "#94A3B8")}
                    />
                </View>
                <TextInput
                    style={[styles.input, { color: isDark ? "#E2E8F0" : "#1E293B" }]}
                    placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                    secureTextEntry={isPasswordField ? !showPassword : props.secureTextEntry}
                />
                {isPasswordField && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ paddingRight: 12 }}
                    >
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={isFocused ? "#2092EC" : (isDark ? "#64748B" : "#94A3B8")}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 45,
    flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 28,
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: "center",
        marginBottom: 12,
    },
    backButton: {
        alignSelf: "flex-start",
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(32, 146, 236, 0.08)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        marginTop: 12,
    },
    logoWrapper: {
        position: "relative",

    },
    exchangeIconWrapper: {
        marginHorizontal: 16,
        backgroundColor: "rgba(32, 146, 236, 0.1)",
        padding: 8,
        borderRadius: 20,
    },
    logoTextImage: {
        width: 120,
        height: 120,
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 12,
        shadowColor: "#2092EC",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    logoBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#10B981",
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    title: {
        fontSize: 26,
        fontWeight: "900",
        color: "#1E293B",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    formContainer: {
        width: "100%",
    },
    inputWrapper: {
        marginBottom: 18,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        marginLeft: 6,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#64748B",
    },
    focusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#2092EC",
        marginLeft: 6,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 18,
        paddingHorizontal: 6,
        height: 58,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        paddingRight: 16,
    },
    registerButton: {
        marginTop: 12,
        borderRadius: 18,
        overflow: "hidden",
        elevation: 6,
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientButton: {
        height: 58,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    registerButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 28,
    },
    footerText: {
        fontSize: 14,
        color: "#64748B",
    },
    loginLink: {
        fontSize: 14,
        fontWeight: "800",
        color: "#2092EC",
    },
});
