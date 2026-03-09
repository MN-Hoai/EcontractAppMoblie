import {
  approveHandOver,
  CertInfo,
  getCertInfo,
  importCertificate,
  viewOrder,
} from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ─── Info row component ────────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons name={icon as any} size={16} color="#2092EC" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function SignValScreen() {
  const router = useRouter();
  const { requestId } = useAuthStore();
  const [showCertModal, setShowCertModal] = useState(false);
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // --- Bước 1: Gọi nghiệm thu ---
        let approveRes;
        try {
          approveRes = await approveHandOver(requestId || "");
          console.log("Approve Handover:", approveRes);

          const isSuccessObj = approveRes && (approveRes.Success === true || approveRes.success === true);
          const dataStatus = approveRes?.Data?.Status || approveRes?.data?.status;

          if (!isSuccessObj || (dataStatus && dataStatus !== "SUCCESS")) {
            if (isMounted) {
              const friendlyMsg = (approveRes?.Message || approveRes?.message || "Xác nhận nghiệm thu thất bại.")
                .replace("Lỗi hệ thống: ", "").replace("Lỗi nội bộ: ", "");
              Alert.alert("Thông báo", friendlyMsg, [{ text: "Đóng", style: "cancel" }]);
            }
            return;
          }
        } catch (err: any) {
          console.log("Lỗi gọi API approve-handover:", err);
          if (isMounted) Alert.alert("Thông báo", "Đã có sự cố ngoài ý muốn xảy ra.", [{ text: "Đóng", style: "cancel" }]);
          return;
        }

        // --- Bước 2: Gọi viewOrder ---
        let viewRes;
        try {
          viewRes = await viewOrder(requestId || "");
          console.log("View Order:", viewRes);
          if (!viewRes || viewRes.Success === false || viewRes.success === false) {
            if (isMounted) {
              const friendlyMsg = (viewRes?.Message || viewRes?.message || "Không thể tải thông tin đơn hàng.")
                .replace("Lỗi hệ thống: ", "").replace("Lỗi nội bộ: ", "");
              Alert.alert("Thông báo", friendlyMsg, [{ text: "Đóng", style: "cancel" }]);
            }
            return;
          }
        } catch (err: any) {
          console.log("Lỗi gọi API view-order:", err);
          if (isMounted) Alert.alert("Thông báo", "Đã có sự cố ngoài ý muốn xảy ra.", [{ text: "Đóng", style: "cancel" }]);
          return;
        }

        // --- Bước 3: Import certificate ---
        let importRes;
        try {
          importRes = await importCertificate(requestId || "");
          console.log("Import Certificate:", importRes);
          if (!importRes || importRes.Success === false || importRes.success === false) {
            if (isMounted) {
              const friendlyMsg = (importRes?.Message || importRes?.message || "Import chứng thư số thất bại.")
                .replace("Lỗi hệ thống: ", "").replace("Lỗi nội bộ: ", "");
              Alert.alert("Thông báo", friendlyMsg, [{ text: "Đóng", style: "cancel" }]);
            }
            return;
          }
        } catch (err: any) {
          console.log("Lỗi gọi API import-cert:", err);
          if (isMounted) Alert.alert("Thông báo", "Đã có sự cố ngoài ý muốn xảy ra.", [{ text: "Đóng", style: "cancel" }]);
          return;
        }

        // --- Bước 4: Lấy thông tin chứng thư ---
        try {
          const certRes = await getCertInfo(requestId || "");
          if (!certRes || certRes.Success === false || certRes.success === false) {
            if (isMounted) {
              const friendlyMsg = (certRes?.Message || certRes?.message || "Cập nhật thông tin chứng thư thất bại.")
                .replace("Lỗi hệ thống: ", "").replace("Lỗi nội bộ: ", "");
              Alert.alert("Thông báo", friendlyMsg, [{ text: "Đóng", style: "cancel" }]);
            }
            return;
          }

          const certData = certRes.Data || certRes.data;
          if (isMounted && certData) {
            setCertInfo(certData);
          }
        } catch (err: any) {
          console.log("Lỗi gọi API cert-info:", err);
          if (isMounted) Alert.alert("Thông báo", "Đã có sự cố ngoài ý muốn xảy ra.", [{ text: "Đóng", style: "cancel" }]);
          return;
        }

      } catch (err: any) {
        console.log("Lỗi không xác định:", err);
        if (isMounted) Alert.alert("Thông báo", "Đã có sự cố ngoài ý muốn xảy ra.", [{ text: "Đóng", style: "cancel" }]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [requestId]);

  const handleConfirm = () => {
    router.push("/(certificate)/choose-certificate2");
  };

  // Helpers string -> dd/MM/yyyy
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  const getSubjectName = () => (certInfo?.subjectDN || certInfo?.SubjectDN)?.match(/CN=([^,]+)/)?.[1] || "—";
  const getSubjectUID = () => (certInfo?.subjectDN || certInfo?.SubjectDN)?.match(/UID=CCCD:([^,]+)/)?.[1]
    || (certInfo?.subjectDN || certInfo?.SubjectDN)?.match(/UID=([^,]+)/)?.[1] || "—";

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
          <Text style={styles.headerTitle}>Nghiệm thu</Text>
          <Text style={styles.headerSub}>Đăng ký Chứng thư số</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={{ marginTop: 12, color: "#666", fontWeight: "500" }}>Đang tải thông tin chứng thư số...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Banner ── */}
            <View style={styles.banner}>
              <MaterialCommunityIcons
                name="certificate-outline"
                size={22}
                color="#FFB300"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Xác nhận chứng thư</Text>
                <Text style={styles.bannerSub}>
                  Vui lòng kiểm tra kỹ thông tin chứng thư số đã được cấp
                </Text>
              </View>
            </View>

            {/* ── Info Card ── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <MaterialCommunityIcons
                    name="shield-account-outline"
                    size={15}
                    color="#1565C0"
                  />
                  <Text style={styles.cardHeaderText}>THÔNG TIN CHỨNG THƯ SỐ</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={13} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Đã cấp</Text>
                </View>
              </View>
              <InfoRow
                icon="shield-key-outline"
                label="Mã chứng thư"
                value={certInfo?.credentialId || certInfo?.CredentialId || "—"}
              />
              <InfoRow
                icon="barcode"
                label="Số Serial"
                value={certInfo?.serialNumber || certInfo?.SerialNumber || "—"}
              />
              <View style={styles.rowDivider} />
              <InfoRow
                icon="office-building-outline"
                label="Tổ chức phát hành"
                value={certInfo?.issuerDN || certInfo?.IssuerDN || "—"}
              />
              <View style={styles.rowDivider} />
              <InfoRow
                icon="card-account-details-outline"
                label="Thông tin thuê bao"
                value={certInfo?.subjectDN || certInfo?.SubjectDN || "—"}
              />
              <View style={styles.rowDivider} />
              <InfoRow
                icon="calendar-check-outline"
                label="Ngày bắt đầu"
                value={formatDateTime(certInfo?.validFrom || certInfo?.ValidFrom)}
              />
              <View style={styles.rowDivider} />
              <InfoRow
                icon="calendar-alert-outline"
                label="Ngày kết thúc"
                value={formatDateTime(certInfo?.validTo || certInfo?.ValidTo)}
              />
            </View>

            {/* ── Document Link ── */}
            <TouchableOpacity
              style={styles.contractRow}
              onPress={() => setShowCertModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.contractRowIcon}>
                <MaterialCommunityIcons
                  name="file-sign"
                  size={20}
                  color="#1565C0"
                />
              </View>
              <View style={styles.contractRowContent}>
                <Text style={styles.contractRowLabel}>Biên bản nghiệm thu</Text>
                <Text style={styles.contractRowDesc}>Xem chi tiết nội dung biên bản</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#BBBEC7" />
            </TouchableOpacity>
          </ScrollView>

          {/* ── Bottom bar ── */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-all" size={18} color="#FFF" />
                  <Text style={styles.submitBtnText}>Xác nhận nghiệm thu</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Certificate Modal ── */}
      <Modal
        visible={showCertModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Biên bản nghiệm thu</Text>
              <TouchableOpacity
                onPress={() => setShowCertModal(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialCommunityIcons name="close" size={20} color="#616161" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.certPaper}>
                <View style={styles.certTop}>
                  <Text style={styles.certViettel}>viettel-CA</Text>
                  <Text style={styles.certSub}>Số 1 Giảng Võ, Ba Đình, Hà Nội</Text>
                </View>

                <Text style={styles.certMainTitle}>
                  BIÊN BẢN BÀN GIAO{"\n"}CHỨNG THƯ SỐ
                </Text>

                <View style={styles.certContent}>
                  <Text style={styles.certText}>
                    Căn cứ vào hợp đồng đã ký ngày 16.10.2024, Viettel bàn giao chứng thư số cho:
                  </Text>

                  <View style={styles.certInfoRow}>
                    <Text style={styles.certLabel}>Khách hàng:</Text>
                    <Text style={styles.certValue}>{getSubjectName()}</Text>
                  </View>
                  <View style={styles.certInfoRow}>
                    <Text style={styles.certLabel}>Số CCCD:</Text>
                    <Text style={styles.certValue}>{getSubjectUID()}</Text>
                  </View>
                  <View style={styles.certInfoRow}>
                    <Text style={styles.certLabel}>SĐT:</Text>
                    <Text style={styles.certValue}>{certInfo?.phoneNumber || certInfo?.PhoneNumber || "—"}</Text>
                  </View>

                  <View style={styles.certDivider} />

                  <Text style={styles.certSectionTitle}>THÔNG TIN CHỨNG THƯ SỐ</Text>

                  <View style={styles.certDetailBox}>
                    <DetailItem label="Mã chứng thư" value={certInfo?.credentialId || certInfo?.CredentialId || "—"} />
                    <DetailItem label="Serial" value={certInfo?.serialNumber || certInfo?.SerialNumber || "—"} />
                    <DetailItem label="Issuer" value={certInfo?.issuerDN || certInfo?.IssuerDN || "—"} />
                    <DetailItem label="Thời hạn" value={`${formatDateTime(certInfo?.validFrom || certInfo?.ValidFrom)} - ${formatDateTime(certInfo?.validTo || certInfo?.ValidTo)}`} />
                  </View>

                  <Text style={[styles.certText, { marginTop: 16 }]}>
                    Bên A xác nhận đã nhận bàn giao hoàn toàn đầy đủ và chính xác theo yêu cầu.
                  </Text>

                  <View style={styles.certSignArea}>
                    <View style={styles.certSignBox}>
                      <Text style={styles.certSignLabel}>ĐẠI DIỆN BÊN A</Text>
                      <View style={styles.certSignSpace} />
                      <Text style={styles.certSignName}>{getSubjectName()}</Text>
                    </View>
                    <View style={styles.certSignBox}>
                      <Text style={styles.certSignLabel}>ĐẠI DIỆN BÊN B</Text>
                      <View style={styles.certSignSpace} />
                      <Text style={styles.certSignName}>VIETTEL-CA</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 11, color: "#888", fontWeight: "600" }}>{label}</Text>
      <Text style={{ fontSize: 12, color: "#333", fontWeight: "500", marginTop: 2 }}>{value}</Text>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 15,
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

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  /* Banner */
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFF8E1",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#FFB300",
  },
  bannerTitle: { fontSize: 13, fontWeight: "700", color: "#FFB300" },
  bannerSub: { fontSize: 12, color: "#FFB300", marginTop: 2, lineHeight: 18 },

  /* Card */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
    backgroundColor: "#F8FAFF",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1565C0",
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: { fontSize: 11, color: "#4CAF50", fontWeight: "700" },

  /* Info row */
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed to flex-start for long multi-line text
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#8E9AA0", fontWeight: "600", marginBottom: 3 },
  infoValue: {
    fontSize: 13,
    color: "#1A1C1E",
    fontWeight: "600",
    lineHeight: 20,
    flexShrink: 1, // Ensure it doesn't push the icon
  },

  rowDivider: { height: 1, backgroundColor: "#F2F4F7", marginLeft: 64 },

  /* Contract row */
  contractRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contractRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  contractRowContent: { flex: 1 },
  contractRowLabel: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  contractRowDesc: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },

  /* Warning Box */
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFF8E1",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#FFB300",
  },
  warningText: { flex: 1, fontSize: 13, color: "#7A5F00", lineHeight: 20 },

  /* Bottom Actions */
  bottomBar: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1565C0",
    borderRadius: 16,
    paddingVertical: 16,
  },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "85%",
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
    borderBottomColor: "#F0F2F5",
  },
  modalHeaderTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: { flex: 1 },
  certPaper: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 24,
    paddingTop: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  certTop: { alignItems: "center", marginBottom: 28 },
  certViettel: {
    fontSize: 26,
    fontWeight: "900",
    color: "#E41E26",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  certSub: { fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: "500" },
  certMainTitle: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    color: "#0F172A",
    lineHeight: 26,
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  certContent: { flex: 1 },
  certText: { fontSize: 14, color: "#334155", lineHeight: 22 },
  certInfoRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
    alignItems: "flex-start",
  },
  certLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    width: 90,
  },
  certValue: { fontSize: 14, color: "#0F172A", flex: 1, fontWeight: "500" },
  certDivider: { height: 1.5, backgroundColor: "#F1F5F9", marginVertical: 24 },
  certSectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1565C0",
    marginBottom: 16,
    letterSpacing: 1,
  },
  certDetailBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  certSignArea: {
    flexDirection: "row",
    marginTop: 40,
    gap: 16,
    justifyContent: "space-between",
  },
  certSignBox: { flex: 1, alignItems: "center" },
  certSignLabel: { fontSize: 11, fontWeight: "800", color: "#64748B", letterSpacing: 0.5 },
  certSignSpace: { height: 70 },
  certSignName: { fontSize: 13, fontWeight: "700", color: "#0F172A", textAlign: "center" },
  modalBottomBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 18,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  modalBottomBtnText: { color: "#1565C0", fontWeight: "700", fontSize: 16 },
});