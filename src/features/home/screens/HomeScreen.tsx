import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isDark ? "#0D1B23" : "#F8F9FB" },
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Top Background Gradient */}
            <LinearGradient
                colors={isDark ? ["#00aaffff", "transparent"] : ["#E3F2FD", "transparent"]}
                style={styles.topGradient}
            />

            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <ThemedText style={styles.welcomeText}>Xin chào,</ThemedText>
                    <ThemedText type="title" style={styles.userName}>MAI NHAT HOAI</ThemedText>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color={isDark ? "#FFF" : "#333"} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            {/* Subscription Card */}
            <LinearGradient
                colors={isDark ? ["#00c3ffff", "#0D1B23"] : ["#2092EC", "#054D8C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.subscriptionCard}
            >
                <View style={styles.subHeader}>
                    <View>
                        <ThemedText style={[styles.subTitle, { color: "#FFF" }]}>Tổng lượt ký khả dụng</ThemedText>
                        <ThemedText style={[styles.subDesc, { color: "rgba(255,255,255,0.7)" }]}>Bao gồm ký số & trình ký nội bộ</ThemedText>
                    </View>
                    <TouchableOpacity style={styles.buyBtn}>
                        <ThemedText style={styles.buyBtnText}>Mua lượt</ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText style={[styles.subCount, { color: "#FFF" }]}>1.250</ThemedText>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressBarBg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                        <View style={[styles.progressBarFill, { width: "68%", backgroundColor: "#FFF" }]} />
                    </View>
                    <ThemedText style={[styles.progressText, { color: "rgba(255,255,255,0.8)" }]}>Đã dùng 850 / 1.250 lượt</ThemedText>
                </View>
            </LinearGradient>

            {/* Reject Alert */}
            <View style={[styles.alertCard, { backgroundColor: isDark ? "rgba(255, 82, 82, 0.1)" : "#FFF5F5" }]}>
                <View style={styles.alertContent}>
                    <ThemedText style={[styles.alertTitle, { color: isDark ? "#FFAB91" : "#D32F2F" }]}>2 tài liệu bị từ chối</ThemedText>
                    <ThemedText style={[styles.alertDesc, { color: isDark ? "rgba(255,255,255,0.5)" : "#666" }]}>Yêu cầu cập nhật chữ ký pháp lý.</ThemedText>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: isDark ? "#FFAB91" : "#EF5350" }]}>
                    <ThemedText numberOfLines={1} style={[styles.actionBtnText, { color: isDark ? "#FFAB91" : "#EF5350" }]}> Xử Lý</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Main Signing Tasks (Signing Summary) */}

            <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Trình ký</ThemedText>
                <View style={styles.summaryGrid}>
                    {/* Internal Signing Task */}
                    <TouchableOpacity
                        style={[styles.summaryCard, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}
                        onPress={() => router.push("/internal")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.summaryHeader}>
                            <View style={[styles.summaryIcon, { backgroundColor: "#2092EC20" }]}>
                                <MaterialCommunityIcons name="office-building" size={22} color="#2092EC" />
                            </View>
                            <ThemedText style={styles.summaryTitle} numberOfLines={1}>Nội bộ</ThemedText>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"} />
                        </View>

                        <View style={styles.primaryStat}>
                            <ThemedText style={styles.primaryValue}>12000</ThemedText>
                            <ThemedText style={styles.primaryLabel}>Chờ ký</ThemedText>
                        </View>

                        <View style={styles.secondaryRow}>
                            <View style={styles.secondaryItem}>
                                <ThemedText style={styles.secondaryLabel}>Đã ký</ThemedText>
                                <ThemedText style={[styles.secondaryValue, { color: "#4CAF50" }]}>850000</ThemedText>
                            </View>
                            <View style={styles.secondaryDivider} />
                            <View style={styles.secondaryItem}>
                                <ThemedText style={styles.secondaryLabel}>Xử lý</ThemedText>
                                <ThemedText style={[styles.secondaryValue, { color: "#FF9800" }]}>044445</ThemedText>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Digital Signing Task */}
                    <TouchableOpacity
                        style={[styles.summaryCard, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}
                        onPress={() => router.push("/digital")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.summaryHeader}>
                            <View style={[styles.summaryIcon, { backgroundColor: "#4CAF5020" }]}>
                                <MaterialCommunityIcons name="fingerprint" size={22} color="#4CAF50" />
                            </View>
                            <ThemedText style={styles.summaryTitle} numberOfLines={1}>Ký số</ThemedText>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"} />
                        </View>

                        <View style={styles.primaryStat}>
                            <ThemedText style={styles.primaryValue}>08</ThemedText>
                            <ThemedText style={styles.primaryLabel}>Chờ ký</ThemedText>
                        </View>

                        <View style={styles.secondaryRow}>
                            <View style={styles.secondaryItem}>
                                <ThemedText style={styles.secondaryLabel}>Đã ký</ThemedText>
                                <ThemedText style={[styles.secondaryValue, { color: "#4CAF50" }]}>124</ThemedText>
                            </View>
                            <View style={styles.secondaryDivider} />
                            <View style={styles.secondaryItem}>
                                <ThemedText style={styles.secondaryLabel}>Xử lý</ThemedText>
                                <ThemedText style={[styles.secondaryValue, { color: "#FF9800" }]}>03</ThemedText>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Tiện ích nhanh</ThemedText>
                <View style={styles.grid}>
                    {[
                        { icon: "shield-check-outline", label: "Xác thực KYC", route: "/identity-verification", color: "#673AB7" },
                        { icon: "certificate-outline", label: "Chứng thư số", route: "/certificate-info", color: "#FF9800" },
                        { icon: "file-plus-outline", label: "Tạo hợp đồng", route: "/contracts", color: "#E91E63" },
                        { icon: "history", label: "Lịch sử", route: "/contracts", color: "#795548" },
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.gridItem, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                            </View>
                            <ThemedText style={styles.gridLabel}>{item.label}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 14,
        opacity: 0.6,
    },
    userName: {
        fontSize: 22,
        fontWeight: "800",
    },
    notificationBtn: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.03)",
        position: "relative",
    },
    notificationBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FF5252",
        borderWidth: 1.5,
        borderColor: "#FFF",
    },
    subscriptionCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    subHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    subTitle: {
        fontSize: 15,
        fontWeight: "600",
        opacity: 0.8,
    },
    subDesc: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 2,
    },
    buyBtn: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    buyBtnText: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "700",
    },
    subCount: {
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 20,
    },
    progressContainer: {
        width: "100%",
    },
    progressBarBg: {
        height: 6,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: 3,
        marginBottom: 8,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#2092EC",
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        opacity: 0.6,
    },
    alertCard: {
        marginHorizontal: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "rgba(255, 82, 82, 0.1)",
        marginBottom: 24,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    alertDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    actionBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    actionBtnText: {
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    seeAll: {
        color: "#2092EC",
        fontSize: 14,
        fontWeight: "600",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    gridItem: {
        width: "48%",
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    gridLabel: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
    recentCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    contractIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#FFE5E5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    contractInfo: {
        flex: 1,
    },
    contractName: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 2,
    },
    contractDate: {
        fontSize: 12,
        opacity: 0.5,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    summaryGrid: {
        flexDirection: "row",
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    summaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 6,
    },
    summaryIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    summaryTitle: {
        fontSize: 12,
        fontWeight: "700",
        flex: 1,
        opacity: 0.6,
    },
    primaryStat: {
        marginBottom: 16,
    },
    primaryValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#2092EC",
    },
    primaryLabel: {
        fontSize: 11,
        fontWeight: "600",
        opacity: 0.5,
        marginTop: -2,
    },
    secondaryRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.03)",
        gap: 8,
    },
    secondaryItem: {
        flex: 1,
    },
    secondaryLabel: {
        fontSize: 10,
        opacity: 0.4,
        fontWeight: "600",
        marginBottom: 2,
    },
    secondaryValue: {
        fontSize: 13,
        fontWeight: "700",
    },
    secondaryDivider: {
        width: 1,
        height: 15,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
});
