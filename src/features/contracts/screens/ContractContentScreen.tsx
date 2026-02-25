import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";

const PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export default function ContractContentScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F0F4F8" }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDark ? "#0D1B23" : "#F0F4F8" }]}>
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}
                    onPress={() => router.back()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <ThemedText style={styles.headerTitle}>Nội dung hợp đồng</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>HĐ-2025/01/0042</ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}
                >
                    <MaterialCommunityIcons name="download" size={22} color="#2092EC" />
                </TouchableOpacity>
            </View>

            {/* PDF Viewer */}
            <View style={styles.viewerWrapper}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#2092EC" />
                        <ThemedText style={styles.loadingText}>Đang tải tài liệu...</ThemedText>
                    </View>
                )}
                <WebView
                    source={{ uri: `https://docs.google.com/gview?embedded=true&url=${PDF_URL}` }}
                    style={styles.webview}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => setLoading(false)}
                />
            </View>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { backgroundColor: isDark ? "#0D1B23" : "#FFF" }]}>
                <TouchableOpacity
                    style={[styles.bottomBtn, { backgroundColor: isDark ? "#1D3D47" : "#F0F4F8" }]}
                    onPress={() => router.back()}
                >
                    <MaterialCommunityIcons name="close" size={20} color={isDark ? "#FFF" : "#333"} />
                    <ThemedText style={[styles.bottomBtnText, { color: isDark ? "#FFF" : "#333" }]}>Đóng</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.signBtn}
                    onPress={() => router.push("/sign-contract")}
                >
                    <MaterialCommunityIcons name="pen" size={20} color="#FFF" />
                    <ThemedText style={styles.signBtnText}>Ký hợp đồng</ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    iconBtn: {
        width: 42, height: 42,
        borderRadius: 12,
        alignItems: "center", justifyContent: "center",
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    headerCenter: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: "700",
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.45,
        marginTop: 2,
    },
    viewerWrapper: {
        flex: 1,
        margin: 12,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    webview: {
        flex: 1,
    },
    loadingOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.9)",
        zIndex: 10,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        opacity: 0.6,
    },
    bottomBar: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
    },
    bottomBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
    },
    bottomBtnText: {
        fontSize: 15,
        fontWeight: "600",
    },
    signBtn: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: "#2092EC",
    },
    signBtnText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
