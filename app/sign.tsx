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

export default function SignScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSign = () => {
    setShowSuccess(true);
  };

  const handleConfirm = () => {
    setShowSuccess(false);
    router.push("/contracts");
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0F1720" />
        </TouchableOpacity>
        <ThemedText type="title" style={{ fontSize: 18, fontWeight: "700" }}>
          Ký số
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.section}>
        <View style={[styles.infoCard, styles.cardElevated]}>
          <View style={styles.infoRowCard}>
            <ThemedText style={styles.infoLabelMuted}>Tên văn bản</ThemedText>
            <ThemedText style={styles.infoValueSmall}>
              Viettel-CA_RS_HopDongChoVay_...pdf
            </ThemedText>
          </View>
          <View style={styles.infoRowCard}>
            <ThemedText style={styles.infoLabelMuted}>Mô tả ký</ThemedText>
            <ThemedText style={styles.infoValueSmall}>
              Ký số văn bản Vay thấu chi
            </ThemedText>
          </View>
          <View style={styles.infoRowCard}>
            <ThemedText style={styles.infoLabelMuted}>Nhà cung cấp</ThemedText>
            <ThemedText style={styles.infoValueSmall}>Viettel-CA RS</ThemedText>
          </View>
          <View style={styles.infoRowCard}>
            <ThemedText style={styles.infoLabelMuted}>
              Thời gian xác thực ký còn lại
            </ThemedText>
            <ThemedText style={styles.infoValue}>175 giây</ThemedText>
          </View>
        </View>
        <View style={[styles.infoCard, styles.cardElevated, { marginTop: 12 }]}>
          <View style={styles.infoRowCard}>
            <ThemedText style={styles.infoLabelMuted}>Tên văn bản</ThemedText>
            <ThemedText style={styles.infoValueSmall}>
              Viettel-CA_RS_GiayDangKyCKS_...pdf
            </ThemedText>
          </View>
          <View style={styles.infoRowCard}>
            <ThemedText style={styles.infoLabelMuted}>Mô tả ký</ThemedText>
            <ThemedText style={styles.infoValueSmall}>
              Ký số văn bản Đăng ký sử dụng chứng thư số
            </ThemedText>
          </View>
          <View style={styles.infoRowCard}>
            <ThemedText style={styles.infoLabelMuted}>Nhà cung cấp</ThemedText>
            <ThemedText style={styles.infoValueSmall}>Viettel-CA RS</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.signButton} onPress={handleSign}>
          <ThemedText style={styles.signButtonText}>Ký số</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.successModal,
              { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
            ]}
          >
            <View style={styles.successIcon}>
              <MaterialCommunityIcons
                name="check-circle"
                size={56}
                color="#4CAF50"
              />
            </View>
            <ThemedText style={styles.successTitle}>Ký thành công</ThemedText>
            <ThemedText style={styles.successMessage}>
              Tài liệu của bạn đã được ký thành công.
            </ThemedText>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <ThemedText style={styles.confirmButtonText}>Xác nhận</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    marginBottom: 12,
  },
  section: { marginTop: 8 },
  infoCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 0,
  },
  cardElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    alignItems: "center",
  },
  infoLabelMuted: { fontSize: 13, color: "#7A7A7A", flex: 1 },
  infoValue: { fontSize: 13, fontWeight: "700" },
  infoValueSmall: { fontSize: 13, flex: 1, textAlign: "right" },
  buttonContainer: { paddingVertical: 24 },
  signButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  signButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "85%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#7A7A7A",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
