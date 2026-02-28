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

/* ─── Main Screen ───────────────────────────────────────────── */
export default function SignValScreen() {
  const router = useRouter();
  const [showCertModal, setShowCertModal] = useState(false);

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

      {/* ── Progress stepper ── */}
     

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Banner ── */}
        <View style={styles.banner}>
          <MaterialCommunityIcons
            name="certificate-outline"
            size={22}
            color="#1565C0"
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
            icon="numeric"
            label="Số Serial"
            value="5404fffeb7033fb316d672201c010446"
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="office-building-outline"
            label="Tổ chức phát hành"
            value="C=VN, O=Viettel Group, CN=Viettel-CA RS"
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="account-details-outline"
            label="Thông tin thuê bao"
            value="UID=001089020747, CN=PHAM ĐỨC HUY, L=NAM ĐỊNH, C=VN"
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="calendar-clock-outline"
            label="Ngày bắt đầu"
            value="16/10/2024"
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="calendar-remove-outline"
            label="Ngày kết thúc"
            value="16/10/2025"
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

        {/* ── Info Note ── */}
        <View style={styles.noteBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color="#1565C0"
          />
          <Text style={styles.noteText}>
            Chứng thư số đã sẵn sàng để sử dụng cho các giao dịch điện tử của Quý khách.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => router.push("/(certificate)/choose-certificate2")}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="check-all" size={18} color="#FFF" />
          <Text style={styles.submitBtnText}>Xác nhận nghiệm thu</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

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
                    <Text style={styles.certValue}>PHẠM ĐỨC HUY</Text>
                  </View>
                  <View style={styles.certInfoRow}>
                    <Text style={styles.certLabel}>Số CCCD:</Text>
                    <Text style={styles.certValue}>001089020747</Text>
                  </View>
                  <View style={styles.certInfoRow}>
                    <Text style={styles.certLabel}>SĐT:</Text>
                    <Text style={styles.certValue}>0935035303</Text>
                  </View>

                  <View style={styles.certDivider} />

                  <Text style={styles.certSectionTitle}>THÔNG TIN CHỨNG THƯ SỐ</Text>

                  <View style={styles.certDetailBox}>
                    <DetailItem label="Serial" value="5404fffeb7033fb316d672201c010446" />
                    <DetailItem label="Issuer" value="Viettel-CA RS" />
                    <DetailItem label="Thời hạn" value="16.10.2024 - 16.10.2025" />
                  </View>

                  <Text style={[styles.certText, { marginTop: 16 }]}>
                    Bên A xác nhận đã nhận bàn giao hoàn toàn đầy đủ và chính xác theo yêu cầu.
                  </Text>

                  <View style={styles.certSignArea}>
                    <View style={styles.certSignBox}>
                      <Text style={styles.certSignLabel}>ĐẠI DIỆN BÊN A</Text>
                      <View style={styles.certSignSpace} />
                      <Text style={styles.certSignName}>PHẠM ĐỨC HUY</Text>
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

            <TouchableOpacity
              style={styles.modalBottomBtn}
              onPress={() => setShowCertModal(false)}
            >
              <Text style={styles.modalBottomBtnText}>Đóng</Text>
            </TouchableOpacity>
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

  /* Stepper */
  stepper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  },
  stepItem: { alignItems: "center", flex: 1, position: "relative" },
  stepLine: {
    position: "absolute",
    top: 14,
    right: "50%",
    width: "100%",
    height: 2,
    backgroundColor: "#E0E0E0",
    zIndex: 0,
  },
  stepLineDone: { backgroundColor: "#4CAF50" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8EDF2",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  stepCircleActive: { backgroundColor: "#2092EC" },
  stepCircleDone: { backgroundColor: "#4CAF50" },
  stepNum: { fontSize: 12, fontWeight: "700", color: "#9E9E9E" },
  stepLabel: {
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 5,
    fontWeight: "500",
  },
  stepLabelActive: { color: "#2092EC", fontWeight: "700" },

  scrollContent: { padding: 16, paddingBottom: 24 },

  /* Banner */
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EAF2FE",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#2092EC",
  },
  bannerTitle: { fontSize: 13, fontWeight: "700", color: "#1565C0" },
  bannerSub: { fontSize: 12, color: "#3E6B9A", marginTop: 2, lineHeight: 18 },

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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EAF2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#9E9E9E", fontWeight: "600", marginBottom: 3 },
  infoValue: { fontSize: 13, color: "#111", fontWeight: "600", lineHeight: 18 },

  rowDivider: { height: 1, backgroundColor: "#F2F4F7", marginLeft: 62 },

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

  /* Note Box */
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EAF2FE",
    borderRadius: 12,
    padding: 12,
  },
  noteText: { flex: 1, fontSize: 12, color: "#3E6B9A", lineHeight: 18 },

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
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  certTop: { alignItems: "center", marginBottom: 24 },
  certViettel: { fontSize: 24, fontWeight: "800", color: "#E41E26", letterSpacing: 0.5 },
  certSub: { fontSize: 11, color: "#888", marginTop: 4 },
  certMainTitle: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    color: "#000",
    lineHeight: 22,
    marginBottom: 24,
  },
  certContent: { flex: 1 },
  certText: { fontSize: 13, color: "#444", lineHeight: 20 },
  certInfoRow: { flexDirection: "row", marginTop: 8, gap: 8 },
  certLabel: { fontSize: 13, fontWeight: "700", color: "#444" },
  certValue: { fontSize: 13, color: "#111", flex: 1 },
  certDivider: { height: 1, backgroundColor: "#EEE", marginVertical: 20 },
  certSectionTitle: { fontSize: 13, fontWeight: "900", color: "#1565C0", marginBottom: 12 },
  certDetailBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  certSignArea: { flexDirection: "row", marginTop: 40, gap: 20 },
  certSignBox: { flex: 1, alignItems: "center" },
  certSignLabel: { fontSize: 11, fontWeight: "800", color: "#444" },
  certSignSpace: { height: 80 },
  certSignName: { fontSize: 12, fontWeight: "700", color: "#111" },
  modalBottomBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
  },
  modalBottomBtnText: { color: "#1565C0", fontWeight: "700", fontSize: 15 },
});