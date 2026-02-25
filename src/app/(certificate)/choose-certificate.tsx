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

/* ─── Types ─────────────────────────────────────────────────── */
interface CertificateProvider {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  selected: boolean;
  color: string;
}

/* ─── Provider Card Component ───────────────────────────────── */
function ProviderCard({
  provider,
  onSelect,
}: {
  provider: CertificateProvider;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.providerCard,
        provider.selected && styles.providerCardSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={[styles.logoBox, { backgroundColor: provider.color }]}>
        <Text style={styles.logoText}>{provider.logo}</Text>
      </View>
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{provider.displayName}</Text>
        <Text style={styles.providerType}>Cloud-based Remote Signing</Text>
      </View>
      <View style={[styles.radio, provider.selected && styles.radioSelected]}>
        {provider.selected && (
          <View style={styles.radioInner} />
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function ChooseCertificateScreen() {
  const router = useRouter();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [providers, setProviders] = useState<CertificateProvider[]>([
    {
      id: "1",
      name: "viettel",
      displayName: "Viettel - MySign",
      logo: "V",
      color: "#EE0033",
      selected: true,
    },
  ]);

  const handleProviderSelect = (id: string) => {
    setProviders(providers.map(p => ({ ...p, selected: p.id === id })));
  };

  const handleContinue = () => {
    if (termsAccepted) {
      router.push("/identity-verification");
    }
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
          <Text style={styles.headerTitle}>Chọn nhà cung cấp</Text>
          <Text style={styles.headerSub}>Đăng ký chứng thư số từ xa</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CÁC ĐƠN VỊ CẤP PHÉP (CA)</Text>
          <Text style={styles.sectionDesc}>Vui lòng chọn một nhà cung cấp dịch vụ để tiếp tục</Text>
        </View>

        {providers.map((p) => (
          <ProviderCard
            key={p.id}
            provider={p}
            onSelect={() => handleProviderSelect(p.id)}
          />
        ))}

        {/* ── Terms Section ── */}
        <View style={styles.termsCard}>
          <TouchableOpacity
            style={styles.termsCheckboxRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxSelected]}>
              {termsAccepted && <MaterialCommunityIcons name="check" size={14} color="#FFF" />}
            </View>
            <Text style={styles.termsText}>
              Tôi xác nhận rằng tôi đã đọc, hiểu và đồng ý với nội dung điều khoản, điều kiện cấp chứng thư số.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewTermsBtn}
            onPress={() => setShowTermsModal(true)}
          >
            <Text style={styles.viewTermsText}>Xem chi tiết điều khoản</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#2092EC" />
          </TouchableOpacity>
        </View>

        <View style={styles.noticeBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#1565C0" />
          <Text style={styles.noticeText}>
            Dữ liệu cá nhân của bạn sẽ được gửi cho đơn vị cung cấp bạn đã chọn để phục vụ việc xác thực và cấp chứng thư.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Action ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startBtn, !termsAccepted && styles.startBtnDisabled]}
          onPress={handleContinue}
          disabled={!termsAccepted}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Tiếp tục xác thực</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Terms Modal ── */}
      <Modal visible={showTermsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Điều khoản dịch vụ</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                1. Quyền và nghĩa vụ của khách hàng...
                {"\n\n"}
                2. Cam kết bảo mật thông tin...
                {"\n\n"}
                3. Quy trình cấp và thu hồi chứng thư số...
                {"\n\n"}
                4. Trách nhiệm pháp lý của các bên...
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.modalCloseText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  scrollView: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 24,
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

  scrollContent: { padding: 20 },

  sectionHeader: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: "800", color: "#64748B", letterSpacing: 1 },
  sectionDesc: { fontSize: 13, color: "#94A3B8", marginTop: 4 },

  /* Provider Card */
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  providerCardSelected: {
    borderColor: "#2092EC",
    backgroundColor: "#F0F7FF",
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  providerInfo: { flex: 1, marginLeft: 16 },
  providerName: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  providerType: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#2092EC",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2092EC",
  },

  /* Terms Card */
  termsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  termsCheckboxRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: "#2092EC",
    borderColor: "#2092EC",
  },
  termsText: { flex: 1, fontSize: 13, color: "#64748B", lineHeight: 20 },
  viewTermsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 4,
  },
  viewTermsText: { fontSize: 13, color: "#2092EC", fontWeight: "700" },

  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF2FE",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  noticeText: { flex: 1, fontSize: 12, color: "#3E6B9A", lineHeight: 18 },

  /* Footer */
  footer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1565C0",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
  },
  startBtnDisabled: { backgroundColor: "#CBD5E1" },
  startBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  modalBody: { marginBottom: 24 },
  modalText: { fontSize: 14, color: "#64748B", lineHeight: 22 },
  modalCloseBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCloseText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
