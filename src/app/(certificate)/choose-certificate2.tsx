import { CertInfo, getCertInfo } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
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

/* ─── Copy Row ─────────────────────────────────────────────── */
function CopyRow({ label, value, canCopy = false }: { label: string; value: string; canCopy?: boolean }) {
  const handleCopy = () => {
    Clipboard.setString(value);
    Alert.alert("Đã sao chép", `${label} đã được sao chép vào clipboard.`);
  };

  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.rowContent}>
        <Text style={detailStyles.rowLabel}>{label}</Text>
        <Text style={detailStyles.rowValue}>{value}</Text>
      </View>
      {canCopy && value !== "—" && (
        <TouchableOpacity onPress={handleCopy} style={detailStyles.copyBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="content-copy" size={18} color="#9BA8B5" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ─── Status Badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const isValid = status.toLowerCase() === "valid" || status === "Đang hoạt động";
  const label = isValid ? "Đang hoạt động" : status;
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.rowContent}>
        <Text style={detailStyles.rowLabel}>Trạng thái</Text>
        <Text style={[detailStyles.rowValue, isValid ? detailStyles.statusActive : detailStyles.statusInactive]}>
          {label}
        </Text>
      </View>
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
  const { requestId } = useAuthStore();

  const [providers] = useState<CertificateProvider[]>([
    {
      id: "1",
      name: "viettel",
      displayName: "Viettel - MySign",
      logo: "🔴",
      selected: true,
    },
  ]);

  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper date formatter dd/MM/yyyy
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  // Parse CN from subjectDN
  const getSubjectName = (info: CertInfo | null) =>
    (info?.subjectDN || info?.SubjectDN)?.match(/CN=([^,]+)/)?.[1] || "—";

  // Parse certStatus label
  const getCertStatusLabel = (info: CertInfo | null) => {
    const s = info?.certStatus || info?.CertStatus || "";
    if (!s) return "—";
    if (s.toLowerCase() === "valid") return "Đang hoạt động";
    if (s.toLowerCase() === "revoked") return "Đã thu hồi";
    if (s.toLowerCase() === "expired") return "Đã hết hạn";
    return s;
  };

  useEffect(() => {
    getCertInfo(requestId || "")
      .then((res) => {
        const d = res.Data || res.data;
        if (d) {
          setCertInfo(d);
          setSelectedCert(d.credentialId || d.CredentialId || d.serialNumber || d.SerialNumber || null);
        }
      })
      .catch((err) => console.warn("Initial cert load err:", err));
  }, []);

  const handleDetailPress = async () => {
    try {
      setShowDetail(true);
      setIsLoading(true);
      const res = await getCertInfo(requestId || "");
      const d = res.Data || res.data;
      if (d) {
        setCertInfo(d);
        setSelectedCert(d.credentialId || d.CredentialId || d.serialNumber || d.SerialNumber || null);
      }
    } catch (err) {
      console.warn("Lỗi lấy thông tin chứng thư:", err);
      Alert.alert("Lỗi", "Không thể lấy thông tin chứng thư số.");
    } finally {
      setIsLoading(false);
    }
  };

  // Derived values for card
  const serialNo = certInfo?.serialNumber || certInfo?.SerialNumber || "—";
  const credId = certInfo?.credentialId || certInfo?.CredentialId || "—";
  const issuerDN = certInfo?.issuerDN || certInfo?.IssuerDN || "—";
  const expireDate = formatDate(certInfo?.validTo || certInfo?.ValidTo);
  const startDate = formatDate(certInfo?.validFrom || certInfo?.ValidFrom);
  const subjectDN = certInfo?.subjectDN || certInfo?.SubjectDN || "—";
  const subscriberId = certInfo?.subscriberId || certInfo?.SubscriberId || "—";
  const phoneNumber = certInfo?.phoneNumber || certInfo?.PhoneNumber || "—";
  const subjectName = getSubjectName(certInfo);
  const statusLabel = getCertStatusLabel(certInfo);

  // Parse gói CTS (từ subscriberId: CA_MS_xxx → lấy phần sau CA_)
  const certPackage = (() => {
    const sid = subscriberId;
    if (!sid || sid === "—") return "—";
    // ví dụ: CA_MS_6278278763097878 → MS_CN_APP hay lấy từ subscriberId prefix
    const match = sid.match(/^CA_([A-Z_]+)/);
    return match ? match[1] + "_APP" : sid;
  })();

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
          <MaterialCommunityIcons name="security" size={20} color="#FFB300" />
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
          onPress={() => setSelectedCert(credId !== "—" ? credId : serialNo)}
        >
          <View style={styles.certTop}>
            <View style={styles.certIconBg}>
              <MaterialCommunityIcons name="certificate" size={24} color="#2092EC" />
            </View>
            <View style={styles.certMainInfo}>
              <Text style={styles.certName} numberOfLines={1}>{subjectName}</Text>
              <Text style={styles.certIssuer} numberOfLines={1}>Nhà cung cấp: {issuerDN}</Text>
            </View>
            <View style={styles.radioOutline}>
              {selectedCert && selectedCert !== "—" && <View style={styles.radioInner} />}
            </View>
          </View>

          <View style={styles.certDivider} />

          <View style={styles.certTags}>
            <View style={styles.tag}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#666" />
              <Text style={styles.tagText}>Hạn: {expireDate}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: "#E8F5E9" }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={12} color="#4CAF50" />
              <Text style={[styles.tagText, { color: "#4CAF50", fontWeight: "700" }]}>{statusLabel}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.detailBtn}
            onPress={handleDetailPress}
          >
            <Text style={styles.detailBtnText}>Xem chi tiết</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#2092EC" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={styles.footer}>
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
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết chứng thư số</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View style={{ paddingVertical: 60, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#2092EC" />
                  <Text style={{ marginTop: 12, color: "#666", fontSize: 14 }}>Đang tải chi tiết...</Text>
                </View>
              ) : (
                <View style={detailStyles.card}>
                  {/* Chủ thể */}
                  <CopyRow label="Chủ thể" value={subjectName} />
                  <View style={detailStyles.divider} />

                  {/* Mã chứng thư số */}
                  <CopyRow label="Mã chứng thư số" value={credId} canCopy />
                  <View style={detailStyles.divider} />

                  {/* Số thuê bao */}
                  <CopyRow label="Số thuê bao" value={subscriberId} canCopy />
                  <View style={detailStyles.divider} />

                  {/* Số serial */}
                  <CopyRow label="Số serial" value={serialNo} canCopy />
                  <View style={detailStyles.divider} />

                  {/* Tổ chức phát hành */}
                  <CopyRow label="Tổ chức phát hành" value={issuerDN} />
                  <View style={detailStyles.divider} />

                  {/* Thông tin thuê bao */}
                  <CopyRow label="Thông tin thuê bao" value={subjectDN} />
                  <View style={detailStyles.divider} />

                  {/* Trạng thái */}
                  <StatusBadge status={statusLabel} />
                  <View style={detailStyles.divider} />

                  {/* Ngày bắt đầu - Ngày kết thúc */}
                  <CopyRow
                    label="Ngày bắt đầu - Ngày kết thúc"
                    value={`${startDate} - ${expireDate}`}
                  />
                  <View style={detailStyles.divider} />

                  {/* Gói chứng thư số */}
                  <CopyRow label="Gói chứng thư số" value={certPackage} />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ─── Detail Modal Styles ────────────────────────────────────── */
const detailStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 13, color: "#8E9BAA", fontWeight: "500", marginBottom: 4 },
  rowValue: { fontSize: 14, color: "#0F172A", fontWeight: "600", lineHeight: 20 },
  copyBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 0 },
  statusActive: { color: "#1B8B2E", fontWeight: "700" },
  statusInactive: { color: "#D32F2F", fontWeight: "700" },
});

/* ─── Main Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
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
    backgroundColor: "#FFF8E1",
    padding: 14,
    borderRadius: 14,
    gap: 10,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#FFB300",
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
    backgroundColor: "#E41E26",
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "82%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: { padding: 16, paddingBottom: 32 },
});
