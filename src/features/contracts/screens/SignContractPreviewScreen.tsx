import {
  FdfData,
  fetchFdfByUrl,
  getFullUrl,
  parseFdfData
} from "@/services/contractService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


/* ─── Field Row Component ───────────────────────────────────── */
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function SignContractPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [fdfData, setFdfData] = useState<FdfData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCertSetupModal, setShowCertSetupModal] = useState(false);

  const contractId = params.contractId as string;
  const contractName = params.contractName as string;
  const fdfPath = params.fdfPath as string;
  const filePath = params.filePath as string;


  // Fetch FDF data if path is provided
  useEffect(() => {
    const loadFdfData = async () => {
      if (!fdfPath) {
        setFdfData({});
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fullFdfUrl = getFullUrl(fdfPath);
        const fdfContent = await fetchFdfByUrl(fullFdfUrl);
        const parsedData = parseFdfData(fdfContent);
        setFdfData(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contract data");
      } finally {
        setLoading(false);
      }
    };
    loadFdfData();
  }, [fdfPath]);

  const handleContinueSign = () => {
    setShowCertSetupModal(true);
  };

  const handleImportCert = () => {
    setShowCertSetupModal(false);
    router.push({
      pathname: "/sign",
      params: {
        contractId,
        contractName,
        filePath: getFullUrl(filePath),
        fdfData: JSON.stringify(fdfData),
      },
    });
  };

  const handleRegisterCert = () => {
    setShowCertSetupModal(false);
    router.push({
      pathname: "/sign-contract",
      params: {
        contractId,
        contractName,
        filePath: getFullUrl(filePath),
        fdfData: JSON.stringify(fdfData),
      },
    });
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
          <Text style={styles.headerTitle}>Chi tiết ký</Text>
          <Text style={styles.headerSub}>Kiểm tra thông tin trước khi ký</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Contract Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="file-document-edit-outline" size={18} color="#1565C0" />
            <Text style={styles.cardHeaderText}>THÔNG TIN HỢP ĐỒNG</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.contractName}>{contractName}</Text>
            <View style={styles.fileLink}>
              <MaterialCommunityIcons name="file-pdf-box" size={20} color="#E53935" />
              <Text style={styles.filePath} numberOfLines={1}>{filePath}</Text>
            </View>
          </View>
        </View>

        {/* ── FDF Data Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{fdfPath ? "DỮ LIỆU BIỂU MẪU" : "KHÔNG CÓ DỮ LIỆU"}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2092EC" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#E53935" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : Object.keys(fdfData).length > 0 ? (
          <View style={styles.fieldsContainer}>
            {Object.entries(fdfData).map(([key, value], index) => (
              <FieldRow key={key + index} label={key} value={String(value)} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="file-search-outline" size={40} color="#BBB" />
            <Text style={styles.emptyText}>Hợp đồng không có dữ liệu biểu mẫu</Text>
          </View>
        )}

        {/* ── Notice ── */}
        <View style={styles.noticeBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#1565C0" />
          <Text style={styles.noticeText}>
            Vui lòng kiểm tra lại thông tin trên. Quý khách sẽ cần xác nhận bằng OTP để hoàn tất quá trình ký.
          </Text>
        </View>
      </ScrollView>

      {/* ── Footer Actions ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewPdfBtn}
          onPress={() => router.push({
            pathname: "/sign-contract-view",
            params: { contractId, contractName, filePath: getFullUrl(filePath), fdfPath: getFullUrl(fdfPath) },
          })}
        >
          <MaterialCommunityIcons name="eye-outline" size={18} color="#2092EC" />
          <Text style={styles.viewPdfBtnText}>Xem PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinueSign}>
          <Text style={styles.continueBtnText}>Tiếp tục ký</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── Certificate Setup Modal ── */}
      <Modal visible={showCertSetupModal} transparent animationType="fade" onRequestClose={() => setShowCertSetupModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.modalCloseIconBtn} onPress={() => setShowCertSetupModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#999" />
            </TouchableOpacity>
            <LinearGradient
              colors={["#1565C0", "#2092EC"]}
              style={styles.modalIconCircle}
            >
              <MaterialCommunityIcons name="certificate-outline" size={32} color="#FFF" />
            </LinearGradient>
            <Text style={styles.modalTitle}>Thiết lập Chứng thư số</Text>
            <Text style={styles.modalMsg}>
              Yêu cầu thiết lập Chứng thư số trước khi ký. Vui lòng chọn phương thức:
            </Text>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleImportCert}>
              <MaterialCommunityIcons name="import" size={20} color="#FFF" />
              <Text style={styles.modalPrimaryBtnText}>Nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={handleRegisterCert}>
              <MaterialCommunityIcons name="account-plus-outline" size={20} color="#1565C0" />
              <Text style={styles.modalSecondaryBtnText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 45,
    flex: 1, backgroundColor: "#F0F4F8" },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 56, paddingBottom: 18, paddingHorizontal: 16, gap: 12,
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

  /* Card */
  card: {
    backgroundColor: "#FFF", borderRadius: 18, marginBottom: 20,
    overflow: "hidden", shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05,
    shadowRadius: 10, elevation: 2,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#F8FAFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  cardHeaderText: { fontSize: 11, fontWeight: "700", color: "#1565C0", letterSpacing: 0.5 },
  cardBody: { padding: 16 },
  contractName: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 10 },
  fileLink: { flexDirection: "row", alignItems: "center", gap: 8 },
  filePath: { fontSize: 12, color: "#666", flex: 1 },

  sectionHeader: { marginBottom: 12, paddingLeft: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#666", letterSpacing: 1 },

  /* FDF Fields */
  fieldsContainer: { backgroundColor: "#FFF", borderRadius: 18, overflow: "hidden", marginBottom: 20 },
  fieldRow: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  fieldLabel: { fontSize: 11, color: "#9E9E9E", fontWeight: "600", marginBottom: 4 },
  fieldValue: { fontSize: 14, color: "#1A1A1A", fontWeight: "600" },

  loadingBox: { paddingVertical: 40, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 13, color: "#666" },

  errorBox: {
    backgroundColor: "#FFEBEE", padding: 16, borderRadius: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: "#C62828" },

  emptyBox: {
    paddingVertical: 40, alignItems: "center", backgroundColor: "#FFF", borderRadius: 18,
  },
  emptyText: { marginTop: 12, fontSize: 13, color: "#999" },

  noticeBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#EAF2FE", borderRadius: 14, padding: 14,
    borderLeftWidth: 3, borderLeftColor: "#2092EC",
  },
  noticeText: { flex: 1, fontSize: 12, color: "#3E6B9A", lineHeight: 18 },

  /* Footer */
  footer: {
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#EEF0F4",
    flexDirection: "row", gap: 12,
  },
  viewPdfBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, borderWidth: 1.5, borderColor: "#2092EC", paddingVertical: 14,
  },
  viewPdfBtnText: { color: "#2092EC", fontWeight: "700", fontSize: 15 },
  continueBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#1565C0", borderRadius: 14, paddingVertical: 14,
  },
  continueBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  /* Modal */
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 28,
  },
  modalBox: {
    backgroundColor: "#FFF", borderRadius: 24,
    paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24,
    alignItems: "center", width: "100%", position: "relative",
  },
  modalCloseIconBtn: {
    position: "absolute", top: 16, right: 16, padding: 4,
  },
  modalIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A", marginBottom: 10, textAlign: "center" },
  modalMsg: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 20, marginBottom: 24 },

  modalPrimaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#1565C0", borderRadius: 14,
    paddingVertical: 14, width: "100%", marginBottom: 12,
  },
  modalPrimaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  modalSecondaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#F0F7FF", borderRadius: 14, borderWidth: 1.5, borderColor: "#1565C0",
    paddingVertical: 14, width: "100%",
  },
  modalSecondaryBtnText: { color: "#1565C0", fontWeight: "700", fontSize: 15 },
});
