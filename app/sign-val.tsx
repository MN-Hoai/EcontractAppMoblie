import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function SignValScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [showCertModal, setShowCertModal] = useState(false);

  return (
     <View
    style={[
      styles.container,
      { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
    ]}
  >

   <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 120 }}
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
        <ThemedText type="title" style={{ fontSize: 18 }}>
          Đăng ký Chứng thư số
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar (3 segments) */}
      <View style={styles.topProgressWrap}>
        <View style={styles.topProgressBar}>
          <View style={[styles.segment, styles.segmentDone]} />
          <View style={[styles.segment, styles.segmentDone]} />
          <View style={[styles.segment, styles.segmentActive]} />
        </View>
      </View>

      {/* Step Title */}
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepLabel}>BƯỚC 3</ThemedText>
        <ThemedText style={styles.stepTitle}>
          Nghiệm thu chứng thư số
        </ThemedText>
        <ThemedText style={styles.stepDescription}>
          Quý khách vui lòng xác nhận nghiệm thu
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Contract verification details */}
        <View style={styles.sectionHeaderSmall}>
          <ThemedText style={styles.sectionHeaderText}>
            THÔNG TIN CHỨNG THƯ SỐ
          </ThemedText>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Số Serial</ThemedText>
            <ThemedText style={styles.infoValueSmall}>
              5404fffeb7033fb316d672201c010446
            </ThemedText>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Tổ chức phát hành</ThemedText>
            <ThemedText style={styles.infoValueSmall}>
              C=VN, O=Viettel Group, CN=Viettel-CA RS
            </ThemedText>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Thông tin thuê bao</ThemedText>
            <ThemedText style={styles.infoValueSmall}>
              UID=CMND:001089020747, CN=PHAM ĐỨC HUY, L=NAM ĐỊNH, C=VN
            </ThemedText>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Ngày bắt đầu</ThemedText>
            <ThemedText style={styles.infoValue}>16/10/2024</ThemedText>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Ngày kết thúc</ThemedText>
            <ThemedText style={styles.infoValue}>16/10/2025</ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.contractRow}
          onPress={() => setShowCertModal(true)}
        >
          <ThemedText style={styles.contractRowText}>
            Biên bản nghiệm thu
          </ThemedText>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#7A7A7A"
          />
        </TouchableOpacity>
      </View>

      {/* Certificate Modal */}
      <Modal
        visible={showCertModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Biên bản nghiệm thu
              </ThemedText>
              <TouchableOpacity onPress={() => setShowCertModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.certHeader}>
                <ThemedText style={styles.certLogo}>viettel</ThemedText>
                <ThemedText style={styles.certSubtitle}>
                  Trusted Certificate Provider
                </ThemedText>
                <ThemedText style={styles.certLocation}>
                  Hà Nội, ngày 16 tháng 10, năm 2024
                </ThemedText>
              </View>

              {/* Title */}
              <ThemedText style={styles.certMainTitle}>
                BIÊN BẢN BẢN GIAO{"\n"}CHỨNG THƯ SỐ VIETTEL-CA
              </ThemedText>

              {/* Content */}
              <View style={styles.certContent}>
                <ThemedText style={styles.certParagraph}>
                  Căn cứ vào hợp đồng đã ký ngày 16. tháng 10., năm 2024 giữa
                  TỔNG CÔNG TY VIỄN THÔNG VIETTEL - CHI NHÁNH TẬP ĐOÀN CÔNG
                  NGHIỆP - VIỄN THÔNG QUÂN ĐỘI
                </ThemedText>

                <ThemedText style={styles.certSectionTitle}>
                  (Bên B) và Ông/Bà: PHẠM ĐỨC HUY
                </ThemedText>

                <ThemedText style={styles.certLabel}>
                  Hôm nay, chứng tỏi gồm:
                </ThemedText>

                <ThemedText style={styles.certSubLabel}>
                  Bên A: Đại diện khách hàng:
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  Khách hàng: PHẠM ĐỨC HUY
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  Địa chỉ giao dịch: Trạng Tây, Nam Định, Nam Định
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  Số điện thoại: 0935035303
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  Người đại diện: PHẠM ĐỨC HUY
                </ThemedText>

                <ThemedText style={styles.certSubLabel}>
                  Bên B: Nhà cung cấp dịch vụ
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  TỔNG CÔNG TY VIỄN THÔNG VIETTEL - CHI NHÁNH TẬP ĐOÀN CÔNG
                  NGHIỆP - VIỄN THÔNG QUÂN ĐỘI
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  Trụ sở: Số 1 Giảng Võn Minh, Phường Kim Mã - Ba Đình - Hà Nội
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  Địa chỉ giao dịch: Số 1 Giảng Võn Minh, Phường Kim Mã - Ba
                  Đình - Hà Nội
                </ThemedText>
                <ThemedText style={styles.certValue}>
                  Số điện thoại: 18008168
                </ThemedText>

                <ThemedText style={styles.certSection}>
                  Bên A kiểm tra và xác nhận thông tin của chứng thư số do bên
                  B cấp phát hoàn toàn trùng khớp với thông tin do bên A yêu
                  cầu. Hai bên đồng ý ký biên bản xác nhận về việc bên B đã hoàn
                  thành việc cấp phát chứng thư số Viettel-CA cho bên A và bên A
                  có sử dụng chứng thư số được cấp có thời hạn từ 16/10/2024 đến
                  16/10/2025 với các nội dung cụ thể như sau:
                </ThemedText>

                <View style={styles.certInfoBox}>
                  <ThemedText style={styles.certInfoLabel}>
                    Số Serial:
                  </ThemedText>
                  <ThemedText style={styles.certInfoValue}>
                    5404fffeb7033fb316d672201c010446
                  </ThemedText>

                  <ThemedText style={styles.certInfoLabel}>
                    Tổ chức phát hành:
                  </ThemedText>
                  <ThemedText style={styles.certInfoValue}>
                    C=VN, O=Viettel Group, CN=Viettel-CA RS
                  </ThemedText>

                  <ThemedText style={styles.certInfoLabel}>
                    Thông tin thuê bao:
                  </ThemedText>
                  <ThemedText style={styles.certInfoValue}>
                    UID=CMND:001089020747, CN=PHAM ĐỨC HUY, L=NAM ĐỊNH, C=VN
                  </ThemedText>

                  <ThemedText style={styles.certInfoLabel}>
                    Ngày bắt đầu:
                  </ThemedText>
                  <ThemedText style={styles.certInfoValue}>
                    16/10/2024
                  </ThemedText>

                  <ThemedText style={styles.certInfoLabel}>
                    Ngày kết thúc:
                  </ThemedText>
                  <ThemedText style={styles.certInfoValue}>
                    16/10/2025
                  </ThemedText>
                </View>

                <ThemedText style={styles.certSection}>
                  Biên bản này có giá trị pháp lý và là bằng chứng chứng thực
                  việc cấp phát chứng thư số Viettel-CA cho bên A.
                </ThemedText>
              </View>

              {/* Signature Area */}
              <View style={styles.signatureArea}>
                <View style={styles.signatureBox}>
                  <ThemedText style={styles.signatureLabel}>Bên A</ThemedText>
                  <View style={styles.signatureLine} />
                  <ThemedText style={styles.signatureDate}>
                    Ngày: 16/10/2024
                  </ThemedText>
                </View>
                <View style={styles.signatureBox}>
                  <ThemedText style={styles.signatureLabel}>Bên B</ThemedText>
                  <View style={styles.signatureLine} />
                  <ThemedText style={styles.signatureDate}>
                    Ngày: 16/10/2024
                  </ThemedText>
                </View>
              </View>
            </ScrollView>

            
          </View>
        </View>
      </Modal>


    </ScrollView>
          {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: "#0D6EFD" }]}
          onPress={() => router.push("/choose-certificate2")}
        >
          <ThemedText style={styles.confirmButtonText}>
            Xác nhận nghiệm thu
          </ThemedText>
        </TouchableOpacity>
      </View>
       </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingTop: 24,
    marginBottom: 16,
  },
  fixedButtonWrap: {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 24,
},

  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2196F3",
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.5,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  content: {
    marginBottom: 24,
  },
  topProgressWrap: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  topProgressBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  segment: {
    flex: 1,
  },
  segmentDone: { backgroundColor: "#4CAF50" },
  segmentActive: { backgroundColor: "#21C4F3" },
  segmentTodo: { backgroundColor: "rgba(0,0,0,0.08)" },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionHeaderSmall: {
    marginTop: 8,
    marginBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A7A7A",
  },
  infoCard: {
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  infoLabel: {
    color: "#7A7A7A",
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoValueSmall: {
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  contractRow: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  contractRowText: {
    fontSize: 14,
    color: "#2196F3",
    flex: 1,
    marginRight: 8,
  },
  warningBox: {
    backgroundColor: "#FFF6D6",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(165,125,0,0.15)",
  },
  warningText: {
    color: "#A57D00",
    fontSize: 13,
    flex: 1,
  },
  otpHint: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 8,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  otpText: {
    fontSize: 20,
    letterSpacing: 6,
    fontWeight: "700",
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  confirmButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  signButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalCloseButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    margin: 16,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  // Certificate styles
  certHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  certLogo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E41F1F",
    letterSpacing: 1,
  },
  certSubtitle: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  certLocation: {
    fontSize: 12,
    color: "#666666",
    marginTop: 8,
    fontWeight: "500",
  },
  certMainTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  certContent: {
    marginBottom: 16,
  },
  certParagraph: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
    color: "#333333",
  },
  certSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333333",
  },
  certLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
    color: "#333333",
  },
  certSubLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
    color: "#333333",
  },
  certValue: {
    fontSize: 12,
    marginBottom: 6,
    color: "#555555",
    marginLeft: 8,
  },
  certSection: {
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 12,
    color: "#333333",
  },
  certInfoBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  certInfoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666666",
    marginTop: 8,
    marginBottom: 4,
  },
  certInfoValue: {
    fontSize: 12,
    color: "#333333",
    marginBottom: 4,
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
  },
  signatureBox: {
    flex: 1,
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 20,
  },
  signatureLine: {
    width: 80,
    height: 1,
    backgroundColor: "#000000",
    marginBottom: 8,
  },
  signatureDate: {
    fontSize: 11,
    color: "#666666",
  },});