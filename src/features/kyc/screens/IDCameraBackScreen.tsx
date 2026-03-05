import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width - 40; // trừ marginHorizontal 20 + 20
const CARD_HEIGHT = CARD_WIDTH / 1.6; // CCCD ratio

export default function IDCameraBackScreen() {
    const router = useRouter();
    const setBackUri = useKycStore((s) => s.setBackUri);

    const [permission, requestPermission] = useCameraPermissions();
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    // Scan line animation
    const scanAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    useEffect(() => {
        if (!capturedUri) {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(scanAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            );
            loop.start();
            return () => loop.stop();
        }
    }, [capturedUri]);

    const handleCapture = async () => {
        if (!cameraRef.current || isCapturing) return;
        setIsCapturing(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
            if (photo?.uri) {
                setCapturedUri(photo.uri);
            }
        } catch (e) {
            console.error("Chụp ảnh thất bại:", e);
        } finally {
            setIsCapturing(false);
        }
    };

    const handleRetake = () => setCapturedUri(null);

    const handleNext = () => {
        if (!capturedUri) return;

        const frontUri = useKycStore.getState().frontUri;
        if (!frontUri) {
            Alert.alert("Lỗi", "Không tìm thấy ảnh mặt trước. Vui lòng chụp lại.");
            router.replace("/id-camera-front");
            return;
        }

        // Lưu ảnh mặt sau vào store, chờ FaceCaptureScreen gọi API cả 3 ảnh
        setBackUri(capturedUri);
        router.push("/face-capture");
    };

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#1565C0" size="large" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.center}>
                <View style={styles.permCard}>
                    <MaterialCommunityIcons name="camera-off" size={56} color="#1565C0" />
                    <Text style={styles.permTitle}>Cần quyền camera</Text>
                    <Text style={styles.permText}>Ứng dụng cần truy cập camera để chụp ảnh CCCD của bạn</Text>
                    <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                        <Text style={styles.permBtnText}>Cấp quyền</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const scanTranslateY = scanAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, CARD_HEIGHT - 2],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            {/* Header */}
            <SafeAreaView style={styles.safeHeader}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A2E" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Xác minh danh tính</Text>
                        <Text style={styles.headerSub}>Bước 2 / 3</Text>
                    </View>
                    {/* Step indicators */}
                    <View style={styles.stepRow}>
                        <View style={[styles.stepDot, { backgroundColor: "#4CAF50" }]} />
                        <View style={[styles.stepLine, { backgroundColor: "#4CAF50" }]} />
                        <View style={[styles.stepDot, { backgroundColor: "#1565C0" }]} />
                        <View style={styles.stepLine} />
                        <View style={[styles.stepDot, { backgroundColor: "#CBD5E1" }]} />
                    </View>
                </View>
            </SafeAreaView>

            {/* Instruction card */}
            <View style={styles.instructionCard}>
                <LinearGradient
                    colors={["#E8F5E9", "#F0FDF4"]}
                    style={styles.instructionGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                    <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#2E7D32" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.instructionTitle}>Chụp mặt sau CCCD</Text>
                        <Text style={styles.instructionDesc}>Lật thẻ, đặt thẳng đứng — mã vạch hướng về phía camera</Text>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.content}>
                {!capturedUri ? (
                    <>
                        <Text style={styles.title}>Chụp mặt sau CCCD</Text>
                        <Text style={styles.subtitle}>Đặt mặt sau thẻ vào khung hình, đảm bảo rõ nét</Text>

                        <TouchableOpacity style={styles.tipsBtn} onPress={() => setShowTips(true)}>
                            <MaterialCommunityIcons name="information-outline" size={16} color="#EEB868" />
                            <Text style={styles.tipsBtnText}>Mẹo chụp ảnh</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={[styles.title, { marginTop: 24, marginBottom: 8 }]}>
                        Xác nhận ảnh chụp
                    </Text>
                )}

                {/* Camera / Preview */}
                <View style={styles.frameWrapper}>
                    {capturedUri ? (
                        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />
                    ) : (
                        <CameraView ref={cameraRef} style={styles.camera} facing="back">
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
                            <View style={styles.cornerBL} />
                            <View style={styles.cornerBR} />
                        </CameraView>
                    )}
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {capturedUri ? (
                    <View style={styles.reviewRow}>
                        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="camera-retake-outline" size={20} color="#1565C0" />
                            <Text style={styles.retakeText}>Chụp lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.nextBtn, isCapturing && { opacity: 0.7 }]}
                            onPress={handleNext}
                            disabled={isCapturing}
                            activeOpacity={0.85}
                        >
                            {isCapturing ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.nextText}>Tiếp tục</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.shutterRow}>
                        <TouchableOpacity
                            style={[styles.shutter, isCapturing && { opacity: 0.6 }]}
                            onPress={handleCapture}
                            disabled={isCapturing}
                            activeOpacity={0.8}
                        >
                            {isCapturing ? (
                                <ActivityIndicator color="#1565C0" size="small" />
                            ) : (
                                <View style={styles.shutterInner} />
                            )}
                        </TouchableOpacity>
                        <Text style={styles.shutterLabel}>Nhấn để chụp</Text>
                    </View>
                )}
            </View>

            {/* Tips Modal */}
            <Modal visible={showTips} transparent animationType="fade" onRequestClose={() => setShowTips(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#FBC02D" />
                            <Text style={styles.modalTitle}>Hướng dẫn chụp ảnh</Text>
                        </View>
                        <View style={styles.modalBody}>
                            <View style={styles.modalTipRow}>
                                <MaterialCommunityIcons name="white-balance-sunny" size={18} color="#2092EC" />
                                <Text style={styles.modalTipText}>Chụp nơi đủ ánh sáng, tránh ngược sáng</Text>
                            </View>
                            <View style={styles.modalTipRow}>
                                <MaterialCommunityIcons name="hand-pointing-left" size={18} color="#E53935" />
                                <Text style={styles.modalTipText}>Không che tay hoặc cắt mất góc thẻ</Text>
                            </View>
                            <View style={styles.modalTipRow}>
                                <MaterialCommunityIcons name="card-bulleted-outline" size={18} color="#4CAF50" />
                                <Text style={styles.modalTipText}>Đặt thẻ phẳng, không nghiêng hoặc cong</Text>
                            </View>
                            <View style={styles.modalTipRow}>
                                <MaterialCommunityIcons name="cellphone-check" size={18} color="#2092EC" />
                                <Text style={styles.modalTipText}>Giữ máy ổn định để tránh mờ ảnh</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.modalBtn} onPress={() => setShowTips(false)}>
                            <Text style={styles.modalBtnText}>Đã hiểu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 202;
const CORNER_SIZE = 28;
const CORNER_THICK = 3;
const CORNER_RADIUS = 8;
const CORNER_COLOR = "#1565C0";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA" },
    center: { flex: 1, backgroundColor: "#F5F7FA", alignItems: "center", justifyContent: "center" },

    permCard: {
        backgroundColor: "#FFF",
        margin: 24,
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        gap: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    permTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A2E" },
    permText: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 20 },
    permBtn: { backgroundColor: "#1565C0", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
    permBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

    safeHeader: { backgroundColor: "#F5F7FA" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 12,
    },
    content: {
        flex: 1,
    },
    iconBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center", justifyContent: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    headerCenter: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A2E" },
    headerSub: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
    stepRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    stepDot: { width: 8, height: 8, borderRadius: 4 },
    stepLine: { width: 20, height: 2, backgroundColor: "#CBD5E1", borderRadius: 1 },

    instructionCard: { marginHorizontal: 16, marginBottom: 12 },
    instructionGrad: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#BBF7D0",
    },
    instructionTitle: { fontSize: 14, fontWeight: "700", color: "#2E7D32" },
    instructionDesc: { fontSize: 12, color: "#4CAF50", marginTop: 2 },

    tipsBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        alignSelf: "center", marginTop: 16,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        backgroundColor: "rgba(255,184,104,0.15)",
    },
    tipsBtnText: { color: "#EEB868", fontSize: 13, fontWeight: "600" },

    frameWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignSelf: "center",
        marginTop: 32,
        marginBottom: 12,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#111",
    },
    camera: { flex: 1 },
    preview: { flex: 1 },

    cornerTL: { position: "absolute", top: 12, left: 12, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopLeftRadius: CORNER_RADIUS },
    cornerTR: { position: "absolute", top: 12, right: 12, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopRightRadius: CORNER_RADIUS },
    cornerBL: { position: "absolute", bottom: 12, left: 12, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomLeftRadius: CORNER_RADIUS },
    cornerBR: { position: "absolute", bottom: 12, right: 12, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomRightRadius: CORNER_RADIUS },

    controls: {
        paddingBottom: 40,
        paddingTop: 16,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    shutter: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: "#FFF",
        borderWidth: 5, borderColor: "rgba(255,255,255,0.25)",
        alignItems: "center", justifyContent: "center",
    },
    shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF" },

    scanLine: {
        position: "absolute",
        left: 12,
        right: 12,
        height: 2,
        borderRadius: 1,
        backgroundColor: "rgba(21, 101, 192, 0.75)",
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },

    capturedBadge: {
        position: "absolute",
        bottom: 12,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#4CAF50",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    capturedBadgeText: { color: "#FFF", fontWeight: "700", fontSize: 12 },

    hintText: {
        marginTop: 14,
        fontSize: 12,
        color: "#64748B",
        textAlign: "center",
        paddingHorizontal: 24,
    },

    controls: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 8,
        backgroundColor: "#F5F7FA",
    },
    shutterRow: { alignItems: "center", gap: 10 },
    shutter: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: "#FFF",
        borderWidth: 4, borderColor: "#1565C0",
        alignItems: "center", justifyContent: "center",
        elevation: 6,
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#1565C0" },
    shutterLabel: { fontSize: 13, color: "#64748B", fontWeight: "500" },

    reviewRow: { flexDirection: "row", gap: 12 },
    retakeBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 1.5, borderColor: "#2092EC", borderRadius: 16, paddingVertical: 16,
    },
    retakeText: { color: "#2092EC", fontWeight: "700", fontSize: 16 },
    nextBtn: {
        flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#2092EC", borderRadius: 16, paddingVertical: 16,
    },
    nextText: { color: "#FFF", fontWeight: "700", fontSize: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: 24 },
    modalCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 24, width: "100%", maxWidth: 340, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    modalHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", paddingBottom: 16, width: "100%", justifyContent: "center" },
    modalTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    modalBody: { width: "100%", paddingHorizontal: 8, gap: 14, marginBottom: 24 },
    modalTipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    modalTipText: { flex: 1, fontSize: 14, color: "#334155", lineHeight: 20 },
    modalBtn: { backgroundColor: "#2092EC", paddingVertical: 14, width: "100%", borderRadius: 14, alignItems: "center" },
    modalBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
