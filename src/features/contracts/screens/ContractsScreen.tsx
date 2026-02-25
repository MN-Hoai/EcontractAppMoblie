import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ALL_CONTRACTS = [
    { id: "1", title: "Hợp đồng lao động - VNG", status: "Chờ duyệt", sender: "Nguyễn Văn A", date: "23/02/2026 09:00", type: "waiting" },
    { id: "2", title: "Hợp đồng thuê nhà", status: "Hoàn thành", sender: "Trần Thị B", date: "20/02/2026 14:30", type: "completed" },
    { id: "3", title: "Hợp đồng mua bán thiết bị", status: "Hoàn thành", sender: "Lê Văn C", date: "15/02/2026 10:15", type: "completed" },
    { id: "4", title: "Hợp đồng dịch vụ tư vấn", status: "Chờ duyệt", sender: "Phạm Đức D", date: "12/02/2026 16:00", type: "waiting" },
    { id: "5", title: "Hợp đồng cung cấp phần mềm", status: "Đang xử lý", sender: "Hữu Tín", date: "10/02/2026 08:45", type: "processing" },
    { id: "6", title: "Biên bản thanh lý hợp đồng", status: "Hoàn thành", sender: "Minh Tuấn", date: "05/02/2026 11:00", type: "completed" },
];

const STATUS_FILTERS = [
    { key: "all", label: "Tất cả", color: "#607D8B" },
    { key: "waiting", label: "Chờ duyệt", color: "#FBC02D" },
    { key: "processing", label: "Đang xử lý", color: "#2196F3" },
    { key: "completed", label: "Hoàn thành", color: "#4CAF50" },
];

export default function ContractsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    const [showSearch, setShowSearch] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const getStatusStyle = (type: string) => {
        switch (type) {
            case "waiting": return { bg: isDark ? "#3E2723" : "#FFF9E6", text: "#FBC02D" };
            case "completed": return { bg: isDark ? "#1B5E20" : "#E8F5E9", text: "#4CAF50" };
            case "processing": return { bg: isDark ? "#0D47A1" : "#E3F2FD", text: "#2196F3" };
            default: return { bg: "#F5F5F5", text: "#9E9E9E" };
        }
    };

    const filteredContracts = ALL_CONTRACTS.filter((c) => {
        const matchFilter = activeFilter === "all" || c.type === activeFilter;
        const matchSearch =
            c.title.toLowerCase().includes(searchText.toLowerCase()) ||
            c.sender.toLowerCase().includes(searchText.toLowerCase());
        return matchFilter && matchSearch;
    });

    const renderItem = ({ item }: { item: typeof ALL_CONTRACTS[0] }) => {
        const statusStyle = getStatusStyle(item.type);
        const isWaiting = item.type === "waiting";

        return (
            <TouchableOpacity
                style={[
                    styles.contractCard,
                    {
                        backgroundColor: isWaiting
                            ? (isDark ? "#2D2418" : "#FFFBEB")
                            : (isDark ? "#1D3D47" : "#FFF"),
                        borderWidth: isWaiting ? 1 : 0,
                        borderColor: isWaiting ? "#FBC02D" : "transparent",
                    }
                ]}
                onPress={() => router.push({
                    pathname: "/contract-detail",
                    params: { id: item.id, name: item.title }
                })}
            >
                <View style={styles.cardMainRow}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? "#2C5364" : "#EEF4FF" }]}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color="#5C6BC0" />
                    </View>
                    <View style={styles.contentContainer}>
                        <ThemedText style={styles.contractTitle}>{item.title}</ThemedText>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</ThemedText>
                        </View>
                        <ThemedText style={styles.senderText}>
                            Gửi bởi <ThemedText style={{ fontWeight: "700" }}>{item.sender}</ThemedText>
                        </ThemedText>
                        <View style={styles.dateRow}>
                            <MaterialCommunityIcons name="clock-outline" size={13} color="#9E9E9E" />
                            <ThemedText style={styles.dateText}>{item.date}</ThemedText>
                        </View>
                    </View>
                </View>

                {isWaiting && (
                    <View style={styles.cardActionRow}>
                        <View style={styles.actionDivider} />
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.viewBtn}
                                onPress={() => router.push("/contract-content")}
                            >
                                <MaterialCommunityIcons name="file-eye-outline" size={16} color="#5C6BC0" />
                                <ThemedText style={styles.viewBtnText}>Xem</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickSignBtn}
                                onPress={() => router.push("/sign-contract")}
                            >
                                <MaterialCommunityIcons name="pen" size={16} color="#FFF" />
                                <ThemedText style={styles.quickSignText}>Ký ngay</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F0F4F8" }]}>
            {/* Gradient Header */}
            <LinearGradient
                colors={["#4527A0", "#7986CB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleBlock}>
                        <ThemedText style={styles.headerTitle}>Danh sách hợp đồng</ThemedText>
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

            <FlatList
                data={filteredContracts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="file-search-outline" size={60} color={isDark ? "#1D3D47" : "#DDD"} />
                        <ThemedText style={styles.emptyText}>Không tìm thấy hợp đồng</ThemedText>
                    </View>
                }
            />
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
        borderColor: "#4527A0",
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
        borderColor: "#5C6BC0",
    },
    viewBtnText: {
        color: "#5C6BC0",
        fontWeight: "700",
        fontSize: 14,
    },
    quickSignBtn: {
        flex: 2,
        backgroundColor: "#5C6BC0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    quickSignText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
    iconContainer: {
        width: 48, height: 48, borderRadius: 12,
        alignItems: "center", justifyContent: "center", marginRight: 14,
    },
    contentContainer: { flex: 1 },
    contractTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8, lineHeight: 20 },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8, marginBottom: 8,
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
});
