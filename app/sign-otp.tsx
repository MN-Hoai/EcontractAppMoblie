import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignOtpScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const [otp, setOtp] = useState("");
const [showSuccess, setShowSuccess] = useState(false);

const handleConfirm = () => {
  if (otp.length < 6) return;
  setShowSuccess(true);
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0D1B23" : "#F5F7FA" },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={26} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>
              Xác thực giao dịch
            </ThemedText>
            <View style={{ width: 26 }} />
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <ThemedText style={styles.label}>Tài khoản ký số</ThemedText>
            <ThemedText style={styles.value}>040093016268</ThemedText>

            <ThemedText style={[styles.label, { marginTop: 12 }]}>
              Phương thức xác thực
            </ThemedText>
            <ThemedText style={styles.value}>SMS OTP</ThemedText>
          </View>

          {/* WARNING */}
          <View style={styles.warning}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={18}
              color="#B08900"
            />
            <ThemedText style={styles.warningText}>
              Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
            </ThemedText>
          </View>

          <ThemedText style={styles.sentText}>
            Chúng tôi đã gửi mã OTP đến số điện thoại 03*****193
          </ThemedText>

          {/* OTP INPUT */}
          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.otpInput}
            placeholder="Nhập OTP"
          />

          {/* PUSH BUTTON TO BOTTOM */}
          <View style={styles.fixedBottom}>
            <TouchableOpacity style={styles.btn} onPress={handleConfirm}>
              <ThemedText style={styles.btnText}>
                Xác nhận & Hoàn tất
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>


      <Modal visible={showSuccess} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.successModal}>
      <MaterialCommunityIcons
        name="check-circle"
        size={64}
        color="#22C55E"
      />

      <ThemedText style={styles.successTitle}>
        Ký số thành công
      </ThemedText>

      <ThemedText style={styles.successText}>
        Giao dịch đã được xác thực thành công
      </ThemedText>

      <TouchableOpacity
        style={styles.successBtn}
        onPress={() => router.replace("/contracts")}
      >
        <ThemedText style={{ color: "#FFF", fontWeight: "700" }}>
          Về danh sách hợp đồng
        </ThemedText>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

successModal: {
  backgroundColor: "#FFF",
  borderRadius: 16,
  padding: 24,
  width: "85%",
  alignItems: "center",
},

successTitle: {
  fontSize: 18,
  fontWeight: "700",
  marginTop: 12,
},

successText: {
  fontSize: 14,
  color: "#666",
  marginTop: 6,
  marginBottom: 18,
  textAlign: "center",
},

successBtn: {
  backgroundColor: "#1976D2",
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
},

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },

  label: {
    fontSize: 13,
    color: "#7A7A7A",
  },

  value: {
    fontSize: 15,
    fontWeight: "700",
  },

  warning: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
    gap: 8,
    alignItems: "center",
  },

  warningText: {
    fontSize: 13,
    color: "#7A7A7A",
    flex: 1,
  },

  sentText: {
    marginTop: 16,
    fontSize: 14,
  },

  otpInput: {
    borderWidth: 1,
    borderColor: "#CDE6F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 8,
    marginTop: 14,
    backgroundColor: "#FFF",
  },

  fixedBottom: {
    marginTop: "auto",
    paddingBottom: 12,
  },

  btn: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
