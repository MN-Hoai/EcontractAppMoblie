import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function IDCameraFrontScreen() {
    const router = useRouter();
    const setFrontUri = useKycStore((s) => s.setFrontUri);

    const [permission, requestPermission] = useCameraPermissions();
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    // Scan line animation
    const scanAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    useFocusEffect(
        useCallback(() => {
            const frontUri = useKycStore.getState().frontUri;
            if (!frontUri) {
                setCapturedUri(null);
            }
        }, [])
    );

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
        setFrontUri(capturedUri);
        router.push("/id-camera-back");
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

    // Scan line translateY interpolation over card height (~380px)
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
                        <Text style={styles.headerSub}>Bước 1 / 3</Text>
                    </View>
                    {/* Step indicators */}
                    <View style={styles.stepRow}>
                        <View style={[styles.stepDot, { backgroundColor: "#1565C0" }]} />
                        <View style={styles.stepLine} />
                        <View style={[styles.stepDot, { backgroundColor: "#CBD5E1" }]} />
                        <View style={styles.stepLine} />
                        <View style={[styles.stepDot, { backgroundColor: "#CBD5E1" }]} />
                    </View>
                </View>
            </SafeAreaView>

            {/* Instruction card */}
            <View style={styles.instructionCard}>
                <LinearGradient
                    colors={["#E3F2FD", "#EFF6FF"]}
                    style={styles.instructionGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                    <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#1565C0" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.instructionTitle}>Chụp mặt trước CCCD</Text>
                        <Text style={styles.instructionDesc}>Đặt thẻ thẳng đứng, đảm bảo rõ nét & đủ sáng</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Camera / Preview Frame — Portrait (dọc) */}
            <View style={styles.frameArea}>
                <View style={styles.frameShadow}>
                    <View style={styles.frameWrapper}>
                        {capturedUri ? (
                            <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />
                        ) : (
                            <CameraView ref={cameraRef} style={styles.camera} facing="back">
                                {/* Dimmed overlay with center cutout */}
                                <View style={StyleSheet.absoluteFill}>
                                    {/* Corners */}
                                    <View style={styles.cornerTL} />
                                    <View style={styles.cornerTR} />
                                    <View style={styles.cornerBL} />
                                    <View style={styles.cornerBR} />
                                    {/* Animated scan line */}
                                    <Animated.View
                                        style={[styles.scanLine, { transform: [{ translateY: scanTranslateY }] }]}
                                    />
                                </View>
                            </CameraView>
                        )}

                        {/* Captured overlay */}
                        {capturedUri && (
                            <View style={styles.capturedBadge}>
                                <MaterialCommunityIcons name="check-circle" size={18} color="#FFF" />
                                <Text style={styles.capturedBadgeText}>Đã chụp</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Hint text */}
                {!capturedUri && (
                    <Text style={styles.hintText}>📱 Giữ điện thoại thẳng đứng • Căn thẻ vào trong khung</Text>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {capturedUri ? (
                    <View style={styles.reviewRow}>
                        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="camera-retake-outline" size={20} color="#1565C0" />
                            <Text style={styles.retakeText}>Chụp lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
                            <Text style={styles.nextText}>Tiếp theo</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
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
    backBtn: {
        width: 42, height: 42, borderRadius: 13,
        backgroundColor: "#FFF",
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
        borderColor: "#BFDBFE",
    },
    instructionTitle: { fontSize: 14, fontWeight: "700", color: "#1565C0" },
    instructionDesc: { fontSize: 12, color: "#3B82F6", marginTop: 2 },

    frameArea: { flex: 1, alignItems: "center", justifyContent: "center" },
    frameShadow: {
        elevation: 12,
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        borderRadius: 20,
    },
    frameWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
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
        borderWidth: 1.5, borderColor: "#1565C0", borderRadius: 16, paddingVertical: 16,
        backgroundColor: "#FFF",
    },
    retakeText: { color: "#1565C0", fontWeight: "700", fontSize: 15 },
    nextBtn: {
        flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#1565C0", borderRadius: 16, paddingVertical: 16,
        elevation: 4,
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    nextText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
