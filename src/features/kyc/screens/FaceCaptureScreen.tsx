import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function FaceCaptureScreen() {
    const router = useRouter();
    const setFaceUri = useKycStore((s) => s.setFaceUri);

    const [permission, requestPermission] = useCameraPermissions();
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
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

    const handleRetake = () => setCapturedUri(null);

    const handleNext = async () => {
        if (!capturedUri) return;

        const { frontUri, backUri } = useKycStore.getState();

        if (!frontUri || !backUri) {
            Alert.alert("Lỗi", "Thiếu ảnh CCCD. Vui lòng chụp lại từ đầu.");
            router.replace("/id-camera-front");
            return;
        }

        setIsCapturing(true);
        try {
            const formData = new FormData();

            // Ảnh mặt trước CCCD
            formData.append("frontImage", {
                uri: frontUri,
                name: frontUri.split("/").pop() || "front.jpg",
                type: "image/jpeg",
            } as any);

            // Ảnh mặt sau CCCD
            formData.append("backImage", {
                uri: backUri,
                name: backUri.split("/").pop() || "back.jpg",
                type: "image/jpeg",
            } as any);

            // Ảnh khuôn mặt
            formData.append("faceImage", {
                uri: capturedUri,
                name: capturedUri.split("/").pop() || "face.jpg",
                type: "image/jpeg",
            } as any);

            const response = await fetch("http://192.168.1.69:5000/api/imageid", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Lưu URI khuôn mặt vào store
            setFaceUri(capturedUri);
            router.push("/id-information");
        } catch (error: any) {
            console.error("Upload KYC thất bại:", error);
            Alert.alert("Lỗi", "Không thể gửi ảnh lên máy chủ. Vui lòng thử lại.");
        } finally {
            setIsCapturing(false);
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
                        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                            <Text style={styles.nextText}>Tiếp tục</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    center: { flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center", gap: 16 },
    permText: { color: "#FFF", fontSize: 15, opacity: 0.7, textAlign: 'center', paddingHorizontal: 40 },
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
    iconBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center", justifyContent: "center",
    },
    stepRow: { flexDirection: "row", alignItems: "center" },
    stepDot: { width: 10, height: 10, borderRadius: 5 },
    stepLine: { width: 40, height: 2, borderRadius: 1 },

    title: { color: "#FFF", fontSize: 20, fontWeight: "700", textAlign: "center", marginTop: 12 },
    subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", marginTop: 6, paddingHorizontal: 32 },

    cameraWrapper: {
        flex: 1,
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    camera: {
        width: 320,
        height: 320,
        borderRadius: 160,
        overflow: 'hidden',
    },
    previewContainer: {
        width: 320,
        height: 320,
        borderRadius: 160,
        overflow: 'hidden',
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circularHole: {
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 3,
        borderColor: '#2092EC',
        borderStyle: 'dashed',
    },
    circularOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 160,
        borderWidth: 4,
        borderColor: '#4CAF50',
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
});
