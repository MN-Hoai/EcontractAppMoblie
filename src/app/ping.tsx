import { useColorScheme } from "@/hooks/use-color-scheme";
import apiClient from "@/services/api-client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "@/components/ui/themed-text";

export default function PingScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePing = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);
        try {
            const res = await apiClient.get("/api/ping");
            setResponse(res.data);
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi khi gọi API");
            if (err.response) {
                setResponse(err.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F8F9FB" }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Kiểm tra kết nối (Ping)</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText style={styles.description}>
                    Nhấn nút bên dưới để kiểm tra kết nối tới máy chủ API:
                    {"\n"}
                    <ThemedText style={{ fontWeight: 'bold', color: '#2092EC' }}>
                        https://contract.officeai.vn/api/ping
                    </ThemedText>
                </ThemedText>

                <TouchableOpacity
                    style={[styles.pingButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handlePing}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="broadcast" size={24} color="#FFF" style={{ marginRight: 8 }} />
                            <ThemedText style={styles.pingButtonText}>Gọi API Ping</ThemedText>
                        </>
                    )}
                </TouchableOpacity>

                {response && (
                    <View style={[styles.resultContainer, { backgroundColor: isDark ? "#1E293B" : "#FFF" }]}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons 
                                name={response.Success ? "check-circle" : "alert-circle"} 
                                size={20} 
                                color={response.Success ? "#10B981" : "#EF4444"} 
                            />
                            <ThemedText style={styles.resultTitle}>Kết quả phản hồi:</ThemedText>
                        </View>
                        <View style={[styles.jsonBox, { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}>
                            <ThemedText style={styles.jsonText}>
                                {JSON.stringify(response, null, 2)}
                            </ThemedText>
                        </View>
                    </View>
                )}

                {error && !response && (
                    <View style={[styles.errorContainer, { backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#FEF2F2" }]}>
                        <MaterialCommunityIcons name="close-circle-outline" size={24} color="#EF4444" />
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: {
        padding: 8,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    content: {
        padding: 20,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.7,
        marginBottom: 30,
        textAlign: "center",
    },
    pingButton: {
        backgroundColor: "#2092EC",
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
        shadowColor: "#2092EC",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    pingButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    resultContainer: {
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    resultHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    jsonBox: {
        borderRadius: 12,
        padding: 16,
    },
    jsonText: {
        fontFamily: "System", // Replace with monospace if available
        fontSize: 14,
        lineHeight: 20,
        color: "#2092EC",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
});
