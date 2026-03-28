import MyNativeView from "@/components/MyNativeView";
import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { isBiometricAvailable } from "@/services/biometricService";
import { CertInfo, checkCaStatus, getCertInfo } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";



export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const lockSession = useAuthStore((state) => state.lockSession);
    const user = useAuthStore((state) => state.user);
    const requestId = useAuthStore((state) => state.requestId);

    const [showNativeView, setShowNativeView] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);
    const [isCA, setIsCA] = React.useState<boolean | null>(null);
    const [certList, setCertList] = React.useState<CertInfo[]>([]);
    const [isCertLoading, setIsCertLoading] = React.useState(true);
    const [biometricEnabled, setBiometricEnabled] = React.useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = React.useState(false);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    React.useEffect(() => {
        const fetchCertData = async () => {
            if (!requestId) {
                setIsCertLoading(false);
                return;
            }
            try {
                setIsCertLoading(true);
                const caRes = await checkCaStatus(requestId);
                const hasCA = caRes?.data === true || caRes?.Data === true;
                setIsCA(hasCA);

                // Nếu không có CA, không gọi thêm API load chứng thư
                if (!hasCA) {
                    setCertList([]);
                    setIsCertLoading(false);
                    return;
                }

                // Luồng có CA: gọi lấy thông tin chi tiết
                const infoRes = await getCertInfo(requestId);
                const rawInfo = infoRes?.data || infoRes?.Data;
                const infoArray = Array.isArray(rawInfo) ? rawInfo : (rawInfo ? [rawInfo] : []);
                setCertList(infoArray);
            } catch (error) {
                // Hidden log for debug
                if (__DEV__) console.log("Cert data fetch error:", error);
            } finally {
                setIsCertLoading(false);
            }
        };

        const loadBiometricSetting = async () => {
            const supported = await isBiometricAvailable();
            setIsBiometricSupported(supported);
            if (supported) {
                const val = await AsyncStorage.getItem("biometric_enabled");
                setBiometricEnabled(val === "true");
            }
        };

        fetchCertData();
        loadBiometricSetting();
    }, [requestId]);

    const toggleBiometric = async (value: boolean) => {
        setBiometricEnabled(value);
        await AsyncStorage.setItem("biometric_enabled", value ? "true" : "false");
    };

    const displayName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "NGƯỜI DÙNG"
        : "NGƯỜI DÙNG";

    const avatarUrl = user?.avatar;

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
                    <Image
                        source={require("@/assets/images/logo-text-128x128.webp")}
                        style={{ width: 50, height: 50 }}
                        resizeMode="contain"
                    />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color={isDark ? "#FFF" : "#333"} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.notificationBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}
                        onPress={() => setShowSettings(true)}
                    >
                        <MaterialCommunityIcons name="cog-outline" size={22} color={isDark ? "#FFF" : "#333"} />
                    </TouchableOpacity>
                </View>

            </View>

            {/* Subscription Card - Modern Redesign */}
            <LinearGradient
                colors={isDark ? ["#1E293B", "#0F172A"] : ["#1565C0", "#2092EC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.subscriptionCard}
            >
                {/* Decorative Background Icon */}
                <View style={styles.subDecorIcon}>
                    <MaterialCommunityIcons
                        name="shield-check-outline"
                        size={120}
                        color="rgba(255,255,255,0.06)"
                    />
                </View>

                <View style={styles.subTopSection}>
                    <View style={styles.userInfoWrapper}>
                        {/* User Avatar with Ring */}
                        <View style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.homeAvatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <MaterialCommunityIcons name="account" size={26} color="#FFF" />
                                </View>
                            )}
                            <View style={styles.onlineBadge} />
                        </View>
                        
                        <View style={styles.subUserBox}>
                            <ThemedText style={styles.subWelcomeTitle}>Xin chào,</ThemedText>
                            <ThemedText type="title" style={styles.subUserNameText}>{displayName}</ThemedText>
                        </View>
                    </View>

                    {(isCertLoading || !isCA) && (
                        <View style={[styles.subStatusBadge, { backgroundColor: "rgba(255, 255, 255, 0.15)" }]}>
                            <View style={[styles.statusDot, { backgroundColor: isCertLoading ? "#60A5FA" : "#FBBF24" }]} />
                            <ThemedText style={[styles.subStatusText, { color: "#FFF" }]}>
                                {isCertLoading ? "Đang check" : "Chưa đăng ký"}
                            </ThemedText>
                        </View>
                    )}
                </View>

                {isCertLoading ? (
                    <View style={styles.subLoadingContainer}>
                        <ActivityIndicator color="#FFF" size="small" />
                        <ThemedText style={styles.subLoadingText}>Đang đồng bộ dữ liệu chứng thư...</ThemedText>
                    </View>
                ) : isCA && certList.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                        snapToAlignment="start"
                        decelerationRate="fast"
                    >
                        {certList.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.subContentCard, { width: 280 }]}
                                onPress={() => router.push({
                                    pathname: "/(certificate)/certificate-detail",
                                    params: { id: item.id || item.Id }
                                })}
                                activeOpacity={0.8}
                            >
                                <View style={styles.subDataRow}>
                                    <View style={styles.subDataIconBox}>
                                        <MaterialCommunityIcons name="card-account-details" size={20} color="#FFF" />
                                    </View>
                                    <View style={styles.subDataContent}>
                                        <ThemedText style={styles.subDataLabel}>Chứng thư {idx + 1}</ThemedText>
                                        <ThemedText style={styles.subDataValue} numberOfLines={1}>
                                            {item.CredentialId || item.credentialId || "—"}
                                        </ThemedText>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                                </View>

                                <View style={styles.subDataFooter}>
                                    <MaterialCommunityIcons name="calendar-range" size={14} color="rgba(255,255,255,0.5)" />
                                    <ThemedText style={styles.subValidityText}>
                                        Hết hạn: {formatDate(item.ValidTo || item.validTo)}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <TouchableOpacity
                        style={[styles.subContentCard, styles.noCertCardStyle]}
                        onPress={() => router.push({ pathname: "/(certificate)/certificate-info", params: { fromHome: "true" } })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.noCertInner}>
                            <View style={styles.noCertIconWrap}>
                                <MaterialCommunityIcons name="certificate-outline" size={30} color="#FFF" />
                            </View>
                            <View style={styles.noCertTextBox}>
                                <ThemedText style={styles.noCertTitleText}>Chưa có chứng thư số</ThemedText>
                                <ThemedText style={styles.noCertSubText}>
                                    <ThemedText style={styles.noCertHighlightText}>Đăng ký ngay</ThemedText> để sử dụng đầy đủ tính năng ký số.
                                </ThemedText>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {/* Reject Alert */}
            {/* <View style={[styles.alertCard, { backgroundColor: isDark ? "rgba(255, 82, 82, 0.1)" : "#FFF5F5" }]}>
                <View style={styles.alertContent}>
                    <ThemedText style={[styles.alertTitle, { color: isDark ? "#FFAB91" : "#D32F2F" }]}>2 tài liệu bị từ chối</ThemedText>
                    <ThemedText style={[styles.alertDesc, { color: isDark ? "rgba(255,255,255,0.5)" : "#666" }]}>Yêu cầu cập nhật chữ ký pháp lý.</ThemedText>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: isDark ? "#FFAB91" : "#EF5350" }]}>
                    <ThemedText numberOfLines={1} style={[styles.actionBtnText, { color: isDark ? "#FFAB91" : "#EF5350" }]}> Xử Lý</ThemedText>
                </TouchableOpacity>
            </View> */}

            <View style={styles.modernSection}>
                <View style={styles.sectionHeaderRow}>
                    <ThemedText style={styles.modernSectionTitle}>Trình ký tài liệu</ThemedText>
                    {/* <TouchableOpacity onPress={() => router.push("/contracts")}>
                        <ThemedText style={styles.viewAllText}>Xem tất cả</ThemedText>
                    </TouchableOpacity> */}
                </View>

                <View style={styles.summaryGrid}>
                    {/* Internal Signing Task */}
                    <TouchableOpacity
                        style={[styles.modernSummaryCard, { backgroundColor: isDark ? "#1E293B" : "#FFF" }]}
                        onPress={() => router.push("/internal")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.summaryTopRow}>
                            <LinearGradient
                                colors={["#2092EC", "#054D8C"]}
                                style={styles.summaryIconGradient}
                            >
                                <MaterialCommunityIcons name="office-building" size={20} color="#FFF" />
                            </LinearGradient>
                            <View style={styles.summaryTitleBox}>
                                <ThemedText style={styles.summaryTitleText}>Nội bộ</ThemedText>
                                <ThemedText style={styles.summarySubText}>Hợp đồng công ty</ThemedText>
                            </View>
                        </View>

                        <View style={styles.summaryValueBox}>
                            <ThemedText style={styles.summaryValueText}>12.040</ThemedText>
                            <ThemedText style={styles.summaryLabelText}>Tài liệu chờ ký</ThemedText>
                        </View>
                    </TouchableOpacity>

                    {/* Partner Signing Task */}
                    <TouchableOpacity
                        style={[styles.modernSummaryCard, { backgroundColor: isDark ? "#1E293B" : "#FFF" }]}
                        onPress={() => router.push("/contracts" as any)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.summaryTopRow}>
                            <LinearGradient
                                colors={["#4CAF50", "#2E7D32"]}
                                style={styles.summaryIconGradient}
                            >
                                <MaterialCommunityIcons name="handshake" size={20} color="#FFF" />
                            </LinearGradient>
                            <View style={styles.summaryTitleBox}>
                                <ThemedText style={styles.summaryTitleText}>Đối tác</ThemedText>
                                <ThemedText style={styles.summarySubText}>Hợp đồng bên ngoài</ThemedText>
                            </View>
                        </View>

                        <View style={styles.summaryValueBox}>
                            <ThemedText style={styles.summaryValueText}>450</ThemedText>
                            <ThemedText style={styles.summaryLabelText}>Lượt ký còn lại</ThemedText>
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


            {/* Quick Actions Section */}
            {/* <View style={styles.modernSection}>
                <View style={styles.sectionHeaderRow}>
                    <ThemedText style={styles.modernSectionTitle}>Hành động nhanh</ThemedText>
                </View>

                <View style={styles.quickGrid}>
                    {[
                        { label: "Tạo mới", icon: "plus-circle-outline", color: ["#6366F1", "#4338CA"], route: "/create" },
                        { label: "Quét QR", icon: "qrcode-scan", color: ["#F59E0B", "#D97706"], route: "/scan" },
                        { label: "Mẫu HS", icon: "file-document-outline", color: ["#10B981", "#059669"], route: "/templates" },
                        { label: "Lịch sử", icon: "history", color: ["#EC4899", "#DB2777"], route: "/history" },
                        { label: "Nghiệm thu", icon: "certificate-outline", color: ["#1565C0", "#2092EC"], route: "/sign-val" },
                        { label: "Thiết lập", icon: "cog-outline", color: ["#6B7280", "#4B5563"], route: "/settings" },
                        { label: "Liên hệ", icon: "headphones", color: ["#06B6D4", "#0891B2"], route: "/support" },
                    ].map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.modernQuickItem, { backgroundColor: isDark ? "#1E293B" : "#FFF" }]}
                            onPress={() => router.push(item.route as any)}
                        >
                            <LinearGradient colors={item.color as [string, string, ...string[]]} style={styles.quickIconGradient}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color="#FFF" />
                            </LinearGradient>
                            <ThemedText style={styles.quickLabelText}>{item.label}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View> */}

            {/* Native View Modal */}
            <Modal
                visible={showNativeView}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowNativeView(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? "#1A2E38" : "#FFF" }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle">Native Kotlin View Bridge</ThemedText>
                            <TouchableOpacity onPress={() => setShowNativeView(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={isDark ? "#FFF" : "#333"} />
                            </TouchableOpacity>
                        </View>

                        <MyNativeView style={styles.nativeViewStyle} />

                        <TouchableOpacity
                            style={[styles.closeBtn, { backgroundColor: "#2092EC" }]}
                            onPress={() => setShowNativeView(false)}
                        >
                            <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Quay lại</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Settings Modal */}
            <Modal
                visible={showSettings}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSettings(false)}
            >
                <TouchableOpacity
                    style={styles.settingsOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSettings(false)}
                >
                    <View style={[styles.settingsSheet, { backgroundColor: isDark ? "#1A2E38" : "#FFF" }]}>
                        {/* Handle bar */}
                        <View style={styles.sheetHandle} />

                        <Text style={[styles.sheetTitle, { color: isDark ? "#FFF" : "#1E293B" }]}>Cài đặt</Text>

                        {/* Biometric toggle row */}
                        {isBiometricSupported && (
                            <View style={[styles.settingsRow, { borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }]}>
                                <View style={styles.settingsRowLeft}>
                                    <View style={[styles.settingsIconBox, { backgroundColor: "rgba(32,146,236,0.12)" }]}>
                                        <MaterialCommunityIcons name="fingerprint" size={20} color="#2092EC" />
                                    </View>
                                    <View>
                                        <Text style={[styles.settingsLabel, { color: isDark ? "#FFF" : "#1E293B" }]}>Xác thực sinh trắc học</Text>
                                        <Text style={[styles.settingsSubLabel, { color: isDark ? "rgba(255,255,255,0.5)" : "#64748B" }]}>
                                            {biometricEnabled ? "Bật — yêu cầu khi mở lại app" : "Tắt — đăng nhập thủ công"}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={biometricEnabled}
                                    onValueChange={toggleBiometric}
                                    trackColor={{ false: "#CBD5E1", true: "#2092EC" }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        )}

                        {/* Test SignVal button (dev helper) */}
                        <TouchableOpacity
                            style={styles.settingsRow}
                            onPress={() => {
                                setShowSettings(false);
                                setTimeout(() => router.push("/sign-val" as any), 200);
                            }}
                        >
                            <View style={styles.settingsRowLeft}>
                                <View style={[styles.settingsIconBox, { backgroundColor: "rgba(21,101,192,0.12)" }]}>
                                    <MaterialCommunityIcons name="certificate" size={20} color="#1565C0" />
                                </View>
                                <View>
                                    <Text style={[styles.settingsLabel, { color: isDark ? "#FFF" : "#1E293B" }]}>Test Nghiệm thu</Text>
                                    <Text style={[styles.settingsSubLabel, { color: isDark ? "rgba(255,255,255,0.5)" : "#64748B" }]}>Chuyển nhanh tới trang xem Cert & Nghiệm thu</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? "rgba(255,255,255,0.3)" : "#CBD5E1"} />
                        </TouchableOpacity>

                        {/* Test lock screen button (dev helper) */}
                        <TouchableOpacity
                            style={styles.settingsRow}
                            onPress={() => {
                                setShowSettings(false);
                                setTimeout(() => lockSession(), 200);
                            }}
                        >
                            <View style={styles.settingsRowLeft}>
                                <View style={[styles.settingsIconBox, { backgroundColor: "rgba(99,102,241,0.12)" }]}>
                                    <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#6366F1" />
                                </View>
                                <View>
                                    <Text style={[styles.settingsLabel, { color: isDark ? "#FFF" : "#1E293B" }]}>Test màn hình khóa</Text>
                                    <Text style={[styles.settingsSubLabel, { color: isDark ? "rgba(255,255,255,0.5)" : "#64748B" }]}>Kiểm tra xác thực vân tay / FaceID</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? "rgba(255,255,255,0.3)" : "#CBD5E1"} />
                        </TouchableOpacity>

                        {/* Logout row */}
                        <TouchableOpacity
                            style={styles.settingsRow}
                            onPress={() => {
                                setShowSettings(false);
                                setTimeout(() => {
                                    Alert.alert(
                                        "Đăng xuất",
                                        "Bạn có chắc chắn muốn đăng xuất không?",
                                        [
                                            { text: "Hủy", style: "cancel" },
                                            {
                                                text: "Đăng xuất",
                                                style: "destructive",
                                                onPress: async () => {
                                                    await logout();
                                                    router.replace("/(auth)/login");
                                                }
                                            }
                                        ]
                                    );
                                }, 300);
                            }}
                        >
                            <View style={styles.settingsRowLeft}>
                                <View style={[styles.settingsIconBox, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
                                    <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                                </View>
                                <Text style={[styles.settingsLabel, { color: "#EF4444" }]}>Đăng xuất</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? "rgba(255,255,255,0.3)" : "#CBD5E1"} />
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            style={[styles.settingsCancelBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F8FAFC" }]}
                            onPress={() => setShowSettings(false)}
                        >
                            <Text style={[styles.settingsCancelText, { color: isDark ? "rgba(255,255,255,0.7)" : "#64748B" }]}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        paddingTop: 45,
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
        color: "#FFF",
    },
    userName: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFF",
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

    // --- Subscription Card (Premium Style) ---
    subscriptionCard: {
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        marginTop: 10,
        marginBottom: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        position: "relative",
    },
    subDecorIcon: {
        position: "absolute",
        right: -20,
        bottom: -20,
        opacity: 0.6,
    },
    subTopSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    subUserBox: {
        flex: 1,
    },
    homeAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.5)",
    },
    subWelcomeTitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.7)",
        marginBottom: 4,
    },
    subUserNameText: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFF",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    subStatusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    subStatusText: {
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    userInfoWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    avatarContainer: {
        position: "relative",
    },
    avatarFallback: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
    },
    onlineBadge: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#10B981",
        borderWidth: 2,
        borderColor: "#1565C0", // Should match card or use parent color
    },
    subLoadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 12,
        borderRadius: 16,
        gap: 10,
    },
    subLoadingText: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "500",
    },
    subContentCard: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },
    subDataRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    subDataIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    subDataContent: {
        flex: 1,
    },
    subDataLabel: {
        fontSize: 10,
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        fontWeight: "600",
        marginBottom: 2,
    },
    subDataValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFF",
    },
    subDataFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
        gap: 6,
    },
    subValidityText: {
        fontSize: 11,
        color: "rgba(255,255,255,0.6)",
        fontWeight: "500",
    },
    noCertCardStyle: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderColor: "rgba(255,255,255,0.2)",
        borderWidth: 1,
    },
    noCertInner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    noCertIconWrap: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    noCertTextBox: {
        flex: 1,
    },
    noCertTitleText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFF",
    },
    noCertSubText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
        marginTop: 4,
        lineHeight: 18,
    },
    noCertHighlightText: {
        color: "#FFF",
        textDecorationLine: "underline",
        fontStyle: "italic",
    },
    noCertGoBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },

    // --- Modern Section Layout ---
    modernSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modernSectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.3,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2092EC",
    },

    // --- Summary Grid Styles ---
    summaryGrid: {
        flexDirection: "row",
        gap: 12,
    },
    modernSummaryCard: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    summaryIconGradient: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    summaryTitleBox: {
        flex: 1,
    },
    summaryTitleText: {
        fontSize: 14,
        fontWeight: "700",
    },
    summarySubText: {
        fontSize: 11,
        opacity: 0.5,
        marginTop: 1,
    },
    summaryValueBox: {
        marginTop: 4,
    },
    summaryValueText: {
        fontSize: 24,
        fontWeight: "800",
        color: "#2092EC",
    },
    summaryLabelText: {
        fontSize: 11,
        fontWeight: "600",
        opacity: 0.5,
        marginTop: -2,
    },

    // --- Quick Actions Grid ---
    quickGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "space-between",
    },
    modernQuickItem: {
        width: "31%",
        aspectRatio: 1,
        borderRadius: 20,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.03)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    quickIconGradient: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    quickLabelText: {
        fontSize: 11,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: -0.2,
    },

    // --- Modal & Native View Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    nativeViewStyle: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    closeBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    // --- Generic Section (Keep for compatibility) ---
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    cardBox: {
        marginHorizontal: 20,
        borderRadius: 20,
        paddingTop: 20,
        paddingBottom: 20,
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
    docRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.03)",
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
        fontSize: 11,
        fontWeight: "600",
    },

    // --- Settings Modal ---
    settingsOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    settingsSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 12,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(0,0,0,0.12)",
        alignSelf: "center",
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 20,
    },
    settingsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    settingsRowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        flex: 1,
    },
    settingsIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    settingsLabel: {
        fontSize: 15,
        fontWeight: "600",
    },
    settingsSubLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    settingsCancelBtn: {
        marginTop: 16,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: "center",
    },
    settingsCancelText: {
        fontSize: 15,
        fontWeight: "600",
    },
});


