import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

export default function IdentityVerificationScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
            ]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={isDark ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>Xác thực danh tính</ThemedText>
                <View style={{ width: 26 }} />
            </View>

            <View style={styles.illustrationWrap}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="shield-account-variant-outline" size={80} color="#2092EC" />
                </View>
            </View>

            <View style={styles.infoSection}>
                <ThemedText style={styles.description}>
                    Để đảm bảo tính bảo mật và tuân thủ quy định pháp luật, chúng tôi cần xác thực thông tin cá nhân của bạn.
                </ThemedText>

                <View style={styles.steps}>
                    <Step
                        number="1"
                        title="Chụp ảnh CMND/CCCD/Hộ chiếu"
                        desc="Đảm bảo ảnh rõ nét, không bị lóa hoặc mất góc."
                        isDark={isDark}
                    />
                    <Step
                        number="2"
                        title="Xác thực khuôn mặt"
                        desc="Thực hiện theo các bước quay mặt đơn giản."
                        isDark={isDark}
                    />
                    <Step
                        number="3"
                        title="Kiểm tra thông tin"
                        desc="Rà soát lại dữ liệu được trích xuất tự động."
                        isDark={isDark}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.consentWrap}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#2092EC" />
                    <ThemedText style={styles.consentText}>
                        Tôi đồng ý với các <ThemedText style={styles.link}>Điều khoản</ThemedText> về xử lý dữ liệu cá nhân.
                    </ThemedText>
                </View>

                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => router.push("/id-camera-front")}
                >
                    <ThemedText style={styles.startButtonText}>Bắt đầu ngay</ThemedText>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function Step({ number, title, desc, isDark }: any) {
    return (
        <View style={styles.stepRow}>
            <View style={styles.stepNumberWrap}>
                <ThemedText style={styles.stepNumber}>{number}</ThemedText>
            </View>
            <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>{title}</ThemedText>
                <ThemedText style={styles.stepDesc}>{desc}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
        paddingTop: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    illustrationWrap: {
        alignItems: "center",
        marginVertical: 40,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "rgba(32, 146, 236, 0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    infoSection: {
        paddingHorizontal: 24,
    },
    description: {
        fontSize: 15,
        textAlign: "center",
        opacity: 0.7,
        lineHeight: 22,
        marginBottom: 40,
    },
    steps: {
        gap: 24,
    },
    stepRow: {
        flexDirection: "row",
        gap: 16,
    },
    stepNumberWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#2092EC",
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumber: {
        color: "#FFF",
        fontWeight: "800",
        fontSize: 14,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        opacity: 0.6,
        lineHeight: 18,
    },
    footer: {
        marginTop: 48,
        paddingHorizontal: 24,
    },
    consentWrap: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 24,
        alignItems: "center",
    },
    consentText: {
        fontSize: 12,
        opacity: 0.6,
        flex: 1,
    },
    link: {
        color: "#2092EC",
        fontWeight: "600",
    },
    startButton: {
        backgroundColor: "#2092EC",
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    startButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
