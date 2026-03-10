import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

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
                <View style={{ flex: 1 }}>
                    <ThemedText style={styles.welcomeText}>Xin chào,</ThemedText>
                    <ThemedText type="title" style={styles.userName}>MAI NHAT HOAI</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color={isDark ? "#FFF" : "#333"} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.notificationBtn, { backgroundColor: isDark ? "rgba(255,82,82,0.15)" : "#FFEBEE" }]}
                        onPress={() => {
                            Alert.alert(
                                "Đăng xuất",
                                "Bạn có chắc chắn muốn đăng xuất không?",
                                [
                                    { text: "Hủy", style: "cancel" },
                                    {
                                        text: "Đăng xuất",
                                        style: "destructive",
                                        onPress: () => {
                                            logout();
                                            router.replace("/login");
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <MaterialCommunityIcons name="logout" size={22} color={isDark ? "#FFAB91" : "#D32F2F"} />
                    </TouchableOpacity>
                </View>
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

            {/* Tài liệu chờ tôi ký */}
            <View style={[styles.section, { paddingHorizontal: 0 }]}>
                <View style={[styles.cardBox, { backgroundColor: isDark ? "#1A2E38" : "#FFF" }]}>
                    <View style={styles.cardBoxHeader}>
                        <View>
                            <ThemedText style={styles.cardBoxTitle}>Tài liệu chờ tôi ký</ThemedText>
                            <ThemedText style={[styles.cardBoxSub, { color: isDark ? "rgba(255,255,255,0.4)" : "#999" }]}>5 tài liệu gần nhất</ThemedText>
                        </View>
                        <TouchableOpacity style={[styles.seeAllBtn, { backgroundColor: isDark ? "rgba(32,146,236,0.15)" : "#EAF4FE" }]}>
                            <ThemedText style={styles.seeAllBtnText}>Xem tất cả</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {[
                        { title: "Hợp đồng cung cấp thiết bị", sender: "Gửi bởi Nguyễn Lâm", date: "09/01" },
                        { title: "Biên bản họp HĐQT", sender: "Gửi bởi Mai Anh", date: "08/01" },
                        { title: "Thỏa thuận hợp tác 2025", sender: "Gửi bởi Khánh Duy", date: "07/01" },
                        { title: "Hợp đồng bảo trì trung tâm dữ liệu", sender: "Gửi bởi Hữu Tín", date: "06/01" },
                        { title: "Nghị quyết duyệt chi quý I", sender: "Gửi bởi Minh Châu", date: "05/01" },
                    ].map((doc, idx, arr) => (
                        <TouchableOpacity key={idx} activeOpacity={0.7} style={[
                            styles.docRow,
                            idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#F0F2F5" }
                        ]}>
                            <View style={[styles.docIconWrap, { backgroundColor: isDark ? "rgba(32,146,236,0.15)" : "#EAF4FE" }]}>
                                <MaterialCommunityIcons name="file-sign" size={18} color="#2092EC" />
                            </View>
                            <View style={styles.docInfo}>
                                <ThemedText style={styles.docTitle} numberOfLines={1}>{doc.title}</ThemedText>
                                <ThemedText style={[styles.docSender, { color: isDark ? "rgba(255,255,255,0.4)" : "#999" }]}>{doc.sender}</ThemedText>
                            </View>
                            <ThemedText style={[styles.docDate, { color: isDark ? "rgba(255,255,255,0.35)" : "#BBBEC7" }]}>{doc.date}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Tổng quan 6 tháng */}
            <View style={[styles.section, { paddingHorizontal: 0 }]}>
                <View style={[styles.cardBox, { backgroundColor: isDark ? "#1A2E38" : "#FFF" }]}>
                    <View style={styles.cardBoxHeader}>
                        <View>
                            <ThemedText style={styles.cardBoxTitle}>Tổng quan 6 tháng</ThemedText>
                            <ThemedText style={[styles.cardBoxSub, { color: isDark ? "rgba(255,255,255,0.4)" : "#999" }]}>Biểu đồ minh hoạ số lượt ký (demo data)</ThemedText>
                        </View>
                    </View>

                    {/* Chart legend */}
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#F4A742" }]} />
                            <ThemedText style={[styles.legendLabel, { color: isDark ? "rgba(255,255,255,0.6)" : "#555" }]}>Trình ký nội bộ</ThemedText>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#4FC3F7" }]} />
                            <ThemedText style={[styles.legendLabel, { color: isDark ? "rgba(255,255,255,0.6)" : "#555" }]}>Ký số điện tử</ThemedText>
                        </View>
                    </View>

                    {/* SVG Line Chart */}
                    <View style={styles.chartWrapper}>
                        {/* Y-axis labels */}
                        <View style={styles.yAxisLabels}>
                            {["250", "200", "150", "100", "50"].map((v) => (
                                <ThemedText key={v} style={[styles.axisLabel, { color: isDark ? "rgba(255,255,255,0.3)" : "#BBB" }]}>{v}</ThemedText>
                            ))}
                        </View>
                        {/* Chart area */}
                        <View style={styles.chartArea}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map((i) => (
                                <View key={i} style={[styles.gridLine, { top: `${i * 25}%` as any, borderColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F2F5" }]} />
                            ))}
                            {/* Orange area fill (Trình ký nội bộ) */}
                            <View style={[styles.areaFillOrange, { backgroundColor: isDark ? "rgba(244,167,66,0.12)" : "rgba(244,167,66,0.08)" }]} />
                            {/* Blue area fill (Ký số) */}
                            <View style={[styles.areaFillBlue, { backgroundColor: isDark ? "rgba(79,195,247,0.12)" : "rgba(79,195,247,0.08)" }]} />
                            {/* Orange line */}
                            <View style={styles.lineOrange} />
                            {/* Blue line */}
                            <View style={styles.lineBlue} />
                        </View>
                    </View>
                    {/* X-axis labels */}
                    <View style={styles.xAxisLabels}>
                        {["08/24", "09/24", "10/24", "11/24", "12/24", "01/25"].map((v) => (
                            <ThemedText key={v} style={[styles.axisLabel, { color: isDark ? "rgba(255,255,255,0.3)" : "#BBB" }]}>{v}</ThemedText>
                        ))}
                    </View>

                    {/* Progress bars */}
                    <View style={styles.progressSection}>
                        {/* Trình ký nội bộ */}
                        <View style={styles.progressItem}>
                            <View style={styles.progressMeta}>
                                <View>
                                    <ThemedText style={styles.progressName}>Trình ký nội bộ</ThemedText>
                                    <ThemedText style={[styles.progressCount, { color: isDark ? "rgba(255,255,255,0.4)" : "#AAA" }]}>850 lượt</ThemedText>
                                </View>
                                <ThemedText style={[styles.progressPct, { color: isDark ? "#FFF" : "#111" }]}>60%</ThemedText>
                            </View>
                            <View style={[styles.progressTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F0F2F5" }]}>
                                <View style={[styles.progressFill, { width: "60%", backgroundColor: "#F4A742" }]} />
                            </View>
                        </View>
                        {/* Ký số điện tử */}
                        <View style={[styles.progressItem, { marginTop: 16 }]}>
                            <View style={styles.progressMeta}>
                                <View>
                                    <ThemedText style={styles.progressName}>Ký số điện tử</ThemedText>
                                    <ThemedText style={[styles.progressCount, { color: isDark ? "rgba(255,255,255,0.4)" : "#AAA" }]}>560 lượt</ThemedText>
                                </View>
                                <ThemedText style={[styles.progressPct, { color: isDark ? "#FFF" : "#111" }]}>40%</ThemedText>
                            </View>
                            <View style={[styles.progressTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F0F2F5" }]}>
                                <View style={[styles.progressFill, { width: "40%", backgroundColor: "#4FC3F7" }]} />
                            </View>
                        </View>
                    </View>
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
                        { icon: "history", label: "3 thông tin sau khi xac thuc 2 mat the cc", route: "/id-information", color: "#795548" },
                        { icon: "history", label: "2 khuon mat", route: "/face-capture", color: "#795548" },
                        { icon: "history", label: "4 xác thực thông tin để mua , truoc buoc nghiem thu", route: "/sign-contract", color: "#795548" },
                        { icon: "history", label: "5 Chứng thư số", route: "/(certificate)/choose-certificate2", color: "#795548" },
                        { icon: "history", label: "6 Chứng thư số", route: "/(contract)/sign-val", color: "#795548" },


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
        fontSize: 25,
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
        fontSize: 22,
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

    // ─── Card Box (shared container) ───────────────────────────────────────
    cardBox: {
        marginHorizontal: 20,
        borderRadius: 20,
        paddingTop: 20,
        paddingBottom: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        overflow: "hidden",
    },
    cardBoxHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    cardBoxTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    cardBoxSub: {
        fontSize: 12,
        marginTop: 2,
    },

    // ─── "Xem tất cả" button ───────────────────────────────────────────────
    seeAllBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    seeAllBtnText: {
        color: "#2092EC",
        fontSize: 13,
        fontWeight: "600",
    },

    // ─── Document row ──────────────────────────────────────────────────────
    docRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 11,
    },
    docIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    docInfo: {
        flex: 1,
        marginRight: 8,
    },
    docTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    docSender: {
        fontSize: 12,
        marginTop: 2,
    },
    docDate: {
        fontSize: 12,
        fontWeight: "500",
    },

    // ─── Chart legend ──────────────────────────────────────────────────────
    chartLegend: {
        flexDirection: "row",
        gap: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        fontSize: 12,
        fontWeight: "500",
    },

    // ─── Chart area ────────────────────────────────────────────────────────
    chartWrapper: {
        flexDirection: "row",
        height: 160,
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    yAxisLabels: {
        width: 34,
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingRight: 6,
        paddingBottom: 2,
    },
    axisLabel: {
        fontSize: 10,
    },
    chartArea: {
        flex: 1,
        position: "relative",
    },
    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderStyle: "dashed",
    },
    // Simplified "area" + "line" decorations (purely visual placeholders)
    areaFillOrange: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "70%",
        borderRadius: 6,
    },
    areaFillBlue: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "50%",
        borderRadius: 6,
    },
    lineOrange: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "70%",
        height: 2.5,
        backgroundColor: "#F4A742",
        borderRadius: 2,
        opacity: 0.9,
    },
    lineBlue: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "50%",
        height: 2.5,
        backgroundColor: "#4FC3F7",
        borderRadius: 2,
        opacity: 0.9,
    },

    // ─── X-axis labels ─────────────────────────────────────────────────────
    xAxisLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 50,
        marginBottom: 16,
    },

    // ─── Progress section (inside Tổng quan card) ──────────────────────────
    progressSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.04)",
    },
    progressItem: {},
    progressMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 8,
    },
    progressName: {
        fontSize: 14,
        fontWeight: "700",
    },
    progressCount: {
        fontSize: 12,
        marginTop: 2,
    },
    progressPct: {
        fontSize: 16,
        fontWeight: "800",
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
});
