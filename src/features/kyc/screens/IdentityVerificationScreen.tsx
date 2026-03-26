import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/* ─── Step Component ────────────────────────────────────────── */
function StepItem({
    number,
    title,
    desc,
    icon,
    isLast = false,
}: {
    number: string;
    title: string;
    desc: string;
    icon: string;
    isLast?: boolean;
}) {
    return (
        <View style={styles.stepRow}>
            <View style={styles.stepLeft}>
                <View style={styles.stepCircle}>
                    <MaterialCommunityIcons name={icon as any} size={20} color="#2092EC" />
                    <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>{number}</Text>
                    </View>
                </View>
                {!isLast && <View style={styles.stepLine} />}
            </View>
            <View style={styles.stepRight}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepDesc}>{desc}</Text>
            </View>
        </View>
    );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function IdentityVerificationScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* ── Gradient Header ── */}
            <LinearGradient
                colors={["#1565C0", "#2092EC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Xác thực danh tính</Text>
                    <Text style={styles.headerSub}>Quy trình định danh điện tử (eKYC)</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero section ── */}
                <View style={styles.heroSection}>
                    <View style={styles.mainIconCircles}>
                        <View style={styles.circleOuter}>
                            <View style={styles.circleInner}>
                                <MaterialCommunityIcons
                                    name="shield-account-variant-outline"
                                    size={64}
                                    color="#FFF"
                                />
                            </View>
                        </View>
                        <View style={[styles.miniDot, { top: 10, right: 10 }]} />
                        <View style={[styles.miniDot, { bottom: 20, left: -5, width: 12, height: 12 }]} />
                    </View>

                    <Text style={styles.heroTitle}>Bảo mật & Tin cậy</Text>
                    <Text style={styles.heroDesc}>
                        Để bảo vệ tài khoản và tuân thủ quy định pháp luật, vui lòng hoàn tất xác thực thông tin cá nhân.
                    </Text>
                </View>

                {/* ── Steps Section ── */}
                <View style={styles.stepsCard}>
                    <View style={styles.stepsCardHeader}>
                        <Text style={styles.stepsCardTitle}>QUY TRÌNH THỰC HIỆN</Text>
                    </View>

                    <StepItem
                        number="1"
                        icon="card-account-details-outline"
                        title="Chụp ảnh CMND/CCCD/Hộ chiếu"
                        desc="Cung cấp ảnh mặt trước và mặt sau giấy tờ tùy thân còn hiệu lực."
                    />
                    <StepItem
                        number="2"
                        icon="face-recognition"
                        title="Xác thực khuôn mặt"
                        desc="Chụp ảnh chân dung để xác thực sinh trắc học với giấy tờ."
                    />
                    <StepItem
                        number="3"
                        icon="check-decagram-outline"
                        title="Kiểm tra & Hoàn tất"
                        desc="Rà soát toàn bộ thông tin đã trích xuất trước khi gửi đi."
                        isLast
                    />
                </View>

                {/* ── Security Note ── */}
                <View style={styles.securityNote}>
                    <MaterialCommunityIcons name="lock-check" size={18} color="#FFB300" />
                    <Text style={styles.securityNoteText}>
                        Mọi dữ liệu cá nhân của bạn đều được mã hóa và bảo vệ theo tiêu chuẩn bảo mật quốc tế.
                    </Text>
                </View>
            </ScrollView>

            {/* ── Bottom Action ── */}
            <View style={styles.footer}>
                <View style={styles.consentRow}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.consentText}>
                        Tôi đồng ý với <Text style={styles.link}>Điều khoản xử lý dữ liệu</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => router.push("/id-camera-front")}
                    activeOpacity={0.85}
                >
                    <Text style={styles.startBtnText}>Bắt đầu xác thực</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingTop: 45,
    flex: 1, backgroundColor: "#F0F4F8" },

    /* Header */
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 16,
        gap: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: { flex: 1 },
    headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700"  },
    headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },

    scrollContent: { padding: 20 },

    /* Hero */
    heroSection: { alignItems: "center", marginBottom: 32 },
    mainIconCircles: {
        width: 140,
        height: 140,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        position: "relative",
    },
    circleOuter: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(32, 146, 236, 0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    circleInner: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#2092EC",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2092EC",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    miniDot: {
        position: "absolute",
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#4FC3F7",
    },
    heroTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 8 },
    heroDesc: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 10,
    },

    /* Steps Card */
    stepsCard: {
        backgroundColor: "#FFF",
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        marginBottom: 20,
    },
    stepsCardHeader: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 12,
    },
    stepsCardTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: "#1565C0",
        letterSpacing: 1.2,
    },

    /* Step Item */
    stepRow: { flexDirection: "row", gap: 16 },
    stepLeft: { alignItems: "center" },
    stepCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#EAF2FE",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    stepNumberBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#2092EC",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    stepNumberText: { fontSize: 10, fontWeight: "800", color: "#FFF" },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: "#EAF2FE",
        marginVertical: 4,
    },
    stepRight: { flex: 1, paddingBottom: 24 },
    stepTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
    stepDesc: { fontSize: 13, color: "#9E9E9E", lineHeight: 18 },

    /* Security note */
    securityNote: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF8E1",
        padding: 14,
        borderRadius: 14,
        gap: 10,
    },
    securityNoteText: { flex: 1, fontSize: 12, color: "#FFB300", lineHeight: 18 },

    /* Footer */
    footer: {
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: "#EDF2F7",
    },
    consentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 16,
    },
    consentText: { fontSize: 12, color: "#666" },
    link: { color: "#2092EC", fontWeight: "700" },
    startBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1565C0",
        borderRadius: 16,
        paddingVertical: 16,
        gap: 12,
    },
    startBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
