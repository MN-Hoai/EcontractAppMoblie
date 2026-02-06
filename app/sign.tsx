import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const handleSign = () => {
    router.push("/sign-otp");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={26} />
          </TouchableOpacity>

          <ThemedText style={{ fontSize: 18, fontWeight: "700" }}>
            Ký số
          </ThemedText>

          <View style={{ width: 28 }} />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.cardTitle}>
            Hợp đồng cho vay
          </ThemedText>

          <View style={[styles.infoCard, styles.cardElevated]}>
            <InfoRow label="Tên văn bản" value="Viettel-CA_RS_HopDongChoVay.pdf" />
            <InfoRow label="Mô tả ký" value="Ký số văn bản Vay thấu chi" />
            <InfoRow label="Nhà cung cấp" value="Viettel-CA RS" />
            <InfoRow label="Thời gian còn lại" value="175 giây" bold />
          </View>

          <ThemedText style={[styles.cardTitle, { marginTop: 18 }]}>
            Giấy đăng ký sử dụng CKS
          </ThemedText>

          <View style={[styles.infoCard, styles.cardElevated]}>
            <InfoRow label="Tên văn bản" value="GiayDangKyCKS.pdf" />
            <InfoRow label="Mô tả ký" value="Đăng ký chứng thư số" />
            <InfoRow label="Nhà cung cấp" value="Viettel-CA RS" />
          </View>
        </View>
      </ScrollView>

      {/* BUTTON BOTTOM */}
      <View style={styles.fixedButtonWrap}>
        <TouchableOpacity style={styles.signButton} onPress={handleSign}>
          <ThemedText style={styles.signButtonText}>Ký số</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
type InfoRowProps = {
  label: string;
  value: string;
  bold?: boolean;
};

function InfoRow({ label, value, bold = false }: InfoRowProps) {
  return (
    <View style={styles.infoRowCard}>
      <ThemedText style={styles.infoLabelMuted}>{label}</ThemedText>
      <ThemedText style={[styles.infoValueSmall, bold && { fontWeight: "700" }]}>
        {value}
      </ThemedText>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingTop: 24,
    marginBottom: 12,
  },
  section: { marginTop: 8 },
  infoCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 0,
  },
  cardElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    alignItems: "center",
  },
  infoLabelMuted: { fontSize: 13, color: "#7A7A7A", flex: 1 },
  infoValue: { fontSize: 13, fontWeight: "700" },
  infoValueSmall: { fontSize: 13, flex: 1, textAlign: "right" },
  buttonContainer: { paddingVertical: 24 },
  signButton: {
    backgroundColor: "#2092EC",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2092EC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  signButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "85%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#7A7A7A",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  fixedButtonWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },

});
