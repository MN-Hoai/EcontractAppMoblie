import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CertificateProvider {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  selected: boolean;
}

/* ─── Info Row for Modal ─────────────────────────────────────── */
function ModalInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.modalInfoRow}>
      <Text style={styles.modalLabel}>{label}</Text>
      <Text style={styles.modalValue}>{value}</Text>
    </View>
  );
}

/* ─── Provider Card Component ────────────────────────────────── */
function ProviderCard({ provider }: { provider: CertificateProvider }) {
  return (
    <View style={[styles.providerCard, provider.selected && styles.providerCardActive]}>
      <View style={styles.providerInfo}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#FFF" />
        </View>
        <View style={styles.providerText}>
          <Text style={styles.providerName}>{provider.displayName}</Text>
          <Text style={styles.providerType}>Nhà cung cấp đã xác thực</Text>
        </View>
      </View>
      {provider.selected && (
        <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
      )}
    </View>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function ChooseCertificate2Screen() {
  const router = useRouter();

  const [providers] = useState<CertificateProvider[]>([
    {
      id: "1",
      name: "viettel",
      displayName: "Viettel - MySign",
      logo: "🔴",
      selected: true,
    },
  ]);

  const [selectedCert, setSelectedCert] = useState<string | null>("446");
  const [showDetail, setShowDetail] = useState(false);

  const certDetails = {
    code: "223",
    serial: "446",
    issuer: "CA RS",
    subscriber: "UID=CMND:001089020747, CN=PHAM ĐỨC HUY, L=NAM ĐỊNH, C=VN",
    status: "Hoạt động",
    start: "16/10/2024",
    end: "16/10/2025",
  };

  return (
    <View style={styles.container}>
      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#1565C0", "#2092EC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chọn Chứng thư số</Text>
          <Text style={styles.headerSub}>Xác thực giao dịch an toàn</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Banner ── */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="security" size={20} color="#1565C0" />
          <Text style={styles.bannerText}>
            Vui lòng chọn chứng thư số phù hợp để tiến hành ký kết tài liệu điện tử.
          </Text>
        </View>

        {/* ── Provider Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NHÀ CUNG CẤP DỊCH VỤ</Text>
        </View>
        {providers.map((p) => (
          <ProviderCard key={p.id} provider={p} />
        ))}

        {/* ── Certificate List Section ── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>DANH SÁCH CHỨNG THƯ SỐ</Text>
        </View>

        <TouchableOpacity
          style={styles.certCard}
          activeOpacity={0.8}
          onPress={() => setSelectedCert("446")}
        >
          <View style={styles.certTop}>
            <View style={styles.certIconBg}>
              <MaterialCommunityIcons name="certificate" size={24} color="#2092EC" />
            </View>
            <View style={styles.certMainInfo}>
              <Text style={styles.certName}>Serial: {certDetails.serial}</Text>
              <Text style={styles.certIssuer}>Nhà cung cấp: {certDetails.issuer}</Text>
            </View>
            <View style={styles.radioOutline}>
              {selectedCert === "446" && <View style={styles.radioInner} />}
            </View>
          </View>

          <View style={styles.certDivider} />

          <View style={styles.certTags}>
            <View style={styles.tag}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#666" />
              <Text style={styles.tagText}>Hạn: {certDetails.end}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: "#E8F5E9" }]}>
              <Text style={[styles.tagText, { color: "#4CAF50", fontWeight: "700" }]}>Đang hoạt động</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => setShowDetail(true)}
          >
            <Text style={styles.detailBtnText}>Xem chi tiết</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#2092EC" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={styles.footer}>
        <View style={styles.disclaimerBox}>
          <MaterialCommunityIcons name="information-outline" size={14} color="#666" />
          <Text style={styles.disclaimerText}>
            Tôi đã đọc hiểu và đồng ý với Điều kiện & điều khoản sử dụng Chứng thư số của Viettel/VietinBank.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.primaryBtn, !selectedCert && styles.btnDisabled]}
          disabled={!selectedCert}
          onPress={() => router.push("/sign")}
        >
          <MaterialCommunityIcons name="send" size={18} color="#FFF" />
          <Text style={styles.primaryBtnText}>Gửi yêu cầu ký số</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Detail Modal ── */}
      <Modal
        visible={showDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết chứng thư số</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.paperEffect}>
                <ModalInfoRow label="Số Serial" value={certDetails.serial} />
                <ModalInfoRow label="Nhà phát hành" value={certDetails.issuer} />
                <View style={styles.divider} />
                <Text style={styles.modalSubLabel}>Thông tin thuê bao</Text>
                <Text style={styles.modalSubscriberText}>{certDetails.subscriber}</Text>
                <View style={styles.divider} />
                <ModalInfoRow label="Thời hạn từ" value={certDetails.start} />
                <ModalInfoRow label="Đến ngày" value={certDetails.end} />
                <ModalInfoRow label="Trạng thái" value={certDetails.status} />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtnAction}
              onPress={() => setShowDetail(false)}
            >
              <Text style={styles.modalCloseBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },

  scrollContent: { padding: 16, paddingBottom: 32 },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF2FE",
    padding: 14,
    borderRadius: 14,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#2092EC",
  },
  bannerText: { flex: 1, fontSize: 13, color: "#3E6B9A", lineHeight: 18 },

  sectionHeader: { marginBottom: 12, paddingLeft: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#666", letterSpacing: 1 },

  /* Provider Card */
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F0F2F5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  providerCardActive: { borderColor: "#2092EC", backgroundColor: "#F8FAFF" },
  providerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E41E26", // Viettel style
    alignItems: "center",
    justifyContent: "center",
  },
  providerText: { flex: 1 },
  providerName: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  providerType: { fontSize: 12, color: "#666", marginTop: 2 },

  /* Cert Card */
  certCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  certTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  certIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EAF2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  certMainInfo: { flex: 1 },
  certName: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
  certIssuer: { fontSize: 12, color: "#666", marginTop: 2 },
  radioOutline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2092EC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#2092EC" },

  certDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },

  certTags: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagText: { fontSize: 11, color: "#666" },

  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  detailBtnText: { fontSize: 13, color: "#2092EC", fontWeight: "700" },

  /* Footer */
  footer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  disclaimerBox: { flexDirection: "row", gap: 8, marginBottom: 16 },
  disclaimerText: { fontSize: 11, color: "#666", lineHeight: 16, flex: 1 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1565C0",
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  btnDisabled: { opacity: 0.5 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: { padding: 20 },
  paperEffect: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  modalLabel: { fontSize: 13, color: "#666" },
  modalValue: { fontSize: 13, fontWeight: "700", color: "#111" },
  modalSubLabel: { fontSize: 12, color: "#9E9E9E", marginTop: 8, fontWeight: "600" },
  modalSubscriberText: { fontSize: 13, color: "#444", marginTop: 6, lineHeight: 20 },
  divider: { height: 1, backgroundColor: "#EDF2F7", marginVertical: 8 },
  modalCloseBtnAction: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
    marginBottom: Platform.OS === "ios" ? 20 : 0,
  },
  modalCloseBtnText: { color: "#1565C0", fontWeight: "700", fontSize: 15 },
});
