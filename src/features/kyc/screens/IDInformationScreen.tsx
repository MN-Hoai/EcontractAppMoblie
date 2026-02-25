import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

export default function IDInformationScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F8F9FB" }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={isDark ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>Thông tin xác thực</ThemedText>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText style={styles.sectionLabel}>THÔNG TIN CÁ NHÂN</ThemedText>
                <View style={[styles.card, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <InfoField label="Họ và tên" value="PHAM DUC HUY" />
                    <InfoField label="Số CCCD" value="001089020747" />
                    <InfoField label="Ngày sinh" value="13/08/1989" />
                    <InfoField label="Giới tính" value="Nam" />
                    <InfoField label="Địa chỉ" value="P310 Tt 76 Phố Thọ Lão, Đồng Mác, Hà Nội" last />
                </View>

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => router.replace("/(tabs)")}
                >
                    <ThemedText style={styles.confirmText}>Xác nhận thông tin</ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function InfoField({ label, value, last }: { label: string, value: string, last?: boolean }) {
    return (
        <View style={[styles.fieldPadding, !last && styles.borderBottom]}>
            <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
            <ThemedText style={styles.fieldValue}>{value}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    title: { fontSize: 20, fontWeight: "700" },
    content: { padding: 20 },
    sectionLabel: { fontSize: 13, fontWeight: "700", color: "#7A7A7A", marginBottom: 12 },
    card: { borderRadius: 16, padding: 16 },
    fieldPadding: { paddingVertical: 12 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
    fieldLabel: { fontSize: 12, opacity: 0.6, marginBottom: 4 },
    fieldValue: { fontSize: 14, fontWeight: "700" },
    confirmButton: { backgroundColor: "#2092EC", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 24 },
    confirmText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
