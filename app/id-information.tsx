import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface IDInfo {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  issueDate: string;
  placeOfIssue: string;
  address: string;
  phoneNumber: string;
  email: string;
}

// Helper to parse dd/MM/yyyy to ISO Date (yyyy-MM-dd)
const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // parts[0]=dd, parts[1]=MM, parts[2]=yyyy
    // Return yyyy-MM-dd
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return null; // or return original if already valid? assuming input is strictly dd/MM/yyyy
};

export default function IDInformationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { photoFront, photoBack } = useLocalSearchParams();

  const [idInfo, setIdInfo] = useState<IDInfo>({
    fullName: "LÊ KHANH ĐẠT",
    dateOfBirth: "21/12/1993",
    gender: "Nam",
    idNumber: "040093016268",
    issueDate: "21/12/2022",
    placeOfIssue: "CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ CÔNG CỘNG",
    address: "TỐ 5, PHƯƠNG NAM ĐỊNH, NINH BÌNH, VN",
    phoneNumber: "0348741193",
    email: "datik.93t@gmail.com",
  });

  const [editingField, setEditingField] = useState<keyof IDInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hardcoded accountId as requested
  const HARDCODED_ACCOUNT_ID = '3f2a9c4e-8d7b-4c91-a2f1-6e5b8a0d9c21';

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Map to CitizenIdentityModel
      const model = {
        IdNumber: idInfo.idNumber,
        FullName: idInfo.fullName,
        DateOfBirth: parseDate(idInfo.dateOfBirth),
        Gender: idInfo.gender,
        IssueDate: parseDate(idInfo.issueDate),
        IssuePlace: idInfo.placeOfIssue,
        PermanentAddress: idInfo.address,
        PhoneNumber: idInfo.phoneNumber,
        Email: idInfo.email
      };

      console.log("Submitting model:", model);

      // Call API
      // Note: Assuming accountId is passed as query param based on [HttpPost("/api/infoid?accountId=...")] pattern usually implied 
      // or if it's a route param. User prompt said: public IActionResult InfoIdPost(string accountId, [FromBody] CitizenIdentityModel model)
      // This signature usually implies query string or route data for the non-body parameter.
      const url = `http://192.168.1.147:5000/api/infoid?accountId=${HARDCODED_ACCOUNT_ID}`;

      const response = await axios.post(url, model);

      if (response.status === 200) {
        Alert.alert("Thành công", response.data.message || "Upload thông tin thành công 1", [
          {
            text: "OK",
            onPress: () => {
              router.push({
                pathname: "/sign-contract",
                params: { photoFront, photoBack, idInfo: JSON.stringify(idInfo) },
              });
            }
          }
        ]);
      } else {
        throw new Error("API returned status " + response.status);
      }

    } catch (error: any) {
      console.error("Submission error:", error);
      let errorMessage = "Không thể gửi thông tin. Vui lòng thử lại.";
      if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng (Network Error). Vui lòng kiểm tra IP/Port và Firewall server.";
      } else if (error.response) {
        errorMessage = `Lỗi Server: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const EditableInfoRow = ({
    label,
    field,
  }: {
    label: string;
    field: keyof IDInfo;
  }) => {
    const isEditing = editingField === field;

    return (
      <View>
        <View style={styles.infoRow}>
          {/* LEFT COLUMN */}
          <View style={styles.leftCol}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <ThemedText style={styles.required}> *</ThemedText>
          </View>

          {/* RIGHT COLUMN */}
          <View style={styles.rightCol}>
            {isEditing ? (
              <TextInput
                value={idInfo[field]}
                autoFocus
                onChangeText={(text) =>
                  setIdInfo((p) => ({ ...p, [field]: text }))
                }
                onBlur={() => setEditingField(null)}
                style={[
                  styles.inlineInput,
                  { color: isDark ? "#FFFFFF" : "#000000" },
                ]}
              />
            ) : (
              <TouchableOpacity
                style={styles.valueWrap}
                onPress={() => setEditingField(field)}
              >
                <ThemedText style={styles.value}>
                  {idInfo[field]}
                </ThemedText>

                <MaterialCommunityIcons
                  name="account-edit-outline"
                  size={16}
                  color={isDark ? "#9BA1A6" : "#bc6a06"}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            )}
          </View>

        </View>

        <View style={styles.rowDivider} />
      </View>
    );
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >

      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
        ]}
        contentContainerStyle={{
          paddingBottom: 0,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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

          <ThemedText type="title" style={{ fontSize: 18 }}>
            Đăng ký Chứng thư số tại Viettel
          </ThemedText>

          <View style={{ width: 28 }} />
        </View>

        {/* Progress */}
        <View style={styles.topProgressWrap}>
          <View style={styles.topProgressBar}>
            <View style={[styles.segment, styles.segmentActive]} />
            <View style={[styles.segment, styles.segmentTodo]} />
            <View style={[styles.segment, styles.segmentTodo]} />
          </View>
        </View>

        {/* Step */}
        <View style={styles.stepContainer}>
          <ThemedText style={styles.stepLabel}>BƯỚC 1</ThemedText>
          <ThemedText style={styles.stepTitle}>
            Xác thực thông tin cá nhân
          </ThemedText>
          <ThemedText style={styles.stepDescription}>
            Bấm vào thông tin để chỉnh sửa nếu sai
          </ThemedText>
        </View>

        {/* Info */}
        <View style={styles.content}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: isDark ? "#1D3D47" : "#F5F5F5" },
            ]}
          >
            <ThemedText style={styles.sectionTitle}>
              THÔNG TIN CÁ NHÂN
            </ThemedText>

            <View style={styles.divider} />

            <EditableInfoRow label="Họ và tên" field="fullName" />
            <EditableInfoRow label="Ngày sinh" field="dateOfBirth" />
            <EditableInfoRow label="Giới tính" field="gender" />
            <EditableInfoRow label="Số CCCD" field="idNumber" />
            <EditableInfoRow label="Ngày cấp" field="issueDate" />
            <EditableInfoRow label="Nơi cấp" field="placeOfIssue" />
            <EditableInfoRow label="Địa chỉ thường trú" field="address" />
            <EditableInfoRow label="Số điện thoại" field="phoneNumber" />
            <EditableInfoRow label="Email" field="email" />
          </View>

          {/* Note */}
          <View
            style={[
              styles.noteCard,
              { backgroundColor: isDark ? "#1D3D47" : "#E8F5E9" },
            ]}
          >
            <MaterialCommunityIcons
              name="information"
              size={20}
              color="#4CAF50"
              style={{ marginRight: 12 }}
            />
            <ThemedText style={styles.noteText}>
              Có thể chạm vào từng dòng để chỉnh sửa nếu OCR sai
            </ThemedText>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { borderColor: isDark ? "#38434D" : "#D0D5DD" },
            ]}
            onPress={() => router.replace("/id-camera-front")}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color={isDark ? "#FFFFFF" : "#000000"}
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.secondaryButtonText}>
              Chụp lại
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: "#2092EC", opacity: isSubmitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            ) : null}
            <ThemedText style={styles.primaryButtonText}>
              {isSubmitting ? "Đang xử lý..." : "Xác thực"}
            </ThemedText>
            {!isSubmitting && (
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="white"
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: { paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingTop: 24,
    marginBottom: 16,
  }, infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  leftCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  rightCol: {
    flex: 1.2,
    alignItems: "flex-end",
  },

  label: {
    fontSize: 13,
    opacity: 0.6,
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },

  inlineInput: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    width: "100%",
    padding: 0,
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
  },


  topProgressWrap: { paddingHorizontal: 16, marginBottom: 12 },

  topProgressBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  segment: { flex: 1 },
  segmentActive: { backgroundColor: "#21C4F3" },
  segmentTodo: { backgroundColor: "rgba(0,0,0,0.08)" },

  stepContainer: { marginBottom: 24 },
  stepLabel: { fontSize: 12, fontWeight: "700", opacity: 0.5 },
  stepTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  stepDescription: { fontSize: 13, opacity: 0.6 },

  content: { marginBottom: 24 },

  infoCard: { borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", opacity: 0.5, marginBottom: 12 },

  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.1)", marginBottom: 16 },
  required: { color: "red", fontSize: 13, fontWeight: "700" },


  rowDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.05)" },

  noteCard: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noteText: { fontSize: 13, flex: 1, lineHeight: 18 },

  buttonContainer: { flexDirection: "row", gap: 12, paddingBottom: 24 },

  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: { fontSize: 14, fontWeight: "600" },

  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  countdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  countdownBox: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "85%",
    maxWidth: 300,
  },

  countdownTime: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF6B6B",
    marginBottom: 12,
  },

  countdownMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#888",
    marginBottom: 20,
  },

  countdownButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  countdownButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
});
