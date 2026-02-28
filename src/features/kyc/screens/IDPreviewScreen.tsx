import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function IDPreviewScreen() {
    const router = useRouter();
    const { frontUri, backUri, reset } = useKycStore();

    const handleRetakeAll = () => {
        reset();
        router.replace("/id-camera-front");
    };

    const handleConfirm = () => {
        router.push("/id-information");
    };

    return (
        <View style={styles.container}>
            {/* Header gradient */}
            <LinearGradient
                colors={["#1565C0", "#0D47A1"]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Xem lại ảnh chụp</Text>
                    <Text style={styles.headerSub}>Kiểm tra ảnh trước khi xác nhận</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Step indicator */}
                <View style={styles.stepRow}>
                    <View style={styles.stepItem}>
                        <View style={[styles.stepCircle, { backgroundColor: "#4CAF50" }]}>
                            <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                        </View>
                        <Text style={styles.stepLabel}>Mặt trước</Text>
                    </View>
                    <View style={[styles.stepConnector, { backgroundColor: "#4CAF50" }]} />
                    <View style={styles.stepItem}>
                        <View style={[styles.stepCircle, { backgroundColor: "#4CAF50" }]}>
                            <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                        </View>
                        <Text style={styles.stepLabel}>Mặt sau</Text>
                    </View>
                    <View style={[styles.stepConnector, { backgroundColor: "#E0E0E0" }]} />
                    <View style={styles.stepItem}>
                        <View style={[styles.stepCircle, { backgroundColor: "#2092EC" }]}>
                            <Text style={styles.stepNum}>3</Text>
                        </View>
                        <Text style={[styles.stepLabel, { color: "#2092EC", fontWeight: "700" }]}>Xem lại</Text>
                    </View>
                </View>

                {/* Front photo */}
                <View style={styles.photoCard}>
                    <View style={styles.photoHeader}>
                        <View style={[styles.photoBadge, { backgroundColor: "#E3F2FD" }]}>
                            <MaterialCommunityIcons name="card-account-details" size={16} color="#1565C0" />
                            <Text style={[styles.photoBadgeText, { color: "#1565C0" }]}>Mặt trước</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.retakeSmallBtn}
                            onPress={() => { reset(); router.replace("/id-camera-front"); }}
                        >
                            <MaterialCommunityIcons name="camera-retake" size={14} color="#FF7043" />
                            <Text style={styles.retakeSmallText}>Chụp lại</Text>
                        </TouchableOpacity>
                    </View>

                    {frontUri ? (
                        <Image
                            source={{ uri: frontUri }}
                            style={styles.photoImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.photoEmpty}>
                            <MaterialCommunityIcons name="image-off" size={40} color="#CCC" />
                            <Text style={styles.photoEmptyText}>Chưa có ảnh</Text>
                        </View>
                    )}

                    {frontUri && (
                        <View style={styles.photoOkBadge}>
                            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                            <Text style={styles.photoOkText}>Ảnh hợp lệ</Text>
                        </View>
                    )}
                </View>

                {/* Back photo */}
                <View style={styles.photoCard}>
                    <View style={styles.photoHeader}>
                        <View style={[styles.photoBadge, { backgroundColor: "#F3E5F5" }]}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={16} color="#7B1FA2" />
                            <Text style={[styles.photoBadgeText, { color: "#7B1FA2" }]}>Mặt sau</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.retakeSmallBtn}
                            onPress={() => router.replace("/id-camera-back")}
                        >
                            <MaterialCommunityIcons name="camera-retake" size={14} color="#FF7043" />
                            <Text style={styles.retakeSmallText}>Chụp lại</Text>
                        </TouchableOpacity>
                    </View>

                    {backUri ? (
                        <Image
                            source={{ uri: backUri }}
                            style={styles.photoImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.photoEmpty}>
                            <MaterialCommunityIcons name="image-off" size={40} color="#CCC" />
                            <Text style={styles.photoEmptyText}>Chưa có ảnh</Text>
                        </View>
                    )}

                    {backUri && (
                        <View style={styles.photoOkBadge}>
                            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                            <Text style={styles.photoOkText}>Ảnh hợp lệ</Text>
                        </View>
                    )}
                </View>

                {/* Info box */}
                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="information-outline" size={18} color="#FFB300" />
                    <Text style={styles.infoText}>
                        Đảm bảo ảnh rõ nét, không mờ, không bị che khuất. Thông tin trên thẻ phải đọc được đầy đủ.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom actions */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.retakeAllBtn} onPress={handleRetakeAll}>
                    <MaterialCommunityIcons name="refresh" size={18} color="#607D8B" />
                    <Text style={styles.retakeAllText}>Chụp lại tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.confirmBtn,
                        (!frontUri || !backUri) && { opacity: 0.5 }
                    ]}
                    onPress={handleConfirm}
                    disabled={!frontUri || !backUri}
                >
                    <MaterialCommunityIcons name="check-bold" size={18} color="#FFF" />
                    <Text style={styles.confirmText}>Xác nhận & Tiếp tục</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 15,
        paddingBottom: 20,
        paddingHorizontal: 15,
        gap: 12,
    },
    iconBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center", justifyContent: "center",
    },
    headerCenter: { flex: 1 },
    headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
    headerSub: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },

    content: { padding: 16, paddingBottom: 32 },

    // Step indicator
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        marginTop: 4,
    },
    stepItem: { alignItems: "center", gap: 4 },
    stepCircle: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: "center", justifyContent: "center",
    },
    stepNum: { color: "#FFF", fontSize: 12, fontWeight: "700" },
    stepLabel: { fontSize: 11, color: "#888", fontWeight: "500" },
    stepConnector: { width: 48, height: 2, marginHorizontal: 6, marginBottom: 16 },

    // Photo card
    photoCard: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    photoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    photoBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    photoBadgeText: { fontSize: 13, fontWeight: "700" },
    retakeSmallBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    retakeSmallText: { color: "#FF7043", fontSize: 13, fontWeight: "600" },

    photoImage: {
        width: "100%",
        height: 200,
        borderRadius: 14,
        backgroundColor: "#F0F0F0",
    },
    photoEmpty: {
        width: "100%",
        height: 200,
        borderRadius: 14,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 2,
        borderColor: "#E0E0E0",
        borderStyle: "dashed",
    },
    photoEmptyText: { color: "#BBB", fontSize: 13 },
    photoOkBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 10,
    },
    photoOkText: { color: "#4CAF50", fontSize: 13, fontWeight: "600" },

    infoBox: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "#FFF8E1",
        borderRadius: 14,
        padding: 14,
        alignItems: "flex-start",
    },
    infoText: { flex: 1, fontSize: 13, color: "#FFB300", lineHeight: 20 },

    // Bottom bar
    bottomBar: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        paddingBottom: 36,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.06)",
    },
    retakeAllBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderWidth: 1.5,
        borderColor: "#CFD8DC",
        borderRadius: 14,
        paddingVertical: 14,
        backgroundColor: "#F5F7FA",
    },
    retakeAllText: { color: "#607D8B", fontWeight: "700", fontSize: 14 },
    confirmBtn: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#1565C0",
        borderRadius: 14,
        paddingVertical: 14,
    },
    confirmText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
