import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
  View
} from "react-native";

const VALID_OTP = "000000";

/* ─── Info row (read-only) ──────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons name={icon as any} size={16} color="#2092EC" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

/* ─── Contract row ──────────────────────────────────────────── */
function ContractRow({
  icon, label, desc, onPress,
}: { icon: string; label: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.contractRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.contractRowIcon}>
        <MaterialCommunityIcons name={icon as any} size={20} color="#1565C0" />
      </View>
      <View style={styles.contractRowContent}>
        <Text style={styles.contractRowLabel}>{label}</Text>
        <Text style={styles.contractRowDesc}>{desc}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#BBBEC7" />
    </TouchableOpacity>
  );
}

/* ─── OTP digit boxes ───────────────────────────────────────── */
function OtpBoxes({
  value, isValid, isComplete, isFocused, onPress,
}: {
  value: string; isValid: boolean; isComplete: boolean;
  isFocused: boolean; onPress: () => void;
}) {
  const digits = value.padEnd(6, " ").split("");
  const activeColor = isComplete ? (isValid ? "#4CAF50" : "#E53935") : "#2092EC";

  return (
    <Pressable style={styles.otpBoxRow} onPress={onPress}>
      {digits.map((ch, i) => {
        const isCurrent = i === value.length && isFocused && !isComplete;
        const filled = i < value.length;
        const boxColor = filled ? activeColor : "#2092EC";
        return (
          <View key={i} style={[
            styles.otpBox,
            filled && { borderColor: boxColor, backgroundColor: boxColor + "15" },
            isCurrent && styles.otpBoxActive,
          ]}>
            {isCurrent
              ? <View style={styles.cursor} />
              : <Text style={[styles.otpDigit, { color: filled ? activeColor : "#CCC" }]}>
                {ch.trim()}
              </Text>
            }
          </View>
        );
      })}
    </Pressable>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function SignContractScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const otpCardRef = useRef<View>(null);

  const [otp, setOtp] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const isOtpComplete = otp.length === 6;
  const isOtpValid = otp === VALID_OTP;

  /* Countdown after confirm */
  useEffect(() => {
    if (!showProcessing) return;
    if (countdown === 0) {
      setShowProcessing(false);
      setShowSuccess(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showProcessing, countdown]);

  const handleConfirm = () => {
    if (!isOtpValid) return;
    setCountdown(5);
    setShowProcessing(true);
  };

  const focusInput = () => {
    inputRef.current?.focus();
    // scroll OTP card vào vùng nhìn thấy sau khi keyboard bật lên
    setTimeout(() => {
      otpCardRef.current?.measureLayout(
        scrollRef.current as any,
        (_x, y) => {
          scrollRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }
      );
    }, Platform.OS === "ios" ? 350 : 450);
  };

  const handleOtpChange = (text: string) => {
    setOtp(text.replace(/[^0-9]/g, ""));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
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
            <Text style={styles.headerTitle}>Ký hợp đồng số</Text>
            <Text style={styles.headerSub}>Đăng ký Chứng thư số</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* ── Progress stepper ── */}
        <View style={styles.stepper}>
          {["Chụp ảnh", "Thông tin", "Ký hợp đồng"].map((label, idx) => {
            const active = idx === 2;
            const done = idx < 2;
            return (
              <View key={label} style={styles.stepItem}>
                {idx > 0 && (
                  <View style={[styles.stepLine, styles.stepLineDone]} />
                )}
                <View style={[
                  styles.stepCircle,
                  done && styles.stepCircleDone,
                  active && styles.stepCircleActive,
                ]}>
                  {done
                    ? <MaterialCommunityIcons name="check" size={13} color="#FFF" />
                    : <Text style={[styles.stepNum, active && { color: "#FFF" }]}>{idx + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Khách hàng ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <MaterialCommunityIcons name="account" size={15} color="#1565C0" />
                <Text style={styles.cardHeaderText}>THÔNG TIN KHÁCH HÀNG</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="shield-check" size={13} color="#4CAF50" />
                <Text style={styles.verifiedText}>Đã xác thực</Text>
              </View>
            </View>

            <InfoRow icon="account-outline" label="Họ và tên" value="LÊ KHANH ĐẠT" />
            <View style={styles.rowDivider} />
            <InfoRow icon="calendar-outline" label="Ngày sinh" value="21/12/1993" />
            <View style={styles.rowDivider} />
            <InfoRow icon="gender-male-female" label="Giới tính" value="Nam" />
            <View style={styles.rowDivider} />
            <InfoRow icon="map-marker-outline" label="Địa chỉ" value="TỐ 5, PHƯỜNG NAM ĐỊNH, NINH BÌNH" />
            <View style={styles.rowDivider} />
            <InfoRow icon="barcode" label="Mã đơn hàng" value="6209443990" />
          </View>

          {/* ── Hợp đồng ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <MaterialCommunityIcons name="file-document" size={15} color="#1565C0" />
                <Text style={styles.cardHeaderText}>TÀI LIỆU CẦN KÝ</Text>
              </View>
              <Text style={styles.docCount}>2 tài liệu</Text>
            </View>

            <ContractRow
              icon="file-document-outline"
              label="Hợp đồng cung cấp dịch vụ"
              desc="Nhấn để xem nội dung"
              onPress={() => router.push("/" as any)}
            />
            <View style={styles.rowDivider} />
            <ContractRow
              icon="file-check-outline"
              label="Biên bản xác nhận xử lý dữ liệu"
              desc="Nhấn để xem nội dung"
              onPress={() => router.push("/sign-val" as any)}
            />
          </View>

          {/* ── Cảnh báo ── */}
          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#F57F17" />
            <Text style={styles.warningText}>
              Vui lòng đọc kỹ các tài liệu trước khi nhập mã OTP và ký xác nhận.
            </Text>
          </View>

          {/* ── OTP section ── */}
          <View ref={otpCardRef} style={styles.card} collapsable={false}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <MaterialCommunityIcons name="shield-key-outline" size={15} color="#1565C0" />
                <Text style={styles.cardHeaderText}>XÁC THỰC OTP</Text>
              </View>
            </View>

            <View style={styles.otpSection}>
              <View style={styles.otpHintRow}>
                <MaterialCommunityIcons name="message-text-outline" size={15} color="#2092EC" />
                <Text style={styles.otpHint}>
                  Mã OTP đã gửi đến{" "}
                  <Text style={{ fontWeight: "700", color: "#1565C0" }}>098*****308</Text>
                </Text>
              </View>



              {/* Visual digit boxes — tap to focus */}
              <OtpBoxes
                value={otp}
                isValid={isOtpValid}
                isComplete={isOtpComplete}
                isFocused={isFocused}
                onPress={focusInput}
              />

              {/* Real hidden TextInput */}
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={6}
                caretHidden
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              {isOtpComplete && (
                <View style={styles.otpStatus}>
                  <MaterialCommunityIcons
                    name={isOtpValid ? "check-circle" : "close-circle"}
                    size={16}
                    color={isOtpValid ? "#4CAF50" : "#E53935"}
                  />
                  <Text style={[styles.otpStatusText, { color: isOtpValid ? "#4CAF50" : "#E53935" }]}>
                    {isOtpValid ? "Mã OTP chính xác" : "Mã OTP không đúng. Vui lòng thử lại"}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.resendRow} onPress={() => { setOtp(""); focusInput(); }}>
                <MaterialCommunityIcons name="refresh" size={14} color="#2092EC" />
                <Text style={styles.resendText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* ── Bottom bar ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.confirmBtn, !isOtpValid && { opacity: 0.45 }]}
            onPress={handleConfirm}
            disabled={!isOtpValid}
            activeOpacity={0.85}
          >

            <Text style={styles.confirmBtnText}>Xác nhận</Text>

          </TouchableOpacity>
        </View>
      </View>

      {/* ── Processing modal ── */}
      <Modal visible={showProcessing} transparent animationType="fade" onRequestClose={() => { }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <LinearGradient
              colors={["#1565C0", "#2092EC"]}
              style={styles.modalIconCircle}
            >
              <MaterialCommunityIcons name="timer-sand" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={styles.modalCountdown}>{countdown}s</Text>
            <Text style={styles.modalTitle}>Đang xử lý yêu cầu</Text>
            <Text style={styles.modalMsg}>
              Viettel đã tiếp nhận yêu cầu đăng ký Chứng thư số. Vui lòng chờ trong giây lát...
            </Text>
            <View style={styles.processingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.35 }]} />
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Success modal ── */}
      <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => { }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.successCircle}>
              <MaterialCommunityIcons name="check-bold" size={40} color="#FFF" />
            </View>
            <Text style={styles.successTitle}>Đăng ký thành công!</Text>
            <Text style={styles.successMsg}>
              Quý khách đã đăng ký thành công và được cấp Chứng thư số.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => { setShowSuccess(false); router.push("/sign-val" as any); }}
            >
              <MaterialCommunityIcons name="file-check" size={18} color="#FFF" />
              <Text style={styles.successBtnText}>Nghiệm thu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}
            >
              <Text style={styles.homeBtnText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },

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

  /* Stepper */
  stepper: {
    flexDirection: "row", justifyContent: "center", alignItems: "flex-start",
    backgroundColor: "#FFF", paddingVertical: 16, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: "#EEF0F4",
  },
  stepItem: { alignItems: "center", flex: 1, position: "relative" },
  stepLine: {
    position: "absolute", top: 14, right: "50%",
    width: "100%", height: 2, backgroundColor: "#E0E0E0", zIndex: 0,
  },
  stepLineDone: { backgroundColor: "#2092EC" },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#E8EDF2", alignItems: "center", justifyContent: "center", zIndex: 1,
  },
  stepCircleActive: { backgroundColor: "#2092EC" },
  stepCircleDone: { backgroundColor: "#4CAF50" },
  stepNum: { fontSize: 12, fontWeight: "700", color: "#9E9E9E" },
  stepLabel: { fontSize: 11, color: "#9E9E9E", marginTop: 5, fontWeight: "500" },
  stepLabelActive: { color: "#2092EC", fontWeight: "700" },

  scrollContent: { padding: 16, paddingBottom: 24 },

  /* Card */
  card: {
    backgroundColor: "#FFF", borderRadius: 18, marginBottom: 14,
    overflow: "hidden", shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06,
    shadowRadius: 10, elevation: 2,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#F2F4F7",
    backgroundColor: "#F8FAFF",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardHeaderText: { fontSize: 11, fontWeight: "700", color: "#1565C0", letterSpacing: 0.5 },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  verifiedText: { fontSize: 11, color: "#4CAF50", fontWeight: "700" },
  docCount: { fontSize: 12, color: "#2092EC", fontWeight: "600" },

  /* Info row */
  infoRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  infoIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#EAF2FE", alignItems: "center", justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#9E9E9E", fontWeight: "600", marginBottom: 3 },
  infoValue: { fontSize: 14, color: "#111", fontWeight: "600", lineHeight: 20 },

  /* Contract row */
  contractRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  contractRowIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#EAF2FE", alignItems: "center", justifyContent: "center",
  },
  contractRowContent: { flex: 1 },
  contractRowLabel: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  contractRowDesc: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },

  rowDivider: { height: 1, backgroundColor: "#F2F4F7", marginLeft: 62 },

  /* Warning */
  warningBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#FFF8E1", borderRadius: 14, padding: 14,
    marginBottom: 14, borderLeftWidth: 3, borderLeftColor: "#FFB300",
  },
  warningText: { flex: 1, fontSize: 13, color: "#7A5F00", lineHeight: 20 },

  /* OTP */
  otpSection: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  otpHintRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  otpHint: { fontSize: 13, color: "#555", flex: 1 },

  hiddenInput: {
    position: "absolute", opacity: 0, width: "100%", height: 56,
  },
  otpBoxRow: {
    flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 14,
  },
  otpBox: {
    width: 40, height: 52, borderRadius: 10,
    borderWidth: 2, borderColor: "#E0E0E0",
    backgroundColor: "#F8FAFF",
    alignItems: "center", justifyContent: "center",
  },
  otpDigit: { fontSize: 22, fontWeight: "800", color: "#2092EC" },
  otpBoxActive: {
    borderColor: "#2092EC",
    backgroundColor: "#EAF2FE",
    shadowColor: "#2092EC",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cursor: {
    width: 2, height: 28,
    backgroundColor: "#2092EC",
    borderRadius: 1,
  },
  tapHint: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    backgroundColor: "#EAF2FE",
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#2092EC",
  },
  tapHintText: { color: "#2092EC", fontSize: 13, fontWeight: "600" as const },


  otpStatus: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  otpStatusText: { fontSize: 13, fontWeight: "600" },

  resendRow: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "center", paddingVertical: 4,
  },
  resendText: { color: "#2092EC", fontSize: 13, fontWeight: "600" },

  /* Bottom bar */
  bottomBar: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1, borderTopColor: "#EEF0F4",
  },
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#1565C0", borderRadius: 16, paddingVertical: 16,
  },
  confirmBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },

  /* Modals */
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 28,
  },
  modalBox: {
    backgroundColor: "#FFF", borderRadius: 24,
    paddingVertical: 32, paddingHorizontal: 24,
    alignItems: "center", width: "100%",
  },
  modalIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  modalCountdown: { fontSize: 28, fontWeight: "900", color: "#1565C0", marginBottom: 6 },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A", marginBottom: 10 },
  modalMsg: { fontSize: 13, color: "#777", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  processingDots: { flexDirection: "row", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2092EC" },

  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#4CAF50", alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 10 },
  successMsg: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  successBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#1565C0", borderRadius: 14,
    paddingVertical: 14, width: "100%", marginBottom: 10,
  },
  successBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  homeBtn: {
    paddingVertical: 12, width: "100%", alignItems: "center",
  },
  homeBtnText: { color: "#607D8B", fontWeight: "600", fontSize: 14 },
});
