import { submitKycImages } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
const ENABLE_IMAGE_PICKER = true; // Set false to disable gallery selection

export default function FaceCaptureScreen() {
    const setFaceUri = useKycStore((s) => s.setFaceUri);
    const setRequestId = useKycStore((s) => s.setRequestId);
    const { requestId } = useAuthStore();
    const router = useRouter();

    const [permission, requestPermission] = useCameraPermissions();
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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
            console.error("Chụp ảnh khuôn mặt thất bại:", e);
            Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
        } finally {
            setIsCapturing(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setCapturedUri(result.assets[0].uri);
            }
        } catch (e) {
            console.error("Lỗi chọn ảnh từ thư viện:", e);
            Alert.alert("Lỗi", "Không thể chọn ảnh từ thư viện.");
        }
    };

    const handleRetake = () => setCapturedUri(null);

    const handleNext = async () => {
        if (!capturedUri) return;

        const { frontUri, backUri } = useKycStore.getState();

        if (!frontUri || !backUri) {
            Alert.alert("Lỗi", "Thiếu ảnh CCCD. Vui lòng chụp lại từ đầu.");
            router.replace("/id-camera-front");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();

            formData.append("frontImage", {
                uri: frontUri,
                name: frontUri.split("/").pop() || "front.jpg",
                type: "image/jpeg",
            } as any);

            formData.append("backImage", {
                uri: backUri,
                name: backUri.split("/").pop() || "back.jpg",
                type: "image/jpeg",
            } as any);

            formData.append("faceImage", {
                uri: capturedUri,
                name: capturedUri.split("/").pop() || "face.jpg",
                type: "image/jpeg",
            } as any);

            const serviceResponse = await submitKycImages(requestId || "", formData) as any;

            const isSuccess = serviceResponse.success ?? serviceResponse.Success;
            const message = serviceResponse.message ?? serviceResponse.Message;
            const resData = serviceResponse.data ?? serviceResponse.Data;
            const newRequestId = resData?.requestId ?? resData?.RequestId;

            if (isSuccess && newRequestId) {
                setFaceUri(capturedUri);
                setRequestId(newRequestId);
                router.push("/id-information");
            } else {
                Alert.alert("Xác minh thất bại", message || "Vui lòng thử lại.");
            }
        } catch (error: any) {
            console.error("Upload KYC thất bại:", error);
            const serverMsg = error?.response?.data?.message;
            Alert.alert(
                "Lỗi",
                serverMsg || "Không thể gửi ảnh lên máy chủ. Vui lòng thử lại."
            );
        } finally {
            setIsUploading(false);
        }
    };

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
                <Text style={styles.permText}>Cần quyền truy cập camera để xác thực khuôn mặt</Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                    <Text style={styles.permBtnText}>Cấp quyền</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* ── Upload Loading Overlay (dark theme — đồng bộ màn hình camera) ── */}
            <Modal visible={isUploading} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>

                        <View style={styles.loadingSpinnerWrap}>
                            <ActivityIndicator size="large" color="#2092EC" />
                        </View>

                        <Text style={styles.loadingTitle}>Đang xử lý ảnh</Text>
                        <Text style={styles.loadingDesc}>
                            Hệ thống đang tải lên và xác thực{"\n"}3 hình ảnh của bạn. Vui lòng chờ...
                        </Text>

                        {/* Danh sách hình đang gửi */}
                        <View style={styles.uploadList}>
                            {[
                                { icon: "card-account-details", label: "Ảnh mặt trước CCCD" },
                                { icon: "card-account-details-outline", label: "Ảnh mặt sau CCCD" },
                                { icon: "face-recognition", label: "Ảnh khuôn mặt" },
                            ].map((item, i) => (
                                <View key={i} style={styles.uploadItem}>
                                    <View style={styles.uploadIconWrap}>
                                        <MaterialCommunityIcons
                                            name={item.icon as any}
                                            size={16}
                                            color="#2092EC"
                                        />
                                    </View>
                                    <Text style={styles.uploadLabel}>{item.label}</Text>
                                    <ActivityIndicator size="small" color="#2092EC" />
                                </View>
                            ))}
                        </View>

                        <Text style={styles.loadingNote}>
                            Không tắt ứng dụng trong lúc đang tải lên
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: "#4CAF50" }]} />
                    <View style={[styles.stepDot, { backgroundColor: "#4CAF50", marginLeft: 4 }]} />
                    <View style={[styles.stepLine, { backgroundColor: "#2092EC", marginHorizontal: 6 }]} />
                    <View style={[styles.stepDot, { backgroundColor: "#2092EC" }]} />
                </View>
                <View style={{ width: 40 }} />
            </View>

            <Text style={styles.title}>Xác thực khuôn mặt</Text>
            <Text style={styles.subtitle}>Đặt khuôn mặt vào trong vòng tròn, giữ máy ổn định</Text>

            {/* Camera / Preview */}
            <View style={styles.cameraWrapper}>
                {capturedUri ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="cover" />
                        <View style={styles.circularOverlay} />
                    </View>
                ) : (
                    <CameraView ref={cameraRef} style={styles.camera} facing="front">
                        <View style={styles.overlay}>
                            <View style={styles.circularHole} />
                        </View>
                    </CameraView>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {capturedUri ? (
                    <View style={styles.reviewRow}>
                        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                            <MaterialCommunityIcons name="camera-retake" size={20} color="#2092EC" />
                            <Text style={styles.retakeText}>Chụp lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.nextBtn, isUploading && { opacity: 0.6 }]}
                            onPress={handleNext}
                            disabled={isUploading}
                        >
                            <Text style={styles.nextText}>Tiếp tục</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.captureRow}>
                        {ENABLE_IMAGE_PICKER && (
                            <TouchableOpacity
                                style={styles.pickImageBtn}
                                onPress={handlePickImage}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="image-multiple" size={26} color="#FFF" />
                            </TouchableOpacity>
                        )}
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
                        {ENABLE_IMAGE_PICKER && (
                            <View style={{ width: 44 }} /> /* Spacer để cân bằng justify-content */
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    center: {
        flex: 1, backgroundColor: "#0A0A0A",
        alignItems: "center", justifyContent: "center", gap: 16,
    },
    permText: { color: "#FFF", fontSize: 15, opacity: 0.7, textAlign: "center", paddingHorizontal: 40 },
    permBtn: { backgroundColor: "#2092EC", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    permBtnText: { color: "#FFF", fontWeight: "700" },

    /* ── Loading Overlay (dark, khớp nền camera) ── */
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.88)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
    },
    loadingCard: {
        backgroundColor: "#111827",
        borderRadius: 24,
        padding: 28,
        width: "100%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(32,146,236,0.25)",
    },
    loadingSpinnerWrap: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: "rgba(32,146,236,0.12)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    loadingTitle: {
        color: "#F1F5F9",
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
    },
    loadingDesc: {
        color: "rgba(241,245,249,0.5)",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 22,
    },
    uploadList: { width: "100%", gap: 8, marginBottom: 20 },
    uploadItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    uploadIconWrap: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: "rgba(32,146,236,0.13)",
        alignItems: "center", justifyContent: "center",
    },
    uploadLabel: {
        flex: 1,
        color: "rgba(241,245,249,0.75)",
        fontSize: 13,
        fontWeight: "500",
    },
    loadingNote: {
        color: "rgba(255,255,255,0.25)",
        fontSize: 11,
        textAlign: "center",
    },

    /* ── Header ── */
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 8,
    },
    iconBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center", justifyContent: "center",
    },
    stepRow: { flexDirection: "row", alignItems: "center" },
    stepDot: { width: 10, height: 10, borderRadius: 5 },
    stepLine: { width: 40, height: 2, borderRadius: 1 },

    title: { color: "#FFF", fontSize: 20, fontWeight: "700", textAlign: "center", marginTop: 12 },
    subtitle: {
        color: "rgba(255,255,255,0.5)", fontSize: 13,
        textAlign: "center", marginTop: 6, paddingHorizontal: 32,
    },

    cameraWrapper: { flex: 1, marginTop: 30, alignItems: "center", justifyContent: "center" },
    camera: { width: 320, height: 320, borderRadius: 160, overflow: "hidden" },
    previewContainer: { width: 320, height: 320, borderRadius: 160, overflow: "hidden" },
    preview: { width: "100%", height: "100%" },
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center", alignItems: "center",
    },
    circularHole: {
        width: 300, height: 300, borderRadius: 150,
        borderWidth: 3, borderColor: "#2092EC", borderStyle: "dashed",
    },
    circularOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 160, borderWidth: 4, borderColor: "#4CAF50",
    },

    controls: { height: 150, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
    shutter: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: "#FFF",
        borderWidth: 6, borderColor: "rgba(255,255,255,0.25)",
        alignItems: "center", justifyContent: "center",
    },
    shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF" },
    reviewRow: { flexDirection: "row", gap: 16, width: "100%" },
    retakeBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 1.5, borderColor: "#2092EC", borderRadius: 14, paddingVertical: 14,
    },
    retakeText: { color: "#2092EC", fontWeight: "700", fontSize: 15 },
    nextBtn: {
        flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#2092EC", borderRadius: 14, paddingVertical: 14,
    },
    nextText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
    captureRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        gap: 30
    },
    pickImageBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center", justifyContent: "center",
    },
});
