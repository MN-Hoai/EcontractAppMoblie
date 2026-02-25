import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";
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

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const { setEmail: setStoreEmail, setAuthenticated } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (email.includes("@") && password.length >= 6) {
            setStoreEmail(email);
            setAuthenticated(true);
            router.replace("/(tabs)");
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

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            { opacity: (email.includes("@") && password.length >= 6) ? 1 : 0.6 },
                        ]}
                        onPress={handleLogin}
                        disabled={!email.includes("@") || password.length < 6}
                    >
                        <ThemedText style={styles.loginButtonText}>Đăng nhập</ThemedText>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>Bạn chưa có tài khoản? </ThemedText>
                        <TouchableOpacity onPress={() => router.push("/register")}>
                            <ThemedText style={styles.registerLink}>Đăng ký ngay</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
});
