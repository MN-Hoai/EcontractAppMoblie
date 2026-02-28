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

export default function IDCameraBackScreen() {
    const router = useRouter();
    const setBackUri = useKycStore((s) => s.setBackUri);

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

        setIsCapturing(true);
        try {
            const formData = new FormData();

            // Chuyển đổi URI ảnh mặt trước
            const frontFileName = frontUri.split("/").pop() || "front.jpg";
            formData.append("frontImage", {
                uri: frontUri,
                name: frontFileName,
                type: "image/jpeg",
            } as any);

            // Chuyển đổi URI ảnh mặt sau
            const backFileName = capturedUri.split("/").pop() || "back.jpg";
            formData.append("backImage", {
                uri: capturedUri,
                name: backFileName,
                type: "image/jpeg",
            } as any);

            // Thêm accountId
            formData.append("accountId", HARDCODED_ACCOUNT_ID);

            const url = `http:// 192.168.1.72:5000/api/imageid`;
            const response = await axios.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                setBackUri(capturedUri);
                Alert.alert("Thành công", "Upload CCCD thành công");
                router.push("/face-capture");
            }
        } catch (error: any) {
            console.error("Upload thất bại:", error);
            Alert.alert("Lỗi", "Không thể upload ảnh CCCD. Vui lòng thử lại.");
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
                    <MaterialCommunityIcons name="arrow-left" size={26} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: "#4CAF50" }]} />
                    <View style={[styles.stepLine, { backgroundColor: "#2092EC" }]} />
                    <View style={[styles.stepDot, { backgroundColor: "#2092EC" }]} />
                </View>
                <View style={{ width: 40 }} />
            </View>

            <Text style={styles.title}>Chụp mặt sau CCCD</Text>
            <Text style={styles.subtitle}>Đặt mặt sau thẻ vào khung hình, đảm bảo rõ nét</Text>

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
    iconBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center", justifyContent: "center",
    },
    stepRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    stepDot: { width: 10, height: 10, borderRadius: 5 },
    stepLine: { width: 32, height: 2, borderRadius: 1 },

    title: { color: "#FFF", fontSize: 20, fontWeight: "700", textAlign: "center", marginTop: 12 },
    subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", marginTop: 6, paddingHorizontal: 32 },

    frameWrapper: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 12,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#111",
    },
    camera: { flex: 1 },
    preview: { flex: 1 },

    cornerTL: { position: "absolute", top: 16, left: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopLeftRadius: CORNER_RADIUS },
    cornerTR: { position: "absolute", top: 16, right: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopRightRadius: CORNER_RADIUS },
    cornerBL: { position: "absolute", bottom: 16, left: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomLeftRadius: CORNER_RADIUS },
    cornerBR: { position: "absolute", bottom: 16, right: 16, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomRightRadius: CORNER_RADIUS },

    controls: { height: 130, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
    shutter: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: "#FFF",
        borderWidth: 5, borderColor: "rgba(255,255,255,0.25)",
        alignItems: "center", justifyContent: "center",
    },
    shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#FFF" },

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
