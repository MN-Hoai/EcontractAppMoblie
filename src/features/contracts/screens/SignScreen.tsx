import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/* ─── Info Row Component ────────────────────────────────────── */
function DocumentInfoRow({ label, value, icon, last = false }: { label: string; value: string; icon: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.rowBorder]}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={icon as any} size={18} color="#2092EC" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function SignScreen() {
  const router = useRouter();

  const handleSign = () => {
    router.push("/sign-otp");
  };

  return (
    <View style={styles.container}>
      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#1565C0", "#2092EC"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ký số tài liệu</Text>
          <Text style={styles.headerSub}>Xác thực bằng Chứng thư số</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Section 1 ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TÀI LIỆU CHÍNH</Text>
        </View>
        <View style={styles.card}>
          <DocumentInfoRow
            icon="file-pdf-box"
            label="Tên văn bản"
            value="Viettel-CA_RS_HopDongChoVay.pdf"
          />
          <DocumentInfoRow
            icon="card-text-outline"
            label="Mô tả ký"
            value="Ký số văn bản Vay thấu chi qua ứng dụng MySign"
          />
          <DocumentInfoRow
            icon="office-building"
            label="Nhà cung cấp"
            value="Viettel-CA RS"
          />
          <DocumentInfoRow
            icon="timer-outline"
            label="Thời gian còn lại"
            value="175 giây"
            last
          />
        </View>

        {/* ── Section 2 ── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>TÀI LIỆU ĐI KÈM</Text>
        </View>
        <View style={styles.card}>
          <DocumentInfoRow
            icon="file-document-outline"
            label="Tên văn bản"
            value="GiayDangKyCKS.pdf"
          />
          <DocumentInfoRow
            icon="shield-edit-outline"
            label="Mô tả ký"
            value="Đăng ký chứng thư số đồng thời trong luồng ký"
            last
          />
        </View>

        {/* ── Security Note ── */}
        <View style={styles.securityBox}>
          <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#FFB300" />
          <Text style={styles.securityText}>
            Giao dịch được bảo mật bởi công nghệ ký số đám mây thế hệ mới của Viettel-CA.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="close-circle-outline" size={20} color="#b44545" />
          <Text style={styles.rejectBtnText}>Từ chối</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signButton}
          onPress={handleSign}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="draw" size={20} color="#FFF" />
          <Text style={styles.signButtonText}>Ký số</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 45,
    flex: 1, backgroundColor: "#F0F4F8" },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 15, paddingBottom: 18, paddingHorizontal: 15, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },

  scrollContent: { padding: 16, paddingBottom: 24 },

  sectionHeader: { marginBottom: 12, paddingLeft: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#666", letterSpacing: 1 },

  /* Card */
  card: {
    backgroundColor: "#FFF", borderRadius: 18, marginBottom: 14,
    overflow: "hidden", shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05,
    shadowRadius: 10, elevation: 2,
  },

  /* Info Row */
  infoRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#EAF2FE", alignItems: "center", justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#9E9E9E", fontWeight: "600", marginBottom: 3 },
  infoValue: { fontSize: 14, color: "#1A1A1A", fontWeight: "700", lineHeight: 20 },

  /* Security Box */
  securityBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFF8E1", borderRadius: 14, padding: 14,
    marginTop: 8, borderLeftWidth: 3, borderLeftColor: "#FFB300",
  },
  securityText: { flex: 1, fontSize: 12, color: "#3E6B9A", lineHeight: 18 },

  /* Bottom Bar */
  bottomBar: {
    flexDirection: "row", gap: 12,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24,
    backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#EEF0F4",
  },
  rejectBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#feeaea", borderRadius: 14, paddingVertical: 14,
  },
  rejectBtnText: { color: "#8b3131", fontSize: 15, fontWeight: "700" },

  signButton: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#1565C0", borderRadius: 14, paddingVertical: 14,
  },
  signButtonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
