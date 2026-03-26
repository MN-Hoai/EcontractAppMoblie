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
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const ENABLE_IMAGE_PICKER = true;

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
            console.log("Chụp ảnh khuôn mặt thất bại:", e);
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
            console.log("Lỗi chọn ảnh từ thư viện:", e);
        }
    };

    const handleRetake = () => setCapturedUri(null);

    const handleNext = async () => {
        if (!capturedUri) return;

        const { frontUri, backUri } = useKycStore.getState();

        if (!frontUri || !backUri) {
            Alert.alert(
                "Thông báo",
                "Thiếu ảnh CCCD. Vui lòng chụp lại từ bước 1.",
                [{
                    text: "Chụp lại",
                    onPress: () => {
                        useKycStore.getState().reset();
                        router.replace("/id-camera-front");
                    }
                }]
            );
            return;
        }

        setIsUploading(true);
        console.log("[KYC Debug] - Bắt đầu quá trình tải lên ảnh...");
        console.log("[KYC Debug] - requestId hiện tại:", requestId);

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

            console.log("[KYC Debug] - FormData keys:", ["frontImage", "backImage", "faceImage"]);
            console.log("[KYC Debug] - Đang gọi API 'submitKycImages'...");

            const serviceResponse = await submitKycImages(requestId || "", formData) as any;

            console.log("[KYC Debug] - Phản hồi từ API:", JSON.stringify(serviceResponse, null, 2));

            const isSuccess = serviceResponse.success ?? serviceResponse.Success;
            const message = serviceResponse.message ?? serviceResponse.Message;
            const resData = serviceResponse.data ?? serviceResponse.Data;
            const newRequestId = resData?.requestId ?? resData?.RequestId;

            if (isSuccess && newRequestId) {
                console.log("[KYC Debug] - Thành công! Đang chuyển sang trang ID Information. NewRequestId:", newRequestId);
                setFaceUri(capturedUri);
                setRequestId(newRequestId);
                router.push("/id-information");
            } else {
                console.error("[KYC Debug] - API trả về thất bại:", message);
                Alert.alert(
                    "Thông báo",
                    (message || "Ảnh không hợp lệ hoặc không rõ nét. Vui lòng chụp lại từ bước 1."),
                    [{
                        text: "Chụp lại",
                        onPress: () => {
                            useKycStore.getState().reset();
                            router.replace("/id-camera-front");
                        }
                    }]
                );
            }
        } catch (error: any) {
            console.error("[KYC Debug] - Lỗi hệ thống khi gọi API:", error);
            if (error.response) {
                console.error("[KYC Debug] - Data lỗi từ Server:", error.response.data);
                console.error("[KYC Debug] - Status code:", error.response.status);
            }

            const serverMsg = error?.response?.data?.message || "Có lỗi xảy ra hoặc ảnh không hợp lệ. Vui lòng chụp lại từ bước 1.";
            Alert.alert(
                "Thông báo",
                serverMsg.replace("Lỗi hệ thống: ", "").replace("Lỗi nội bộ: ", ""),
                [{
                    text: "Chụp lại",
                    onPress: () => {
                        useKycStore.getState().reset();
                        router.replace("/id-camera-front");
                    }
                }]
            );
        } finally {
            setIsUploading(false);
            console.log("[KYC Debug] - Kết thúc quá trình gọi API.");
        }
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
                    <Text style={styles.permText}>Ứng dụng cần quyền truy cập camera để thực hiện bước xác thực khuôn mặt</Text>
                    <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                        <Text style={styles.permBtnText}>Cấp quyền</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            {/* ── Upload Loading Overlay ── */}
            <Modal visible={isUploading} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <View style={styles.loadingSpinnerWrap}>
                            <ActivityIndicator size="small" color="#1565C0" />
                        </View>
                        <Text style={styles.loadingTitle}>Đang xác thực thông tin...</Text>
                        <Text style={styles.loadingDesc}>
                            Vui lòng giữ máy, hệ thống đang xử lý ảnh chân dung và CCCD của bạn.
                        </Text>

                        <View style={styles.compactStatus}>
                            <MaterialCommunityIcons name="cloud-upload-outline" size={16} color="#1565C0" />
                            <Text style={styles.compactStatusText}>Đang tải lên tài liệu (3/3)</Text>
                        </View>

                        <Text style={styles.loadingNote}>Vui lòng không tắt ứng dụng lúc này</Text>
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <SafeAreaView style={styles.safeHeader}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A2E" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Xác minh danh tính</Text>
                        <Text style={styles.headerSub}>Bước 3 / 3</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={[styles.stepDot, { backgroundColor: "#4CAF50" }]} />
                        <View style={[styles.stepLine, { backgroundColor: "#4CAF50" }]} />
                        <View style={[styles.stepDot, { backgroundColor: "#4CAF50" }]} />
                        <View style={[styles.stepLine, { backgroundColor: "#4CAF50" }]} />
                        <View style={[styles.stepDot, { backgroundColor: "#1565C0" }]} />
                    </View>
                </View>
            </SafeAreaView>

            <View style={styles.content}>
                <Text style={styles.title}>Xác thực khuôn mặt</Text>
                <Text style={styles.subtitle}>Đặt khuôn mặt vào trong vòng tròn, giữ điện thoại ổn định để hệ thống nhận diện</Text>

                {/* Camera / Preview */}
                <View style={styles.cameraWrapper}>
                    <View style={styles.frameShadow}>
                        <View style={styles.frameWrapper}>
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
                            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
                                <Text style={styles.nextText}>Hoàn tất</Text>
                                <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.captureRow}>
                            {ENABLE_IMAGE_PICKER && (
                                <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickImage} activeOpacity={0.7}>
                                    <MaterialCommunityIcons name="image-multiple-outline" size={24} color="#64748B" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.shutter}
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
                            {ENABLE_IMAGE_PICKER && <View style={{ width: 44 }} />}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingTop: 45,
    flex: 1, backgroundColor: "#F5F7FA" },
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

    /* Loading Overlay */
    loadingOverlay: {
        flex: 1, backgroundColor: "rgba(15, 23, 42, 0.75)",
        justifyContent: "center", alignItems: "center", paddingHorizontal: 24,
    },
    loadingCard: {
        backgroundColor: "#FFF", borderRadius: 20, padding: 24, width: "85%", alignItems: "center",
        elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 15,
    },
    loadingSpinnerWrap: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: "rgba(21, 101, 192, 0.08)",
        alignItems: "center", justifyContent: "center", marginBottom: 12,
    },
    loadingTitle: { color: "#1A1A2E", fontSize: 16, fontWeight: "700", marginBottom: 4 },
    loadingDesc: { color: "#64748B", fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 16 },
    compactStatus: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9",
        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8, marginBottom: 16,
    },
    compactStatusText: { color: "#1565C0", fontSize: 13, fontWeight: "600" },
    loadingNote: { color: "#94A3B8", fontSize: 11, textAlign: "center", opacity: 0.8 },

    /* UI Parts */
    safeHeader: { backgroundColor: "#F5F7FA" },
    header: {
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 12,
    },
    backBtn: {
        width: 42, height: 42, borderRadius: 13,
        backgroundColor: "#FFF",
        alignItems: "center", justifyContent: "center",
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
    },
    headerCenter: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A2E" },
    headerSub: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
    stepRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    stepDot: { width: 8, height: 8, borderRadius: 4 },
    stepLine: { width: 20, height: 2, backgroundColor: "#CBD5E1", borderRadius: 1 },

    content: { flex: 1, paddingHorizontal: 24 },
    title: { color: "#1A1A2E", fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 24 },
    subtitle: { color: "#64748B", fontSize: 14, textAlign: "center", marginTop: 8, paddingHorizontal: 20, lineHeight: 20 },

    cameraWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
    frameShadow: {
        elevation: 20, shadowColor: "#1565C0", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24,
        borderRadius: 160,
    },
    frameWrapper: { width: 320, height: 320, borderRadius: 160, overflow: "hidden", backgroundColor: "#111" },
    camera: { flex: 1 },
    previewContainer: { flex: 1 },
    preview: { width: "100%", height: "100%" },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)", justifyContent: "center", alignItems: "center" },
    circularHole: { width: 300, height: 300, borderRadius: 150, borderWidth: 4, borderColor: "#1565C0", borderStyle: "dashed" },
    circularOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 160, borderWidth: 4, borderColor: "#4CAF50" },

    controls: { height: 140, alignItems: "center", justifyContent: "center" },
    captureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", gap: 40 },
    pickImageBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF",
        alignItems: "center", justifyContent: "center", elevation: 2,
    },
    shutter: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF", borderWidth: 5, borderColor: "#1565C0",
        alignItems: "center", justifyContent: "center", elevation: 8,
    },
    shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#1565C0" },
    reviewRow: { flexDirection: "row", gap: 12, width: "100%" },
    retakeBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 1.5, borderColor: "#1565C0", borderRadius: 16, paddingVertical: 16, backgroundColor: "#FFF",
    },
    retakeText: { color: "#1565C0", fontWeight: "700", fontSize: 15 },
    nextBtn: {
        flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#1565C0", borderRadius: 16, paddingVertical: 16, elevation: 4,
    },
    nextText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
