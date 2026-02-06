import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
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

export default function ChooseCertificate2Screen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
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
    subscriber: "UID=CMND:001089020747,CN=PHAM ĐỨC HUY,L=NAM ĐỊNH,C=VN",
    status: "Hoạt động",
    start: "16/10/2024",
    end: "16/10/2025",
  };

  const ViettelLogo = () => (
    <View
      style={[
        styles.logoContainer,
        { backgroundColor: isDark ? "#2D2D2D" : "#F5F5F5" },
      ]}
    >
      <View style={styles.viettelLogo}>
        <ThemedText
          style={{ color: "white", fontWeight: "bold", fontSize: 12 }}
        >
          Viettel
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
          <ThemedText type="title" style={{ fontSize: 20, flex: 1 }}>
            Chọn chứng thư số
          </ThemedText>
          <View style={{ width: 28 }} />
        </View>
        {/* Provider Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nhà cung cấp</ThemedText>

          {providers.map((provider) => (
            <View
              key={provider.id}
              style={[
                styles.providerCard,
                {
                  backgroundColor: isDark ? "#1D3D47" : "#F9F9F9",
                  borderColor: provider.selected
                    ? "#2196F3"
                    : isDark
                      ? "#38434D"
                      : "#E0E0E0",
                },
              ]}
            >
              <View style={styles.providerContent}>
                <ViettelLogo />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.providerName}>
                    {provider.displayName}
                  </ThemedText>
                </View>
              </View>
              {provider.selected && (
                <View style={styles.checkmark}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color="#2196F3"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Certificate List */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Danh sách chứng thư số
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.certRow,
              {
                borderColor: isDark ? "#38434D" : "#E0E0E0",
                backgroundColor: isDark ? "#122B31" : "#FFFFFF",
              },
            ]}
            onPress={() => setShowDetail(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={styles.certIcon} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <ThemedText style={styles.certTitle}>...446</ThemedText>
                <TouchableOpacity onPress={() => setShowDetail(true)}>
                  <ThemedText style={styles.viewDetailText}>
                    Xem chi tiết
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {selectedCert === "446" && (
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color="#2196F3"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ height: 40 }} />

        {/* Certificate Detail Modal */}
        <Modal
          visible={showDetail}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDetail(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalSheet,
                { backgroundColor: isDark ? "#071217" : "#FFFFFF" },
              ]}
            >
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  Chi tiết chứng thư số
                </ThemedText>
                <TouchableOpacity onPress={() => setShowDetail(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={isDark ? "#FFFFFF" : "#333333"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.modalRow}>
                  <ThemedText style={styles.modalLabel}>
                    Mã chứng thư số
                  </ThemedText>
                  <ThemedText style={styles.modalValue}>
                    {certDetails.code}
                  </ThemedText>
                </View>
                <View style={styles.modalRow}>
                  <ThemedText style={styles.modalLabel}>Số Serial</ThemedText>
                  <ThemedText style={styles.modalValue}>
                    {certDetails.serial}
                  </ThemedText>
                </View>
                <View style={styles.modalRow}>
                  <ThemedText style={styles.modalLabel}>
                    Tổ chức phát hành
                  </ThemedText>
                  <ThemedText style={styles.modalValue}>
                    {certDetails.issuer}
                  </ThemedText>
                </View>
                <View style={styles.modalRowFull}>
                  <ThemedText style={styles.modalLabel}>
                    Thông tin thuê bao
                  </ThemedText>
                  <ThemedText style={styles.modalValueSmall}>
                    {certDetails.subscriber}
                  </ThemedText>
                </View>
                <View style={styles.modalRow}>
                  <ThemedText style={styles.modalLabel}>Trạng thái</ThemedText>
                  <ThemedText style={styles.modalValue}>
                    {certDetails.status}
                  </ThemedText>
                </View>
                <View style={styles.modalRow}>
                  <ThemedText style={styles.modalLabel}>Ngày bắt đầu</ThemedText>
                  <ThemedText style={styles.modalValue}>
                    {certDetails.start}
                  </ThemedText>
                </View>
                <View style={styles.modalRow}>
                  <ThemedText style={styles.modalLabel}>Ngày kết thúc</ThemedText>
                  <ThemedText style={styles.modalValue}>
                    {certDetails.end}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>

      {/* Fixed footer */}
      <View style={[styles.footer, { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" }]}>
        <ThemedText style={styles.disclaimerText}>
          Bằng cách bấm chọn vào "Gửi yêu cầu ký số", tôi đã đọc hiểu và đồng ý
          với Điều kiện & điều khoản sử dụng Chứng thư số của VietinBank
        </ThemedText>

        <View style={styles.footerButtonWrap}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: "#2092EC" }]}
            onPress={() => router.push("/sign")}
          >
            <ThemedText style={styles.buttonText}>Gửi yêu cầu ký số </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
    opacity: 0.6,
    color: "#7A7A7A",
  },
  providerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  providerContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  viettelLogo: {
    backgroundColor: "#FF3D3D",
    width: "100%",
    height: "100%",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  providerName: { fontSize: 16, fontWeight: "600" },
  checkmark: { marginLeft: 12 },
  certRow: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  certIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(13,110,253,0.08)",
  },
  certTitle: { fontSize: 16, fontWeight: "700" },
  viewDetailText: { fontSize: 13, color: "#2196F3", marginTop: 4 },
  buttonContainer: { paddingBottom: 32 },
  continueButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0D6EFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalContent: { marginTop: 8 },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  modalRowFull: { paddingVertical: 8 },
  modalLabel: { color: "#7A7A7A", fontSize: 13, flex: 1 },
  modalValue: { fontSize: 13, fontWeight: "700" },
  modalValueSmall: { fontSize: 13, color: "#333", marginTop: 4 },
  disclaimerText: {
    fontSize: 12,
    color: "#666666",
    marginHorizontal: 16,
    marginBottom: 16,
    lineHeight: 18,
    textAlign: "justify"
  },
  screen: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  footerButtonWrap: {
    marginTop: 8,
  },
});
