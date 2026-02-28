import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width - 40; // trừ marginHorizontal 20 + 20
const CARD_HEIGHT = CARD_WIDTH / 1.6; // CCCD ratio
export default function IDCameraFrontScreen() {
    const router = useRouter();
    const setFrontUri = useKycStore((s) => s.setFrontUri);

    const [permission, requestPermission] = useCameraPermissions();
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

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
        setFrontUri(capturedUri);
        router.push("/id-camera-back");
    };

    // Chưa có quyền
    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#2092EC" size="large" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <MaterialCommunityIcons name="camera-off" size={48} color="#999" />
                <Text style={styles.permText}>Cần quyền truy cập camera</Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                    <Text style={styles.permBtnText}>Cấp quyền</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="close" size={26} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: "#2092EC" }]} />
                    <View style={[styles.stepLine]} />
                    <View style={[styles.stepDot, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {!capturedUri ? (
                    <>
                        <Text style={styles.title}>Chụp mặt trước CCCD</Text>
                        <Text style={styles.subtitle}>
                            Đặt mặt trước thẻ vào khung hình, đảm bảo rõ nét
                        </Text>

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
                            {/* Corner guides */}
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
                            <View style={styles.cornerBL} />
                            <View style={styles.cornerBR} />
                        </CameraView>
                    )}
                </View>

            </View>

            {/* Controls (At bottom) */}
            <View style={styles.controls}>
                {capturedUri ? (
                    <View style={styles.reviewRow}>
                        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                            <MaterialCommunityIcons name="camera-retake" size={20} color="#2092EC" />
                            <Text style={styles.retakeText}>Chụp lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                            <Text style={styles.nextText}>Tiếp theo</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.shutter}
                        onPress={handleCapture}
                        disabled={isCapturing}
                        activeOpacity={0.7}
                    >
                        {isCapturing
                            ? <ActivityIndicator color="#111" />
                            : <View style={styles.shutterInner} />
                        }
                    </TouchableOpacity>
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

const CORNER_SIZE = 24;
const CORNER_THICK = 3;
const CORNER_RADIUS = 6;
const CORNER_COLOR = "#2092EC";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    center: { flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center", gap: 16 },
    permText: { color: "#FFF", fontSize: 15, opacity: 0.7 },
    permBtn: { backgroundColor: "#2092EC", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    permBtnText: { color: "#FFF", fontWeight: "700" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 8,
    },
    content: {
        flex: 1,
    },
    iconBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center", justifyContent: "center",
    },
    stepRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    stepDot: { width: 10, height: 10, borderRadius: 5 },
    stepLine: { width: 32, height: 2, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 1 },
    title: { color: "#FFF", fontSize: 20, fontWeight: "700", textAlign: "center", marginTop: 12 },
    subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", marginTop: 6, paddingHorizontal: 32 },

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

    // Corner guides
    cornerTL: { position: "absolute", top: 16, left: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopLeftRadius: CORNER_RADIUS },
    cornerTR: { position: "absolute", top: 16, right: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopRightRadius: CORNER_RADIUS },
    cornerBL: { position: "absolute", bottom: 16, left: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomLeftRadius: CORNER_RADIUS },
    cornerBR: { position: "absolute", bottom: 16, right: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomRightRadius: CORNER_RADIUS },

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

    reviewRow: { flexDirection: "row", gap: 16, width: "100%" },
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
