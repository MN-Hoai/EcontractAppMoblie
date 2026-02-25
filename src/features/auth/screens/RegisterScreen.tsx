import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[
                styles.container,
                { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
            ]}
        >
            <View style={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#FFF" : "#000"} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Đăng ký tài khoản</ThemedText>
                    <ThemedText style={styles.subtitle}>Bắt đầu trải nghiệm ký số chuyên nghiệp ngay hôm nay</ThemedText>
                </View>

                <View style={styles.form}>
                    <InputField
                        label="Họ và tên"
                        placeholder="Nhập họ và tên"
                        icon="account-outline"
                        isDark={isDark}
                        value={formData.name}
                        onChangeText={(text: string) => setFormData({ ...formData, name: text })}
                    />
                    <InputField
                        label="Email"
                        placeholder="Nhập địa chỉ email"
                        icon="email-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        isDark={isDark}
                        value={formData.email}
                        onChangeText={(text: string) => setFormData({ ...formData, email: text })}
                    />
                    <InputField
                        label="Số điện thoại"
                        placeholder="Nhập số điện thoại"
                        icon="phone-outline"
                        keyboardType="phone-pad"
                        isDark={isDark}
                        value={formData.phone}
                        onChangeText={(text: string) => setFormData({ ...formData, phone: text })}
                    />
                    <InputField
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        icon="lock-outline"
                        secureTextEntry
                        isDark={isDark}
                        value={formData.password}
                        onChangeText={(text: string) => setFormData({ ...formData, password: text })}
                    />

                    <TouchableOpacity
                        style={[
                            styles.registerButton,
                            { opacity: (formData.email.includes("@") && formData.password.length >= 6) ? 1 : 0.6 }
                        ]}
                        onPress={() => router.replace("/login")}
                    >
                        <ThemedText style={styles.registerButtonText}>Đăng ký</ThemedText>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
                        <TouchableOpacity onPress={() => router.push("/login")}>
                            <ThemedText style={styles.loginLink}>Đăng nhập</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

function InputField({ label, icon, isDark, ...props }: any) {
    return (
        <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabel}>{label}</ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? "#1D3D47" : "#F5F7FA" }]}>
                <MaterialCommunityIcons name={icon} size={20} color={isDark ? "#AAA" : "#666"} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, { color: isDark ? "#FFF" : "#333" }]}
                    placeholderTextColor={isDark ? "#666" : "#AAA"}
                    {...props}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        opacity: 0.6,
        lineHeight: 22,
    },
    form: {
        flex: 1,
    },
    inputWrapper: {
        marginBottom: 20,
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
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
    },
    registerButton: {
        backgroundColor: "#2092EC",
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    registerButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 14,
        opacity: 0.6,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2092EC",
    },
});
