
import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Contract, getContracts } from "@/services/contractService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const HARDCODED_ACCOUNT_ID = "E064B20B-3312-4454-B412-0EFD2312C1B1";

const STATUS_FILTERS = [
    { key: "all", label: "Tất cả", color: "#607D8B" },
    { key: "0", label: "Chờ duyệt", color: "#FBC02D" },
    { key: "1", label: "Hoàn thành", color: "#4CAF50" },
    { key: "2", label: "Từ chối", color: "#E53935" },
];

export default function DigitalContractsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        setIsLoading(true);
        try {
            const data = await getContracts(HARDCODED_ACCOUNT_ID);
            setContracts(data);
        } catch (error) {
            console.error("Lỗi tải danh sách hợp đồng:", error);
            setContracts([]); // Đảm bảo contracts luôn là array
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0: return { label: "Chờ duyệt", color: "#FBC02D", bg: isDark ? "#3E2723" : "#FFF9E6", type: "waiting" };
            case 1: return { label: "Hoàn thành", color: "#4CAF50", bg: isDark ? "#1B5E20" : "#E8F5E9", type: "completed" };
            case 2: return { label: "Từ chối", color: "#E53935", bg: isDark ? "#4A1010" : "#FFEBEE", type: "rejected" };
            default: return { label: "Không xác định", color: "#9E9E9E", bg: "#F5F5F5", type: "unknown" };
        }
    };

    const filteredContracts = contracts.filter((c) => {
        const matchFilter = activeFilter === "all" || c.Status.toString() === activeFilter;
        const matchSearch =
            c.ContractName.toLowerCase().includes(searchText.toLowerCase());
        return matchFilter && matchSearch;
    });

    const renderItem = ({ item }: { item: Contract }) => {
        const statusInfo = getStatusInfo(item.Status);
        const isWaiting = item.Status === 0;
        const isRejected = item.Status === 2;

        const displayDate = item.ContractDate
            ? new Date(item.ContractDate).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            : "N/A";

        return (
            <TouchableOpacity
                style={[
                    styles.contractCard,
                    {
                        backgroundColor: isWaiting
                            ? (isDark ? "#2D2418" : "#FFFBEB")
                            : isRejected
                                ? (isDark ? "#2C0A0A" : "#FFF5F5")
                                : (isDark ? "#1D3D47" : "#FFF"),
                        borderWidth: isWaiting || isRejected ? 1 : 0,
                        borderColor: isWaiting ? "#FBC02D" : isRejected ? "#E53935" : "transparent",
                    }
                ]}
                onPress={() => router.push({
                    pathname: "/contract-detail",
                    params: { id: item.ContractId, name: item.ContractName }
                })}
            >
                <View style={styles.cardMainRow}>
                    <View style={[styles.iconContainer, {
                        backgroundColor: isRejected
                            ? (isDark ? "#4A0E0E" : "#FFEBEE")
                            : (isDark ? "#2C5364" : "#E3F2FD")
                    }]}>
                        <MaterialCommunityIcons
                            name={isRejected ? "file-alert-outline" : "file-document-outline"}
                            size={24}
                            color={isRejected ? "#E53935" : "#2196F3"}
                        />
                    </View>
                    <View style={styles.contentContainer}>
                        <ThemedText style={styles.contractTitle}>{item.ContractName}</ThemedText>
                        <View style={styles.statusBadgeRow}>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                                <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                                    {statusInfo.label}
                                </ThemedText>
                            </View>
                        </View>
                        <View style={styles.dateRow}>
                            <MaterialCommunityIcons name="clock-outline" size={13} color="#9E9E9E" />
                            <ThemedText style={styles.dateText}>{displayDate}</ThemedText>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F0F4F8" }]}>
            {/* Gradient Header */}
            <LinearGradient
                colors={["#00695C", "#00ACC1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleBlock}>
                        <ThemedText style={styles.headerTitle}>Ký số điện tử</ThemedText>
                        <ThemedText style={styles.headerCount}>{filteredContracts.length} hợp đồng</ThemedText>
                    </View>
                    <View style={styles.headerBtns}>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, showSearch && styles.headerIconBtnActive]}
                            onPress={() => { setShowSearch(!showSearch); setShowFilter(false); }}
                        >
                            <MaterialCommunityIcons name="magnify" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, showFilter && styles.headerIconBtnActive]}
                            onPress={() => { setShowFilter(!showFilter); setShowSearch(false); }}
                        >
                            <MaterialCommunityIcons name="tune-variant" size={22} color="#FFF" />
                            {activeFilter !== "all" && <View style={styles.filterDot} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                {showSearch && (
                    <View style={styles.searchBar}>
                        <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm theo tên hoặc người gửi..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </LinearGradient>

            {/* Filter Panel */}
            {showFilter && (
                <View style={[styles.filterPanel, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <ThemedText style={styles.filterPanelTitle}>Lọc theo trạng thái</ThemedText>
                    <View style={styles.filterChips}>
                        {STATUS_FILTERS.map((f) => (
                            <TouchableOpacity
                                key={f.key}
                                style={[
                                    styles.chip,
                                    activeFilter === f.key && { backgroundColor: f.color, borderColor: f.color }
                                ]}
                                onPress={() => setActiveFilter(f.key)}
                            >
                                {activeFilter === f.key && (
                                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                                )}
                                <ThemedText style={[styles.chipText, activeFilter === f.key && { color: "#FFF" }]}>
                                    {f.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00ACC1" />
                    <ThemedText style={styles.loadingText}>Đang tải hợp đồng...</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredContracts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.ContractId}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons name="file-search-outline" size={60} color={isDark ? "#1D3D47" : "#DDD"} />
                            <ThemedText style={styles.emptyText}>Không tìm thấy hợp đồng</ThemedText>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center", justifyContent: "center",
    },
    headerTitleBlock: { flex: 1 },
    headerTitle: {
        color: "#FFF",
        fontSize: 17,
        fontWeight: "700",
    },
    headerCount: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
        marginTop: 1,
    },
    headerBtns: {
        flexDirection: "row",
        gap: 8,
    },
    headerIconBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center", justifyContent: "center",
    },
    headerIconBtnActive: {
        backgroundColor: "rgba(255,255,255,0.30)",
    },
    filterDot: {
        position: "absolute",
        top: 6, right: 6,
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: "#FBC02D",
        borderWidth: 1.5,
        borderColor: "#00695C",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: "#FFF",
        fontSize: 14,
        padding: 0,
    },
    filterPanel: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    filterPanelTitle: {
        fontSize: 12,
        opacity: 0.5,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    filterChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "rgba(0,0,0,0.1)",
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    listContent: {
        padding: 16,
        paddingTop: 12,
    },
    contractCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 14,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardMainRow: { flexDirection: "row" },
    cardActionRow: { marginTop: 12 },
    actionDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.05)", marginBottom: 12 },
    actionButtons: {
        flexDirection: "row",
        gap: 10,
    },
    viewBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1.5,
        borderColor: "#00897B",
    },
    viewBtnText: {
        color: "#00897B",
        fontWeight: "700",
        fontSize: 14,
    },
    quickSignBtn: {
        flex: 2,
        backgroundColor: "#00897B",
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingVertical: 10, borderRadius: 12, gap: 8,
    },
    quickSignText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
    renewBtn: {
        flex: 2,
        backgroundColor: "#E53935",
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingVertical: 10, borderRadius: 12, gap: 8,
    },
    statusBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    overduePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#FFEBEE",
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    overdueText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#E53935",
    },
    iconContainer: {
        width: 48, height: 48, borderRadius: 12,
        alignItems: "center", justifyContent: "center", marginRight: 14,
    },
    contentContainer: { flex: 1 },
    contractTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8, lineHeight: 20 },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8,
    },

    statusText: { fontSize: 11, fontWeight: "700" },
    senderText: { fontSize: 13, opacity: 0.55, marginBottom: 6 },
    dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    dateText: { fontSize: 12, color: "#9E9E9E" },
    empty: {
        alignItems: "center", justifyContent: "center",
        paddingVertical: 60, gap: 14,
    },
    emptyText: { fontSize: 14, opacity: 0.4 },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#999",
    },
});
