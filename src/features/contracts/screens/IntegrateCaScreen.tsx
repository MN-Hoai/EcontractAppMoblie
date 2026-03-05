import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function IntegrateCaScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    const [idNumber, setIdNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleIntegrate = async () => {
        if (!idNumber.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập số Căn cước công dân.");
            return;
        }

        if (idNumber.trim().length !== 12) {
            Alert.alert("Lỗi", "Số CCCD phải bao gồm 12 chữ số.");
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        // Giả lập gọi API tích hợp
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            // Thành công
            Alert.alert(
                "Thành công",
                "Tích hợp chứng thư số thành công!",
                [{ text: "Đóng", onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert("Lỗi", "Quá trình tích hợp thất bại. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F5F7FA" }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>

                        {/* Header Gradient */}
                        <LinearGradient
                            colors={isDark ? ["#0D1B23", "#0D1B23"] : ["#1565C0", "#054D8C"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.header}
                        >
                            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#FFF" : "#FFF"} />
                            </TouchableOpacity>
                            <ThemedText style={styles.headerTitle}>Tích hợp chứng thư số</ThemedText>
                            <View style={styles.placeholderBtn} />
                        </LinearGradient>

                        <ScrollView contentContainerStyle={styles.content}>

                            {/* Icon Banner */}
                            <View style={styles.bannerContainer}>
                                <View style={styles.iconWrapper}>
                                    <View style={[styles.iconInner, { backgroundColor: isDark ? "rgba(255,152,0,0.15)" : "#FFF3E0" }]}>
                                        <MaterialCommunityIcons name="shield-check" size={56} color="#F59E0B" />
                                    </View>
                                </View>
                                <ThemedText style={styles.title}>Liên kết tài khoản ký số</ThemedText>
                                <ThemedText style={styles.subtitle}>
                                    Vui lòng nhập chính xác số Căn cước công dân để đồng bộ với chứng thư số đã được cấp phát.
                                </ThemedText>
                            </View>

                            {/* Input Form */}
                            <View style={[styles.formCard, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                                <View style={styles.inputGroup}>
                                    <ThemedText style={styles.inputLabel}>Số CCCD / CMND</ThemedText>
                                    <View style={[
                                        styles.inputWrapper,
                                        {
                                            backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#F9FAFB",
                                            borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"
                                        }
                                    ]}>
                                        <MaterialCommunityIcons
                                            name="card-account-details-outline"
                                            size={22}
                                            color={isDark ? "#9CA3AF" : "#6B7280"}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[styles.input, { color: isDark ? "#FFF" : "#111827" }]}
                                            placeholder="Nhập 12 số CCCD của bạn"
                                            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            value={idNumber}
                                            onChangeText={setIdNumber}
                                            editable={!isLoading}
                                        />
                                        {idNumber.length > 0 && (
                                            <TouchableOpacity
                                                onPress={() => setIdNumber("")}
                                                style={styles.clearBtn}
                                            >
                                                <MaterialCommunityIcons name="close-circle" size={18} color={isDark ? "#6B7280" : "#D1D5DB"} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>

                        </ScrollView>

                        {/* Footer Action */}
                        <View style={[styles.footer, { backgroundColor: isDark ? "#0D1B23" : "#FFF", borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    { backgroundColor: idNumber.length > 0 ? "#1565C0" : (isDark ? "#374151" : "#E5E7EB") }
                                ]}
                                onPress={handleIntegrate}
                                disabled={isLoading || idNumber.length === 0}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingRow}>
                                        <ActivityIndicator size="small" color="#FFF" />
                                        <ThemedText style={styles.submitBtnText}>Đang xử lý...</ThemedText>
                                    </View>
                                ) : (
                                    <View style={styles.loadingRow}>
                                        <ThemedText style={[styles.submitBtnText, { color: idNumber.length > 0 ? "#FFF" : (isDark ? "#9CA3AF" : "#9CA3AF") }]}>
                                            Xác nhận tích hợp
                                        </ThemedText>
                                        <MaterialCommunityIcons name="arrow-right" size={20} color={idNumber.length > 0 ? "#FFF" : (isDark ? "#9CA3AF" : "#9CA3AF")} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 40 : 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFF",
    },
    placeholderBtn: {
        width: 40,
    },
    content: {
        padding: 24,
        paddingTop: 16,
    },
    bannerContainer: {
        alignItems: "center",
        marginBottom: 32,
        marginTop: 16,
    },
    iconWrapper: {
        marginBottom: 16,
    },
    iconInner: {
        width: 96, height: 96,
        borderRadius: 48,
        alignItems: "center", justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 22,
        opacity: 0.6,
        paddingHorizontal: 16,
    },
    formCard: {
        padding: 20,
        borderRadius: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    inputGroup: {
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
        opacity: 0.8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        height: "100%",
    },
    clearBtn: {
        padding: 4,
    },
    footer: {
        padding: 24,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    submitBtn: {
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    submitBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
