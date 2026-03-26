import { CertInfo, getCertificateDetail, getCertInfo } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ─── Copy Row Component ────────────────────────────────────── */
function InfoRow({ label, value, canCopy = false }: { label: string; value: string; canCopy?: boolean }) {
  const handleCopy = () => {
    Clipboard.setString(value);
    Alert.alert("Đã sao chép", `${label} đã được sao chép vào clipboard.`);
  };

  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {canCopy && value !== "—" && (
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="content-copy" size={18} color="#2092EC" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CertificateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const certIdFromParams = params.id ? Number(params.id) : null;
  
  const { requestId } = useAuthStore();
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("vi-VN");
  };

  const getCertStatusLabel = (info: CertInfo | null) => {
    const s = info?.certStatus || info?.CertStatus || "";
    if (!s) return "—";
    if (s.toLowerCase() === "valid") return "Đang hoạt động";
    if (s.toLowerCase() === "revoked") return "Đã thu hồi";
    if (s.toLowerCase() === "expired") return "Đã hết hạn";
    return s;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        let res;
        
        // Nếu có ID cụ thể, dùng getCertificateDetail
        if (certIdFromParams) {
          console.log("[Detail Debug] - Fetching specific cert by ID:", certIdFromParams);
          res = await getCertificateDetail(requestId || "", certIdFromParams);
        } else {
          // Fallback dùng getCertInfo nếu không có ID
          console.log("[Detail Debug] - Fallback to getCertInfo (no ID)");
          res = await getCertInfo(requestId || "");
        }

        const rawData = res.Data || res.data;
        // Nếu API trả về mảng, lấy phần tử đầu tiên
        const d = Array.isArray(rawData) ? rawData[0] : rawData;
        if (d) setCertInfo(d);
      } catch (err) {
        console.log("Error loading cert detail:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [requestId, certIdFromParams]);

  const subjectName = (certInfo?.subjectDN || certInfo?.SubjectDN)?.match(/CN=([^,]+)/)?.[1] || "—";
  const statusLabel = getCertStatusLabel(certInfo);
  const isValid = statusLabel === "Đang hoạt động";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1565C0", "#2092EC"]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chi tiết chứng thư số</Text>
          <Text style={styles.headerSub}>Thông tin xác thực của bạn</Text>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#2092EC" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.statusSection}>
              <View style={[styles.statusBadge, { backgroundColor: isValid ? "#E8F5E9" : "#FFEBEE" }]}>
                <MaterialCommunityIcons
                  name={isValid ? "check-circle" : "alert-circle"}
                  size={20}
                  color={isValid ? "#4CAF50" : "#F44336"}
                />
                <Text style={[styles.statusText, { color: isValid ? "#4CAF50" : "#F44336" }]}>{statusLabel}</Text>
              </View>
            </View>

            <InfoRow label="Chủ thể" value={subjectName} />
            <View style={styles.divider} />

            <InfoRow label="Số chứng thư" value={certInfo?.credentialId || certInfo?.CredentialId || "—"} canCopy />
            <View style={styles.divider} />

            <InfoRow label="Số Serial" value={certInfo?.serialNumber || certInfo?.SerialNumber || "—"} canCopy />
            <View style={styles.divider} />

            <InfoRow label="Số thuê bao" value={certInfo?.subscriberId || certInfo?.SubscriberId || "—"} canCopy />
            <View style={styles.divider} />

            <InfoRow label="Tổ chức phát hành" value={certInfo?.issuerDN || certInfo?.IssuerDN || "—"} />
            <View style={styles.divider} />

            <InfoRow label="Thông tin đầy đủ" value={certInfo?.subjectDN || certInfo?.SubjectDN || "—"} />
            <View style={styles.divider} />

            <InfoRow
              label="Thời hạn"
              value={`${formatDate(certInfo?.validFrom || certInfo?.ValidFrom)} - ${formatDate(certInfo?.validTo || certInfo?.ValidTo)}`}
            />
          </View>

          <View style={styles.safetyNotice}>
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#2092EC" />
            <Text style={styles.safetyText}>
              Chứng thư số của bạn được bảo mật và quản lý bởi Viettel-MySign. Đảm bảo an toàn tuyệt đối cho mọi giao dịch ký số.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 45,
    flex: 1, backgroundColor: "#F8FAFC" },
  header: {
     flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 15,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666" },

  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statusSection: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: { fontWeight: "700", fontSize: 14 },

  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12, color: "#64748B", marginBottom: 4, fontWeight: "500" },
  rowValue: { fontSize: 14, color: "#1E293B", fontWeight: "600", lineHeight: 20 },
  copyBtn: { padding: 8 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 16 },

  safetyNotice: {
    flexDirection: "row",
    marginTop: 24,
    backgroundColor: "#BFDBFE",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: "center",
  },
  safetyText: { flex: 1, fontSize: 12, color: "#2092EC", lineHeight: 18 },
});
