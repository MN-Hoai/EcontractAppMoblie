import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCheckCaStatus } from "@/queries/contract";
import { useGetIdNumberMutation } from "@/queries/customer";
import { useCloudCaHash, useGetSignature, useInsertCloudCaSign } from "@/queries/signing";
import { ENV } from "@/config/env";
import { useAuthStore } from "@/store/auth-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { SignOptionsModal } from "../components/SignOptionsModal";
import { SignaturePlacementModal } from "../components/SignaturePlacementModal";

const CONTRACT_INFO = [
    { label: "Số hợp đồng", value: "HĐ-2025/01/0042" },
    { label: "Ngày tạo", value: "23/02/2026" },
    { label: "Người tạo", value: "Nguyễn Văn A" },
    { label: "Đơn vị", value: "Phòng Kinh doanh" },
    { label: "Loại hợp đồng", value: "Hợp đồng nội bộ" },
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

    // React Query hooks
    const checkCaStatusMutation = useCheckCaStatus();
    const getIdNumberMutation = useGetIdNumberMutation();
    const cloudCaHashMutation = useCloudCaHash();
    const getSignatureMutation = useGetSignature();
    const insertCloudCaSignMutation = useInsertCloudCaSign();

    // --- Sign Contract State ---
    const [showSignOptions, setShowSignOptions] = useState(false);
    const [showPlacementModal, setShowPlacementModal] = useState(false);
    const [signatureConfig, setSignatureConfig] = useState<any>(null);
    const [showProcessing, setShowProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(100);
    const [signError, setSignError] = useState<string | null>(null);
    const [signStatus, setSignStatus] = useState<string>("Đang khởi tạo...");
    const [showError, setShowError] = useState(false);

    // Countdown logic
    useEffect(() => {
        if (!showProcessing) return;
        if (countdown <= 0) {
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [showProcessing, countdown]);



    const pathStr = params.path as string;
    let finalDocUrl = "";
    if (pathStr) {
        if (pathStr.startsWith("http")) {
            finalDocUrl = pathStr;
        } else {
            const connector = pathStr.startsWith("/") ? "" : "/";
            finalDocUrl = `${ENV.API_CONTRACT_URL}${connector}${pathStr}`;
        }
    }

    const handleSign = async (config?: any) => {
        console.log("====> START handleSign! User clicked 'Ký duyệt' <====");
        try {
            setLoadingCa(true);
            const res = await checkCaStatusMutation.mutateAsync(requestId || "");
            console.log("====> checkCaStatus API result:", res);

            const isSuccess = res.Success ?? res.success;
            const data = res.Data ?? res.data;
            const message = res.Message ?? res.message ?? "Bạn chưa tích hợp chứng thư số";

            if (isSuccess && data === true) {
                // Have CA -> trigger sign contract directly
                console.log("====> CA status is OK (data=true), calling handleProceedToSign()");
                handleProceedToSign(config);
            } else {
                console.log("====> CA status is NOT OK (data=" + data + "), showing CA Modal:", message);
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

    // ---> UPDATE: Nhận cấu hình chữ ký từ SignOptionsModal
    const handleProceedToSign = async (signatureConfig?: any) => {
        console.log("====> BẮT ĐẦU QUY TRÌNH KÝ <====");
        const accountId = requestId || "";
        const contractId = (params.contractId as string) || (params.id as string) || "";

        setShowProcessing(true);
        setSignError(null);
        setCountdown(120);
        setSignStatus("Đang khởi tạo tiến trình ký...");

        try {
            setSignStatus("Đang lấy thông tin định danh...");
            console.log("===> Lấy CCCD (idNo) từ API...");
            const idNumberRes = await getIdNumberMutation.mutateAsync(accountId);
            const isSuccessId = idNumberRes?.success ?? idNumberRes?.Success;
            const dataObj = idNumberRes?.data ?? idNumberRes?.Data;
            const idNo = dataObj?.IdNumber ?? dataObj?.idNumber;

            if (!isSuccessId || !idNo) {
                Alert.alert("Lỗi", "Không lấy được số CCCD từ hệ thống.");
                setShowProcessing(false);
                return;
            }

            // --- 1. GỌI API cloudca-get-hash ---
            setSignStatus("Đang tạo mã hash hợp đồng...");
            let rawBase64 = signatureConfig?.imageBase64 || "";
            if (rawBase64.includes("base64,")) {
                rawBase64 = rawBase64.split("base64,")[1];
            }

            const hashPayload = {
                contractId: contractId,
                signImageBase64: rawBase64,
                certChainBase64: Array.isArray(signatureConfig?.certificateData)
                    ? signatureConfig.certificateData
                    : (signatureConfig?.certificateData ? [signatureConfig.certificateData] : [])
            };
            console.log("===> Gọi API cloudca-get-hash với payload (ẩn base64 dài):", JSON.stringify({
                ...hashPayload,
                signImageBase64: rawBase64 ? `${rawBase64.substring(0, 50)}...` : "",
                certChainBase64: hashPayload.certChainBase64.length > 0 ? [`${hashPayload.certChainBase64[0].substring(0, 50)}...`, `(+${hashPayload.certChainBase64.length - 1} more)`] : []
            }));

            const hashResult = await cloudCaHashMutation.mutateAsync(hashPayload);
            console.log("===> KẾT QUẢ API cloudca-get-hash:", JSON.stringify(hashResult, null, 2));

            if (hashResult?.message || hashResult?.Message) {
                setSignStatus(hashResult?.message || hashResult?.Message);
            }

            const isHashSuccess = hashResult?.success || hashResult?.Success;
            if (!isHashSuccess) {
                setShowProcessing(false);
                setSignError(hashResult?.message || hashResult?.Message || "Tạo Hash thất bại.");
                setShowError(true);
                return;
            }

            const hashBase64 = hashResult?.hashBase64 || hashResult?.data?.hashBase64;
            const fieldName = hashResult?.fieldName || hashResult?.data?.fieldName;
            const certId = signatureConfig?.selectedCertificate || "";

            if (!hashBase64 || !fieldName) {
                setShowProcessing(false);
                setSignError("Dữ liệu Hash trả về không hợp lệ.");
                setShowError(true);
                return;
            }

            // --- 2. GỌI DEEPLINK ĐỂ XÁC NHẬN APP MYSIGN ---
            setSignStatus("Đang mở ứng dụng MySign để xác nhận...");
            const myCallBack = "econtact://";
            const directMySignUrl = `mysign://mysignws/open_screen?name=home&agency=Office_AI_0318237748&idNo=${idNo}&mainCode=MAINCODE&vasCode=VAS1&callBack=${encodeURIComponent(myCallBack)}&deviceId=`;

            setTimeout(async () => {
                try {
                    await Linking.openURL(directMySignUrl);
                } catch (e) {
                    if (Platform.OS === 'android') Linking.openURL("https://play.google.com/store/apps/details?id=com.viettel.cloud.ca.mysign");
                    else if (Platform.OS === 'ios') Linking.openURL("https://apps.apple.com/vn/app/mysign/id1633019232?l=vi");
                }
            }, 500);

            // --- 3. GỌI get-signature ĐỂ CHỜ LẤY KẾT QUẢ KÝ ---
            setSignStatus("Vui lòng xác nhận trên app MySign...");
            console.log("===> Đang chờ kết quả từ API get-signature với filename:", fieldName, "certificateId:", certId);
            const sigResult = await getSignatureMutation.mutateAsync({
                filename: fieldName,
                certificateId: certId,
                filehash: hashBase64,
                contractId: contractId,
                accountId: accountId,
            });
            console.log("===> KẾT QUẢ API get-signature:", JSON.stringify(sigResult, null, 2));

            if (sigResult?.message || sigResult?.Message) {
                setSignStatus(sigResult?.message || sigResult?.Message);
            }

            const isSigSuccess = sigResult?.success ?? sigResult?.Success;
            if (!isSigSuccess) {
                setShowProcessing(false);
                setSignError(sigResult?.message || sigResult?.Message || "Lấy signature thất bại.");
                setShowError(true);
                return;
            }

            const sigData = sigResult?.Data || sigResult?.data;
            const cmsSignature = sigData?.signature;
            const signFileName = sigData?.filename || fieldName;

            if (!cmsSignature) {
                setShowProcessing(false);
                setSignError("Không trích xuất được signature từ kết quả trả về.");
                setShowError(true);
                return;
            }

            // --- 4. GỌI API cloudca-insert-sign ---
            setSignStatus("Đang hoàn tất việc chèn chữ ký...");
            console.log("===> Bắt đầu chèn chữ ký vào contract...");
            const insertPayload = {
                contractId: contractId,
                fieldName: signFileName,
                signatureBase64: cmsSignature
            };

            const insertResult = await insertCloudCaSignMutation.mutateAsync(insertPayload);
            const isInsertSuccess = insertResult?.success ?? insertResult?.Success;

            if (insertResult?.message || insertResult?.Message) {
                setSignStatus(insertResult?.message || insertResult?.Message);
            }

            if (isInsertSuccess) {
                setShowProcessing(false);
                setShowSuccess(true);
            } else {
                setShowProcessing(false);
                setSignError(insertResult?.message || insertResult?.Message || "Lỗi insert chữ ký.");
                setShowError(true);
            }

        } catch (err: any) {
            setShowProcessing(false);
            // Ưu tiên lấy message từ server nếu có (đề phòng service chưa catch)
            const errMsg = err.response?.data?.message || err.response?.data?.Message || err.message || "Lỗi tiến trình ký số.";
            setSignError(errMsg);
            setShowError(true);
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
                            <View style={[
                                styles.statusDot,
                                {
                                    backgroundColor: params.status === '1' ? "#fcb628" :
                                        params.status === '2' ? "#72e028" :
                                            params.status === '0' ? "#484848" : "#ff4d4a"
                                }
                            ]} />
                            <ThemedText style={styles.statusText}>
                                {params.status === '1' ? "Chờ ký" :
                                    params.status === '2' ? "Đã ký " :
                                        params.status === '0' ? "Nháp" : "Hủy"}
                            </ThemedText>
                        </View>
                        <TouchableOpacity
                            style={styles.bannerViewBtn}
                            onPress={() => router.push({
                                pathname: "/contract-content",
                                params: { id: params.id, name: params.name, path: params.path, status: params.status }
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



                {/* Action Buttons: Only show for 'Waiting' (1) status */}
                {params.status === '1' && (
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
                            onPress={() => setShowSignOptions(true)}
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
                )}
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
                        <ThemedText style={{ fontSize: 17, fontWeight: "700", marginBottom: 10 }}>{signStatus}</ThemedText>
                        <ThemedText style={{ fontSize: 13, textAlign: "center", opacity: 0.7, marginBottom: 20 }}>Vui lòng không đóng ứng dụng trong lúc hệ thống đang thực hiện ký số.</ThemedText>
                    </View>
                </View>
            </Modal>

            {/* ── Error modal ── */}
            <Modal visible={showError} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? "#1D3D47" : "#FFF", alignItems: "center", paddingVertical: 32 }]}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#FF5252", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <MaterialCommunityIcons name="close-circle-outline" size={40} color="#FFF" />
                        </View>
                        <ThemedText style={{ fontSize: 20, fontWeight: "800", color: "#FF5252", marginBottom: 10, textAlign: 'center' }}>Ký số không thành công</ThemedText>
                        <ThemedText style={{ fontSize: 14, textAlign: "center", opacity: 0.8, marginBottom: 24, lineHeight: 22 }}>{signError}</ThemedText>

                        <TouchableOpacity
                            style={{ backgroundColor: "#1565C0", borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" }}
                            onPress={() => setShowError(false)}
                        >
                            <ThemedText style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>Đóng</ThemedText>
                        </TouchableOpacity>
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

            <SignOptionsModal
                visible={showSignOptions}
                onClose={() => setShowSignOptions(false)}
                onConfirm={(config) => {
                    setShowSignOptions(false);
                    handleSign(config);
                }}
            />

            <SignaturePlacementModal
                visible={showPlacementModal}
                pdfUrl={finalDocUrl}
                config={signatureConfig}
                onClose={() => setShowPlacementModal(false)}
                onConfirm={(position) => {
                    setShowPlacementModal(false);
                    console.log("===> Đã chọn vị trí ký hợp lệ: ", position);
                    // Ở đây có thể lưu lại toạ độ vào payload cho backend
                    handleSign();
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 45,
        flex: 1
    },
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
