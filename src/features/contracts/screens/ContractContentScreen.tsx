import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { API_BASE_URL_PRODUCT, checkCaStatus, executeExternalSignContract } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function ContractContentScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [webviewKey, setWebviewKey] = useState(Date.now().toString());
    const { requestId } = useAuthStore();

    const [loadingCa, setLoadingCa] = useState(false);
    const [showCaModal, setShowCaModal] = useState(false);
    const [caMessage, setCaMessage] = useState("");

    // --- Sign Contract State ---
    const [showProcessing, setShowProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(100);
    const [signError, setSignError] = useState<string | null>(null);

    // Countdown logic
    useEffect(() => {
        if (!showProcessing) return;
        if (countdown <= 0) {
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [showProcessing, countdown]);

    useEffect(() => {
        setLoading(true);
        // Force unmount and mount of webview to prevent white screen caching issues
        setWebviewKey(Date.now().toString());
    }, [params.path]);

    const docName = (params.name as string) || "Hợp đồng không tên";
    let finalDocUrl = "";
    if (params.path) {
        // If it's starting with http it's an absolute url. otherwise it's relative
        const pathStr = params.path as string;
        if (pathStr.startsWith("http")) {
            finalDocUrl = pathStr;
        } else {
            // path in api starts with '/' e.g: '/media/upload/xxxxx.pdf'
            const connector = pathStr.startsWith("/") ? "" : "/";
            finalDocUrl = `${API_BASE_URL_PRODUCT}${connector}${pathStr}`;
        }
    }
    const handleSign = async () => {
        try {
            setLoadingCa(true);
            const res = await checkCaStatus(requestId || "");

            const isSuccess = res.Success ?? res.success;
            const data = res.Data ?? res.data;
            const message = res.Message ?? res.message ?? "Bạn chưa tích hợp chứng thư số";

            if (isSuccess && data === true) {
                // Have CA -> trigger sign contract directly
                handleProceedToSign();
            } else {
                setCaMessage(message);
                setShowCaModal(true);
            }
        } catch (err) {
            console.log("Lỗi kiểm tra chứng thư số:", err);
            Alert.alert("Lỗi", "Không thể kiểm tra trạng thái chứng thư số. Vui lòng thử lại.");
        } finally {
            setLoadingCa(false);
        }
    };

    const handleProceedToSign = async () => {
        const accountId = requestId || "";
        const contractId = (params.contractId as string) || (params.id as string) || "";

        setShowProcessing(true);
        setSignError(null);
        setCountdown(100);

        console.log("===> executeExternalSignContract params:", { accountId, contractId });

        try {
            const signResponse = await executeExternalSignContract(accountId, contractId) as any;
            const signSuccess = signResponse.Success ?? signResponse.success;

            if (signSuccess) {
                setShowProcessing(false);
                setShowSuccess(true);
            } else {
                setShowProcessing(false);
                setSignError(signResponse.Message ?? signResponse.message ?? "Lỗi ký hợp đồng từ hệ thống.");
            }
        } catch (err: any) {
            setShowProcessing(false);
            setSignError(err?.message || "Lỗi gọi API sign-contract.");
        }
    };

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
                    <ThemedText style={styles.headerTitle} numberOfLines={1}>Nội dung hợp đồng</ThemedText>
                    <ThemedText style={styles.headerSubtitle} numberOfLines={1}>{docName}</ThemedText>
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
                {finalDocUrl ? (
                    <WebView
                        key={webviewKey}
                        source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(finalDocUrl)}` }}
                        style={styles.webview}
                        onLoadEnd={() => setLoading(false)}
                        onError={(e) => {
                            console.error("WebView Error:", e.nativeEvent);
                            setLoading(false);
                        }}
                        startInLoadingState={true}
                        cacheEnabled={false}
                        incognito={true}
                        androidLayerType="hardware"
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        originWhitelist={['*']}
                    />
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ThemedText style={{ opacity: 0.5 }}>Không tìm thấy tệp tài liệu hợp đồng.</ThemedText>
                    </View>
                )}
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
                    onPress={handleSign}
                    disabled={loadingCa}
                >
                    {loadingCa ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <MaterialCommunityIcons name="pen" size={20} color="#FFF" />
                    )}
                    <ThemedText style={styles.signBtnText}>
                        {loadingCa ? "Đang kiểm tra..." : "Ký hợp đồng"}
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* Custom Modal Chứng thư số */}
            < Modal visible={showCaModal} transparent animationType="fade" >
                <View style={[styles.modalOverlay, { paddingHorizontal: 24, justifyContent: "center" }]}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                        <View style={styles.modalHeader}>
                            <View style={{ width: 32 }} />
                            <View style={styles.modalIconWrapper}>
                                <MaterialCommunityIcons name="shield-lock-outline" size={32} color="#F59E0B" />
                            </View>
                            <TouchableOpacity onPress={() => setShowCaModal(false)} style={[styles.modalCloseBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}>
                                <MaterialCommunityIcons name="close" size={20} color={isDark ? "#FFF" : "#666"} />
                            </TouchableOpacity>
                        </View>
                        <ThemedText style={styles.modalTitle}>Chưa có chứng thư số</ThemedText>
                        <ThemedText style={styles.modalMessage}>{caMessage}</ThemedText>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnOutline, { borderColor: isDark ? "rgba(255,255,255,0.2)" : "#1565C0" }]}
                                onPress={() => {
                                    setShowCaModal(false);
                                    router.push("/integrate-ca");
                                }}
                            >
                                <ThemedText style={[styles.modalBtnText, { color: isDark ? "#FFF" : "#1565C0" }]}>Tích hợp sẵn</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnPrimary]}
                                onPress={() => {
                                    setShowCaModal(false);
                                    router.push("/identity-verification");
                                }}
                            >
                                <ThemedText style={[styles.modalBtnText, { color: "#FFF" }]}>Đăng ký mới</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >

            {/* ── Processing modal ── */}
            < Modal visible={showProcessing} transparent animationType="fade" >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? "#1D3D47" : "#FFF", alignItems: "center" }]}>
                        <LinearGradient colors={["#1565C0", "#2092EC"]} style={{ width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                            <MaterialCommunityIcons name="timer-sand" size={36} color="#FFF" />
                        </LinearGradient>
                        <ThemedText style={{ fontSize: 28, fontWeight: "900", color: "#1565C0", marginBottom: 6 }}>{countdown}s</ThemedText>
                        <ThemedText style={{ fontSize: 17, fontWeight: "700", marginBottom: 10 }}>Đang chờ xác nhận</ThemedText>
                        <ThemedText style={{ fontSize: 13, textAlign: "center", opacity: 0.7, marginBottom: 20 }}>Hệ thống đang xử lý yêu cầu ký hợp đồng. Vui lòng không đóng ứng dụng...</ThemedText>
                        {signError && (
                            <ThemedText style={{ color: "red", textAlign: "center", marginTop: 10 }}>{signError}</ThemedText>
                        )}
                        {signError && (
                            <TouchableOpacity onPress={() => setShowProcessing(false)} style={{ marginTop: 20, padding: 10, backgroundColor: "#E0E0E0", borderRadius: 8 }}>
                                <ThemedText style={{ color: "#333", fontWeight: "600" }}>Đóng</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal >

            {/* ── Success modal ── */}
            < Modal visible={showSuccess} transparent animationType="fade" >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? "#1D3D47" : "#FFF", alignItems: "center", paddingVertical: 32 }]}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <MaterialCommunityIcons name="check-bold" size={40} color="#FFF" />
                        </View>
                        <ThemedText style={{ fontSize: 22, fontWeight: "800", marginBottom: 10 }}>Ký số thành công!</ThemedText>
                        <ThemedText style={{ fontSize: 13, textAlign: "center", opacity: 0.7, marginBottom: 24 }}>Quý khách đã thực hiện ký thành công hợp đồng này.</ThemedText>

                        <TouchableOpacity style={{ backgroundColor: "#1565C0", borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center", marginBottom: 10 }} onPress={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}>
                            <ThemedText style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>Về trang chủ</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >

        </SafeAreaView >
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalContent: {
        width: "100%",
        padding: 24,
        borderRadius: 24,
        alignItems: "center",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-start",
    },
    modalIconWrapper: {
        width: 64, height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    modalCloseBtn: {
        width: 32, height: 32,
        borderRadius: 16,
        alignItems: "center", justifyContent: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    modalBtnOutline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
    },
    modalBtnPrimary: {
        backgroundColor: "#1565C0",
    },
    modalBtnText: {
        fontSize: 15,
        fontWeight: "700",
    },
});
