
import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DigitalContract, DigitalContractService } from "@/services/digitalContractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

const CONTRACT_TABS = [
    { key: "waiting", label: "Chờ ký", color: "#fcb628" },
    { key: "my", label: "Tôi lập", color: "#796dffff" },
    { key: "completed", label: "Hoàn tất", color: "#72e028" },
    { key: "signed", label: "Đã ký ", color: "#72e028" },
    { key: "canceled", label: "Từ chối", color: "#E53935" },

];

export default function DigitalContractsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const { requestId } = useAuthStore();
    const flatListRef = useRef<FlatList>(null);

    const [contracts, setContracts] = useState<DigitalContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    const [showSearch, setShowSearch] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [showPagination, setShowPagination] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("waiting");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 2000);

        return () => {
            clearTimeout(handler);
        };
    }, [searchText]);

    useEffect(() => {
        loadContracts(1);
    }, [activeTab, debouncedSearchText, pageSize]);

    const loadContracts = async (pageNumber: number, showRefreshing: boolean = false) => {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const data = await DigitalContractService.getContracts(
                activeTab,
                pageNumber,
                pageSize,
                true,
                debouncedSearchText
            );
            setContracts(data?.Many || []);
            setTotalCount(data?.Count || 0);
            setPage(pageNumber);

            // Tự động cuộn lên đầu khi sang trang mới
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        } catch (error) {
            console.log("Lỗi tải danh sách hợp đồng:", error);
            setContracts([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        // Kéo lên (Pull to refresh) -> Giảm trang nếu đang ở trang > 1 để trở về trang trước
        if (page > 1) {
            loadContracts(page - 1, true);
        } else {
            loadContracts(1, true);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            loadContracts(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            loadContracts(page + 1);
        }
    };



    const handleLoadMore = () => {
        // Tăng trang (đi tới trang tiếp) khi kéo xuống cuối
        if (!isLoading && page < totalPages) {
            handleNextPage();
        }
    };

    const parseDotNetDate = (dateString?: string | null) => {
        if (!dateString) return null;
        const match = dateString.match(/\/Date\((\d+)[+\-]?\d*\)\//);
        if (match && match[1]) {
            return new Date(parseInt(match[1], 10));
        }
        return new Date(dateString);
    };

    const getStatusInfo = (status: number, currentTab: string) => {
        switch (status) {
            case 0:
                return {
                    label: "Nháp",
                    color: "#484848",
                    bg: isDark ? "#2A2A2A" : "#F5F5F5",
                    icon: "file-edit-outline"
                };
            case 1:
                return {
                    label: "Chờ ký",
                    color: "#fcb628",
                    bg: isDark ? "#3E2723" : "#FFF9E6",
                    icon: "pen-lock"
                };
            case 2:
                return {
                    label: "Đã ký",
                    color: "#72e028",
                    bg: isDark ? "#1B5E20" : "#E8F5E9",
                    icon: "file-certificate-outline"
                };
            case -1:
                return {
                    label: "Hủy",
                    color: "#ff4d4a",
                    bg: isDark ? "#4A1010" : "#FFEBEE",
                    icon: "file-cancel-outline"
                };
            default:
                return {
                    label: "Không xác định",
                    color: "#9E9E9E",
                    bg: isDark ? "#2A2A2A" : "#F5F5F5",
                    icon: "file-question-outline"
                };
        }
    };



    const renderItem = ({ item }: { item: DigitalContract }) => {
        const contractInfo = item.Contract;
        if (!contractInfo) return null;

        const statusInfo = getStatusInfo(contractInfo.Status, activeTab);
        const isWaiting = contractInfo.Status === 0;
        const isRejected = contractInfo.Status === 2;

        const parsedDate = parseDotNetDate(contractInfo.RequestSentDate || contractInfo.CreatedDate);
        const displayDate = parsedDate
            ? parsedDate.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
            : "N/A";

        // Sử dụng Path thay cho FileFinalPath (Ưu tiên DocumentFinal)
        const filePath = item.DocumentFinal?.Path || item.DocumentOriginal?.Path || contractInfo.FileFinalPath || "";

        return (
            <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                layout={Layout.springify()}
            >
                <TouchableOpacity
                    style={[
                        styles.contractCard,
                        {
                            backgroundColor: isDark ? "#1D3D47" : "#FFF",
                            borderWidth: 0,
                        }
                    ]}
                    onPress={() => router.push({
                        pathname: "/contract-detail",
                        params: {
                            id: contractInfo.Id,
                            name: contractInfo.ContractName || contractInfo.Name,
                            path: filePath,
                            status: contractInfo.Status
                        }
                    })}
                >
                    <View style={styles.cardMainRow}>
                        <View style={[styles.iconContainer, { backgroundColor: statusInfo.bg }]}>
                            <MaterialCommunityIcons
                                name={statusInfo.icon as any}
                                size={24}
                                color={statusInfo.color}
                            />
                        </View>
                        <View style={styles.contentContainer}>
                            <View style={styles.titleRow}>
                                <ThemedText style={styles.contractTitle} numberOfLines={1}>
                                    {contractInfo.ContractName || contractInfo.Name}
                                </ThemedText>
                                <View style={[
                                    styles.statusBadgeSmall,
                                    {
                                        backgroundColor: 'transparent',
                                        borderWidth: 1,
                                        borderColor: statusInfo.color,
                                    }
                                ]}>
                                    <ThemedText style={[styles.statusTextSmall, { color: statusInfo.color }]}>
                                        {statusInfo.label}
                                    </ThemedText>
                                </View>
                            </View>

                            <ThemedText style={styles.senderText} numberOfLines={1}>
                                Người gửi: {contractInfo.CompanyAName || "Hệ thống"}
                            </ThemedText>

                            <View style={styles.dateRow}>
                                <MaterialCommunityIcons name="calendar-outline" size={13} color="#9E9E9E" />
                                <ThemedText style={styles.dateText}>{displayDate}</ThemedText>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F0F4F8" }]}>
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
                        <ThemedText style={styles.headerCount}>{totalCount} hợp đồng</ThemedText>
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
                            {(activeTab !== "waiting" || pageSize !== 20 || showPagination) && <View style={styles.filterDot} />}
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

            {/* Filter Panel (Replaces permanent Tabs) */}
            {showFilter && (
                <View style={[styles.filterPanel, { backgroundColor: isDark ? "#122026" : "#FFF" }]}>
                    <ThemedText style={styles.filterPanelTitle}>Lọc theo trạng thái</ThemedText>
                    <View style={styles.filterChips}>
                        {CONTRACT_TABS.map((item) => {
                            const isActive = activeTab === item.key;
                            return (
                                <TouchableOpacity
                                    key={item.key}
                                    onPress={() => {
                                        setActiveTab(item.key);
                                        // Option: setShowFilter(false); // Close after select
                                    }}
                                    style={[
                                        styles.chip,
                                        isActive && { backgroundColor: item.color, borderColor: item.color }
                                    ]}
                                >
                                    {isActive && (
                                        <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                                    )}
                                    <ThemedText style={[styles.chipText, isActive && { color: "#FFF" }]}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={{ flexDirection: "row", marginTop: 12, gap: 16 }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText style={styles.filterPanelTitle}>Phân trang</ThemedText>
                            <TouchableOpacity
                                onPress={() => setShowPagination(!showPagination)}
                                style={[
                                    styles.chip,
                                    { marginBottom: 0 },
                                    showPagination && { backgroundColor: "#00ACC1", borderColor: "#00ACC1" }
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={showPagination ? "numeric" : "numeric-off"}
                                    size={16}
                                    color={showPagination ? "#FFF" : isDark ? "#CCC" : "#444"}
                                />
                                <ThemedText style={[styles.chipText, showPagination && { color: "#FFF" }]}>
                                    Bật
                                </ThemedText>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 2.2 }}>
                            <ThemedText style={styles.filterPanelTitle}>Số dòng hiển thị</ThemedText>
                            <View style={[styles.filterChips, { gap: 4 }]}>
                                {[20, 50, 100].map((size) => {
                                    const isActive = pageSize === size;
                                    return (
                                        <TouchableOpacity
                                            key={size}
                                            onPress={() => setPageSize(size)}
                                            style={[
                                                styles.chip,
                                                { paddingHorizontal: 10, flex: 1, justifyContent: 'center', marginBottom: 0 },
                                                isActive && { backgroundColor: "#00ACC1", borderColor: "#00ACC1" }
                                            ]}
                                        >
                                            <ThemedText style={[styles.chipText, { fontSize: 12 }, isActive && { color: "#FFF" }]}>
                                                {size}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
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
                    ref={flatListRef}
                    data={contracts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.Contract?.Id || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialCommunityIcons name="file-search-outline" size={60} color={isDark ? "#1D3D47" : "#DDD"} />
                            <ThemedText style={styles.emptyText}>Không tìm thấy hợp đồng</ThemedText>
                        </View>
                    }
                />
            )}

            {/* Pagination Controls */}
            {showPagination && totalCount > 0 && (
                <View style={[styles.paginationBar, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <TouchableOpacity
                        onPress={handlePrevPage}
                        disabled={page === 1}
                        style={[styles.pageBtn, page === 1 && { opacity: 0.3 }]}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={24} color={isDark ? "#FFF" : "#333"} />
                    </TouchableOpacity>

                    <ThemedText style={styles.pageInfo}>
                        Trang {page} / {totalPages}
                    </ThemedText>

                    <TouchableOpacity
                        onPress={handleNextPage}
                        disabled={page === totalPages}
                        style={[styles.pageBtn, page === totalPages && { opacity: 0.3 }]}
                    >
                        <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? "#FFF" : "#333"} />
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingTop: 45,
    flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 15,
        gap: 12,
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
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    filterPanelTitle: {
        fontSize: 11,
        opacity: 0.6,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    filterChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.2,
        borderColor: "rgba(0,0,0,0.1)",
        marginBottom: 4,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#444",
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
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 4,
    },
    contractTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
    statusBadgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusTextSmall: {
        fontSize: 10,
        fontWeight: "800",
    },
    senderText: {
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 6,
    },
    dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    dateText: { fontSize: 12, color: "#9E9E9E" },
    tabsWrapper: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    tabsScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tabItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "rgba(0,0,0,0.05)",
        backgroundColor: "rgba(0,0,0,0.02)",
        justifyContent: "center",
        alignItems: "center",
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
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
    paginationBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        gap: 20,
    },
    pageBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.03)",
        alignItems: "center",
        justifyContent: "center",
    },
    pageInfo: {
        fontSize: 14,
        fontWeight: "700",
    },
});
