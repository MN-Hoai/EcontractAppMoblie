import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const VALID_OTP = "000000";

/* ─── OTP Digit Boxes Component ─────────────────────────────── */
function OtpDigitBoxes({
  value,
  isFocused,
  onPress,
  isValid = true,
}: {
  value: string;
  isFocused: boolean;
  onPress: () => void;
  isValid?: boolean;
}) {
  const digits = value.padEnd(6, " ").split("");
  const isComplete = value.length === 6;
  const activeColor = isComplete ? (isValid ? "#4CAF50" : "#E53935") : "#2092EC";

  return (
    <Pressable style={styles.otpRow} onPress={onPress}>
      {digits.map((ch, i) => {
        const isCurrent = i === value.length && isFocused;
        const filled = i < value.length;
        const boxColor = filled ? activeColor : "#2092EC";

        return (
          <View
            key={i}
            style={[
              styles.otpBox,
              filled && { borderColor: boxColor, backgroundColor: boxColor + "15" },
              isCurrent && styles.otpBoxActive,
            ]}
          >
            {isCurrent ? (
              <View style={styles.cursor} />
            ) : (
              <Text style={[styles.otpText, { color: filled ? activeColor : "#CCC" }]}>
                {ch.trim()}
              </Text>
            )}
          </View>
        );
      })}
    </Pressable>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function SignOtpScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isOtpComplete = otp.length === 6;
  const isOtpValid = otp === VALID_OTP;

  const focusInput = () => inputRef.current?.focus();

  const handleConfirm = () => {
    if (otp === VALID_OTP) {
      setShowSuccess(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={["#1565C0", "#2092EC"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Xác thực ký số</Text>
            <Text style={styles.headerSub}>Ký số tài liệu điện tử</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Info Card ── */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-key-outline" size={20} color="#2092EC" />
              <View>
                <Text style={styles.label}>Tài khoản ký số</Text>
                <Text style={styles.value}>040093016268</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#2092EC" />
              <View>
                <Text style={styles.label}>Phương thức xác thực</Text>
                <Text style={styles.value}>SMS OTP (MySign)</Text>
              </View>
            </View>
          </View>

          {/* ── Warning ── */}
          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#FFD600" />
            <Text style={styles.warningText}>
              Bằng việc nhập OTP, bạn xác nhận đồng ý ký số vào tài liệu đã chọn.
            </Text>
          </View>

          {/* ── OTP Section ── */}
          <View style={styles.otpSection}>
            <Text style={styles.sentText}>
              Mã xác thực đã được gửi đến số{" "}
              <Text style={{ fontWeight: "700", color: "#1565C0" }}>03*****193</Text>
            </Text>

            <OtpDigitBoxes
              value={otp}
              isFocused={isFocused}
              onPress={focusInput}
              isValid={!isOtpComplete || isOtpValid}
            />

            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={6}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            {isOtpComplete && !isOtpValid && (
              <View style={styles.errorRow}>
                <MaterialCommunityIcons name="close-circle" size={14} color="#E53935" />
                <Text style={styles.errorText}>Mã OTP không chính xác. Vui lòng thử lại.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.resendBtn} onPress={() => setOtp("")}>
              <MaterialCommunityIcons name="refresh" size={14} color="#2092EC" />
              <Text style={styles.resendText}>Gửi lại mã OTP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ── Bottom Bar ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryBtn, !isOtpValid && styles.btnDisabled]}
            disabled={!isOtpValid}
            onPress={handleConfirm}
          >
            <MaterialCommunityIcons name="check-decagram" size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>Xác nhận & Hoàn tất</Text>
          </TouchableOpacity>
        </View>

        {/* ── Success Modal ── */}
        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <LinearGradient
                colors={["#4CAF50", "#66BB6A"]}
                style={styles.successIconCircle}
              >
                <MaterialCommunityIcons name="check-all" size={40} color="#FFF" />
              </LinearGradient>
              <Text style={styles.successTitle}>Ký số thành công!</Text>
              <Text style={styles.successMsg}>
                Tài liệu của Quý khách đã được ký số an toàn và lưu trữ vào hệ thống.
              </Text>

              <View style={styles.successActionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnOutline]}
                  onPress={() => {
                    setShowSuccess(false);
                    // TODO: Replace with your view document logic
                    // router.push("/document-detail" as any);
                  }}
                >
                  <Text style={[styles.actionBtnText, styles.textOutline]}>Xem lại tài liệu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnPrimary]}
                  onPress={() => router.replace("/(tabs)" as any)}
                >
                  <Text style={[styles.actionBtnText, styles.textPrimary]}>Về trang chủ</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 15, paddingBottom: 15, paddingHorizontal: 16, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },

  scrollContent: { padding: 16 },

  card: {
    backgroundColor: "#FFF", borderRadius: 18, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 4 },
  label: { fontSize: 11, color: "#9E9E9E", fontWeight: "600", marginBottom: 2 },
  value: { fontSize: 15, color: "#1A1A1A", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },

  warningBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFF8E1", borderRadius: 12, padding: 12, marginTop: 16,
  },
  warningText: { flex: 1, fontSize: 12, color: "#FFB300", lineHeight: 18 },

  otpSection: { alignItems: "center", marginTop: 32 },
  sentText: { fontSize: 14, color: "#546E7A", marginBottom: 24, textAlign: "center" },

  otpRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  otpBox: {
    width: 44, height: 56, borderRadius: 12, borderWidth: 2,
    borderColor: "#CFD8DC", backgroundColor: "#FFF",
    alignItems: "center", justifyContent: "center",
  },
  otpBoxActive: { borderColor: "#2092EC", backgroundColor: "#F4Faff" },
  otpText: { fontSize: 24, fontWeight: "800", color: "#2092EC" },
  cursor: { width: 2, height: 24, backgroundColor: "#2092EC", borderRadius: 1 },

  hiddenInput: { position: "absolute", opacity: 0, width: 0, height: 0 },

  errorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  errorText: { fontSize: 12, color: "#E53935", fontWeight: "600" },

  resendBtn: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 24, padding: 8 },
  resendText: { fontSize: 14, color: "#2092EC", fontWeight: "700" },

  footer: { padding: 16, paddingBottom: 24, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#ECEFF1" },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#1565C0", paddingVertical: 16, borderRadius: 16,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  btnDisabled: { opacity: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 32 },
  successModal: { backgroundColor: "#FFF", borderRadius: 24, padding: 32, alignItems: "center", width: "100%" },
  successIconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A", marginBottom: 12 },
  successMsg: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 22, borderBottomWidth: 1, borderBottomColor: "#F0F2F5", paddingBottom: 24, marginBottom: 24 },

  successActionRow: { flexDirection: "row", gap: 12, width: "100%" },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  btnOutline: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#1565C0" },
  btnPrimary: { backgroundColor: "#1565C0" },
  actionBtnText: { fontWeight: "700", fontSize: 14 },
  textOutline: { color: "#1565C0" },
  textPrimary: { color: "#FFF" },
});
