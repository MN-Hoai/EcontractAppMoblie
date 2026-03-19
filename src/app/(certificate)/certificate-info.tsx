import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useAuthStore } from "@/store/authStore";
import { getCertInfo, CertInfo } from "@/services/contractService";

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

/* ─── Question Card Component ───────────────────────────────── */
function QuestionCard({
  title,
  answer,
  icon,
}: {
  title: string;
  answer: string;
  icon: string;
}) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon as any} size={20} color="#2092EC" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardAnswer}>{answer}</Text>
    </View>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function CertificateInfoScreen() {
  const router = useRouter();
  const { requestId } = useAuthStore();
  
  const [showPopup, setShowPopup] = useState(false);
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    (info?.subjectDN || info?.SubjectDN || "")?.match(/CN=([^,]+)/)?.[1] || (info?.subjectDN || info?.SubjectDN || "—");

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
    setIsLoading(true);
    getCertInfo(requestId || "")
      .then((res) => {
        const d = res.Data || res.data;
        if (d) {
          setCertInfo(d);
          setShowPopup(false);
        } else {
          setShowPopup(true);
        }
      })
      .catch((err) => {
        console.warn("cert load err:", err);
        setShowPopup(true);
      })
      .finally(() => setIsLoading(false));
  }, [requestId]);

  const handleContinue = () => {
    router.push("/choose-certificate");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2092EC" />
        <Text style={{ marginTop: 12, color: "#666" }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Derived values for details
  const serialNo = certInfo?.serialNumber || certInfo?.SerialNumber || "—";
  const credId = certInfo?.credentialId || certInfo?.CredentialId || "—";
  const issuerDN = certInfo?.issuerDN || certInfo?.IssuerDN || "—";
  const expireDate = formatDate(certInfo?.validTo || certInfo?.ValidTo);
  const startDate = formatDate(certInfo?.validFrom || certInfo?.ValidFrom);
  const subjectDN = certInfo?.subjectDN || certInfo?.SubjectDN || "—";
  const subscriberId = certInfo?.subscriberId || certInfo?.SubscriberId || "—";
  const subjectName = getSubjectName(certInfo);
  const statusLabel = getCertStatusLabel(certInfo);
  const certPackage = (() => {
    const sid = subscriberId;
    if (!sid || sid === "—") return "—";
    const match = sid.match(/^CA_([A-Z_]+)/);
    return match ? match[1] + "_APP" : sid;
  })();

  return (
    <View style={styles.container}>
      {/* ── Popup Modal (Only show if NO certInfo) ── */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => router.back()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#FF9800" />
            </View>
            <Text style={styles.modalTitle}>Bạn chưa có chứng thư số</Text>
            <Text style={styles.modalMessage}>
              Vui lòng đăng ký chứng thư số để có thể tiếp tục thao tác ký điện tử.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => router.back()}
              >
                <Text style={styles.modalBtnCancelText}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => {
                   setShowPopup(false); 
                   router.push("/identity-verification" as any);
                }}
              >
                <Text style={styles.modalBtnConfirmText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          <Text style={styles.headerTitle}>{certInfo ? "Chi tiết chứng thư số" : "Chứng thư số"}</Text>
          <Text style={styles.headerSub}>{certInfo ? "Thông tin định danh điện tử" : "Kiến thức cơ bản về chữ ký số"}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {certInfo ? (
          /* ── Case: Has Certificate Details (Dống trag choose-certificate2 Modal) ── */
          <View style={detailStyles.card}>
            <CopyRow label="Chủ thể" value={subjectName} />
            <View style={detailStyles.divider} />

            <CopyRow label="Mã chứng thư số" value={credId} canCopy />
            <View style={detailStyles.divider} />

            <CopyRow label="Số thuê bao" value={subscriberId} canCopy />
            <View style={detailStyles.divider} />

            <CopyRow label="Số serial" value={serialNo} canCopy />
            <View style={detailStyles.divider} />

            <CopyRow label="Tổ chức phát hành" value={issuerDN} />
            <View style={detailStyles.divider} />

            <CopyRow label="Thông tin thuê bao" value={subjectDN} />
            <View style={detailStyles.divider} />

            <StatusBadge status={statusLabel} />
            <View style={detailStyles.divider} />

            <CopyRow
              label="Ngày bắt đầu - Ngày kết thúc"
              value={`${startDate} - ${expireDate}`}
            />
            <View style={detailStyles.divider} />

            <CopyRow label="Gói chứng thư số" value={certPackage} />
          </View>
        ) : (
          /* ── Case: No Certificate (Educational View) ── */
          <>
            <View style={styles.heroSection}>
              <View style={styles.heroCircles}>
                <View style={styles.outerCircle}>
                  <View style={styles.innerCircle}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={60}
                      color="#FFF"
                    />
                  </View>
                </View>
                {/* Decors */}
                <View style={[styles.miniDot, { top: 0, right: 10, width: 12, height: 12 }]} />
                <View style={[styles.miniDot, { bottom: 15, left: -5, backgroundColor: "#4CAF50" }]} />
              </View>
              <Text style={styles.heroTitle}>Xác thực & Bảo mật</Text>
              <Text style={styles.heroDesc}>
                Chứng thư số là nền tảng cốt lõi giúp giao kết hợp đồng điện tử an toàn và có giá trị pháp lý.
              </Text>
            </View>

            <QuestionCard
              icon="help-circle-outline"
              title="Chứng thư số là gì?"
              answer="Là một loại chứng thư điện tử được cấp bởi tổ chức chứng thực (CA) nhằm định danh một cá nhân/tổ chức trên môi trường số."
            />

            <QuestionCard
              icon="signature-freehand"
              title="Chữ ký số là gì?"
              answer="Là một cặp khóa mã hóa dùng để xác nhận giao kết văn bản điện tử, có giá trị pháp lý tương đương chữ ký tay và con dấu."
            />

            <View style={styles.benefitsCard}>
              <Text style={styles.sectionTitle}>LỢI ÍCH CỦA CHỨNG THƯ SỐ</Text>

              {[
                { icon: "lock-check-outline", text: "Bảo mật thông tin tuyệt đối" },
                { icon: "gavel", text: "Đầy đủ giá trị pháp lý" },
                { icon: "account-check-outline", text: "Xác thực danh tính chính xác" },
                { icon: "clock-fast", text: "Tiết kiệm thời gian & chi phí" },
              ].map((item, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.benefitText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#FFB300" />
              <Text style={styles.warningText}>
                Sử dụng chứng thư số của các nhà cung cấp uy tín (CA) để được bảo hộ pháp lý tốt nhất.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Bottom Action ── */}
      {!certInfo && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push("/identity-verification")}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>Tiếp tục đăng ký</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  scrollView: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 24,
    paddingHorizontal: 15,
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

  /* Hero */
  heroSection: { alignItems: "center", marginBottom: 28 },
  heroCircles: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  outerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(32, 146, 236, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#2092EC",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2092EC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  miniDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2092EC",
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#1E293B", marginBottom: 8 },
  heroDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 14,
  },

  /* Question Card */
  questionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EAF4FE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  cardAnswer: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginLeft: 48,
  },

  /* Benefits */
  benefitsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1565C0",
    letterSpacing: 1,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  benefitText: { fontSize: 14, color: "#1E293B", fontWeight: "600" },
warningBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#FFF8E1", borderRadius: 14, padding: 14,
    marginBottom: 14, borderLeftWidth: 3, borderLeftColor: "#FFB300",
  },  warningText: { flex: 1, fontSize: 13, color: "#7A5F00", lineHeight: 20 },

  safetyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF2FE",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  safetyText: { flex: 1, fontSize: 12, color: "#3E6B9A", lineHeight: 18 },

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
  startBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Changed to rgba for better overlay effect
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#F1F5F9",
  },
  modalBtnCancelText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
  modalBtnConfirm: {
    backgroundColor: "#1565C0",
  },
  modalBtnConfirmText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
