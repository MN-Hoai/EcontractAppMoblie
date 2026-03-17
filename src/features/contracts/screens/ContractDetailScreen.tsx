import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { checkCaStatus, executeExternalSignContract } from "@/services/contractService";
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
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

const CONTRACT_INFO = [
    { label: "Số hợp đồng", value: "HĐ-2025/01/0042" },
    { label: "Ngày tạo", value: "23/02/2026" },
    { label: "Người tạo", value: "Nguyễn Văn A" },
    { label: "Đơn vị", value: "Phòng Kinh doanh" },
    { label: "Loại hợp đồng", value: "Hợp đồng nội bộ" },
];

const SIGN_STEPS = [
    { name: "Phòng HR", role: "Giám đốc nhân sự", status: "signed" },
    { name: "Ban Kinh doanh", role: "Trưởng phòng", status: "waiting" },
    { name: "Tổng giám đốc", role: "CEO", status: "pending" },
];

export default function ContractDetailScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const params = useLocalSearchParams();
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

    const getStepStyle = (status: string) => {
        if (status === "signed") return { dot: "#4CAF50", label: "Đã ký", color: "#4CAF50" };
        if (status === "waiting") return { dot: "#FBC02D", label: "Chờ ký", color: "#FBC02D" };
        return { dot: "#9E9E9E", label: "Chưa đến lượt", color: "#9E9E9E" };
    };

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
        const accountId = requestId || ""; // Or we might need user?.id if requestId is not right. Assuming requestId works for this screen context as per user implementation, but SignContractScreen used user?.id. Will use requestId as it was used in checkCaStatus here.
        const contractId = (params.contractId as string) || (params.id as string) || ""; // Adjust based on how contractId is passed

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
            <View style={styles.header}>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Chi tiết hợp đồng</ThemedText>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <MaterialCommunityIcons name="dots-vertical" size={22} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <LinearGradient
                    colors={["#2092EC", "#054D8C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bannerCard}
                >
                    <View style={styles.bannerMainRow}>
                        <View style={styles.bannerIcon}>
                            <MaterialCommunityIcons name="file-document-outline" size={28} color="#FFF" />
                        </View>
                        <ThemedText style={styles.bannerTitle} numberOfLines={2}>
                            {params.name as string || "Hợp đồng cung cấp thiết bị số 12345678901234567890"}
                        </ThemedText>
                    </View>

                    <View style={styles.bannerActionRow}>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <ThemedText style={styles.statusText}>Chờ duyệt</ThemedText>
                        </View>
                        <TouchableOpacity
                            style={styles.bannerViewBtn}
                            onPress={() => router.push({
                                pathname: "/contract-content",
                                params: { id: params.id, name: params.name, path: params.path }
                            })}
                        >
                            <MaterialCommunityIcons name="file-eye-outline" size={18} color="#FFF" />
                            <ThemedText style={styles.bannerViewBtnText}>Xem chi tiết</ThemedText>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Contract Info */}
                <View style={[styles.card, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <ThemedText style={styles.cardTitle}>Thông tin hợp đồng</ThemedText>
                    {CONTRACT_INFO.map((item, idx) => (
                        <View key={idx}>
                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>{item.label}</ThemedText>
                                <ThemedText style={styles.infoValue}>{item.value}</ThemedText>
                            </View>
                            {idx < CONTRACT_INFO.length - 1 && (
                                <View style={{ height: 1, backgroundColor: "rgba(0,0,0,0.04)", marginVertical: 10 }} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Sign Flow */}
                <View style={[styles.card, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <ThemedText style={styles.cardTitle}>Luồng ký duyệt</ThemedText>
                    {SIGN_STEPS.map((step, idx) => {
                        const s = getStepStyle(step.status);
                        return (
                            <View key={idx} style={styles.stepRow}>
                                <View style={styles.stepTrack}>
                                    <View style={[styles.stepDot, { backgroundColor: s.dot }]}>
                                        {step.status === "signed" && <MaterialCommunityIcons name="check" size={11} color="#FFF" />}
                                    </View>
                                    {idx < SIGN_STEPS.length - 1 && (
                                        <View style={[styles.stepLine, { backgroundColor: idx === 0 ? "#4CAF50" : "rgba(0,0,0,0.07)" }]} />
                                    )}
                                </View>
                                <View style={styles.stepInfo}>
                                    <ThemedText style={styles.stepName}>{step.name}</ThemedText>
                                    <ThemedText style={styles.stepRole}>{step.role}</ThemedText>
                                    <ThemedText style={[styles.stepStatus, { color: s.color }]}>{s.label}</ThemedText>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons name="close-circle-outline" size={20} color="#64748B" />
                        <ThemedText style={styles.rejectBtnText}>Từ chối</ThemedText>
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
                            {loadingCa ? "Đang kiểm tra..." : "Ký duyệt"}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Modal Chứng thư số */}
            <Modal visible={showCaModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
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
            </Modal>

            {/* ── Processing modal ── */}
            <Modal visible={showProcessing} transparent animationType="fade">
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
            </Modal>

            {/* ── Success modal ── */}
            <Modal visible={showSuccess} transparent animationType="fade">
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
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    iconBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        alignItems: "center", justifyContent: "center",
        elevation: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    bannerCard: {
        padding: 24,
        borderRadius: 20,
        marginBottom: 16,
    },
    bannerIcon: {
        width: 48, height: 48,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center", justifyContent: "center",
    },
    bannerMainRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        marginBottom: 20,
    },
    bannerTitle: {
        color: "#FFF",
        fontSize: 17,
        fontWeight: "700",
        flex: 1,
        lineHeight: 24,
    },
    bannerActionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: "#FBC02D",
    },
    statusText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "700",
    },
    bannerViewBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.18)",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    bannerViewBtnText: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "700",
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        opacity: 0.5,
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 13,
        opacity: 0.5,
        flex: 1,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: "700",
        flex: 1,
        textAlign: "right",
    },
    stepRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    stepTrack: {
        width: 24,
        alignItems: "center",
        marginRight: 16,
    },
    stepDot: {
        width: 22, height: 22,
        borderRadius: 11,
        alignItems: "center", justifyContent: "center",
    },
    stepLine: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
    stepInfo: {
        flex: 1,
        paddingBottom: 16,
    },
    stepName: {
        fontSize: 14,
        fontWeight: "700",
    },
    stepRole: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
    stepStatus: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 4,
    },
    outlineBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderWidth: 1.5,
        borderRadius: 14,
        paddingVertical: 14,
        marginBottom: 12,
    },
    outlineBtnText: {
        fontSize: 15,
        fontWeight: "700",
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    rejectBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#F1F5F9",
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        paddingVertical: 14,
    },
    rejectBtnText: {
        color: "#64748B",
        fontSize: 15,
        fontWeight: "700",
    },
    signBtn: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#1565C0",
        borderRadius: 14,
        paddingVertical: 14,
    },
    signBtnText: {
        color: "#FFF",
        fontSize: 16,
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
