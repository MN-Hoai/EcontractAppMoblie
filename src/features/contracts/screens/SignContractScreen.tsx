import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function SignContractScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(44);
  const [otp, setOtp] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const VALID_OTP = "000000";

  const isOtpValid = otp === VALID_OTP;
  const isOtpComplete = otp.length === 6;

  useEffect(() => {
    if (!showCountdown) return;

    if (countdown === 0) {
      setShowCountdown(false);
      setShowSuccess(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  const handleOtpSubmit = () => {
    if (isOtpValid) {
      setShowCountdown(true);
      setCountdown(5);
    }
  };

  const handleOtpChange = (text: string) => {
    setOtp(text);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={[
            styles.container,
            { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 0 }}

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
            <ThemedText type="title" style={{ fontSize: 18, flex: 1 }}>
              Đăng ký Chứng thư số
            </ThemedText>
            <View style={{ width: 28 }} />
          </View>

          {/* Progress Bar (3 segments) */}
          <View style={styles.topProgressWrap}>
            <View style={styles.topProgressBar}>
              <View style={[styles.segment, styles.segmentDone]} />
              <View style={[styles.segment, styles.segmentActive]} />
              <View style={[styles.segment, styles.segmentTodo]} />
            </View>
          </View>

          {/* Step Title */}
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepLabel}>BƯỚC 2</ThemedText>
            <ThemedText style={styles.stepTitle}>
              Ký hợp đồng sử dụng chứng thư số
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              Quý khách vui lòng kiểm tra thông tin hợp đồng và biên bản
            </ThemedText>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Customer info section */}
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderText}>
                THÔNG TIN KHÁCH HÀNG
              </ThemedText>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Họ và tên</ThemedText>
                <ThemedText style={styles.infoValue}>PHAM DUC HUY</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Ngày sinh</ThemedText>
                <ThemedText style={styles.infoValue}>13/08/1989</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Giới tính</ThemedText>
                <ThemedText style={styles.infoValue}>Nam</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Địa chỉ thường trú</ThemedText>
                <ThemedText style={styles.infoValueSmall}>
                  P310 Tt 76 Phố Thọ Lão, Đồng Mác, QUAN HAI BA TRUNG, HA NOI, VN
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Mã đơn hàng</ThemedText>
                <ThemedText style={styles.infoValue}>6209443990</ThemedText>
              </View>
            </View>

            {/* Contract info */}
            <View style={styles.sectionHeaderSmall}>
              <ThemedText style={styles.sectionHeaderText}>
                THÔNG TIN HỢP ĐỒNG
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.contractRow}
              onPress={() => router.push("/")}
            >
              <ThemedText style={styles.contractRowText}>
                Hợp đồng cung cấp dịch vụ
              </ThemedText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#7A7A7A"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contractRow}
              onPress={() => router.push("/sign-val")}
            >
              <ThemedText style={styles.contractRowText}>
                Biên bản xác nhận xử lý dữ liệu
              </ThemedText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#7A7A7A"
              />
            </TouchableOpacity>

            {/* Warning box */}
            <View style={styles.warningBox}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color="#A57D00"
                style={{ marginRight: 8 }}
              />
              <ThemedText style={styles.warningText}>
                Vui lòng kiểm tra ký thông tin trước khi xác nhận
              </ThemedText>
            </View>

            {/* OTP + confirm area (static) */}
            <ThemedText style={styles.otpHint}>
              Chúng tôi đã gửi mã OTP đến số điện thoại 098*****308
            </ThemedText>
            <TextInput
              style={[
                styles.otpInput,
                {
                  borderColor: isOtpComplete ? (isOtpValid ? "#4CAF50" : "#FF6B6B") : isDark ? "#38434D" : "#D0D0D0",
                  color: isDark ? "#FFFFFF" : "#000000",
                  backgroundColor: isDark ? "#1D3D47" : "#F5F5F5"
                }
              ]}
              placeholder="000000"
              placeholderTextColor={isDark ? "#666" : "#AAA"}
              maxLength={6}
              keyboardType="numeric"
              value={otp}
              onChangeText={handleOtpChange}
            />

            {isOtpComplete && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <MaterialCommunityIcons
                  name={isOtpValid ? "check-circle" : "alert-circle"}
                  size={20}
                  color={isOtpValid ? "#4CAF50" : "#FF6B6B"}
                  style={{ marginRight: 8 }}
                />
                <ThemedText style={{ color: isOtpValid ? "#4CAF50" : "#FF6B6B", fontSize: 13, fontWeight: "600" }}>
                  {isOtpValid ? "Mã OTP chính xác" : "Mã OTP không đúng"}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.signButton,
                {
                  backgroundColor: isOtpValid ? "#2092EC" : "#CCCCCC",
                  opacity: isOtpValid ? 1 : 0.6,
                }
              ]}
              onPress={handleOtpSubmit}
              disabled={!isOtpValid}
            >
              <ThemedText style={styles.buttonText}>
                Xác nhận và tiếp tục
              </ThemedText>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="white"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* OTP Input Modal */}
        <Modal visible={showCountdown} transparent animationType="fade" onRequestClose={() => { }}>
          <View style={styles.otpModalOverlay}>
            <View style={styles.otpModalBox}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={40}
                color="#2196F3"
                style={{ marginBottom: 12 }}
              />
              <ThemedText style={styles.otpCountdown}>{countdown} giây</ThemedText>
              <ThemedText style={styles.otpMessage}>
                Viettel đã tiếp nhận yêu cầu đăng ký Chứng thư số của Quý khách. Vui lòng chờ trong ít phút để được cấp chứng thư số
              </ThemedText>

            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => { }}>
          <View style={styles.successOverlay}>
            <View style={styles.successBox}>
              <View style={styles.successIconContainer}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={60}
                  color="#2196F3"
                />
              </View>
              <ThemedText style={styles.successTitle}>Thành công</ThemedText>
              <ThemedText style={styles.successMessage}>
                Quý khách đã ký hợp đồng thành công để sử dụng Chứng thư số
              </ThemedText>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setShowSuccess(false);
                  router.push("/sign-val");
                }}
              >
                <ThemedText style={styles.successButtonText}>Nghiêm thu</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
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
    color: "#333333",
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
  otpInput: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    marginBottom: 18,
  },
  buttonContainer: {
    paddingBottom: 24,
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
  otpInputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
    marginBottom: 16,
  },
  otpInputContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  otpInputLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  otpInputHint: {
    fontSize: 13,
    color: "#999",
    marginBottom: 16,
  },
  otpRetryText: {
    fontSize: 13,
    color: "#2196F3",
    textAlign: "center",
  },
  otpInputButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  otpSubmitButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  otpSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  otpModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  otpModalBox: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  otpCountdown: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2196F3",
    marginBottom: 12,
  },
  otpMessage: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#888",
    marginBottom: 20,
  },
  otpDisabledButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  otpDisabledButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  successBox: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  successMessage: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: "#2092EC",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
