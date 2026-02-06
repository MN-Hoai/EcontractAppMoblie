import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

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

export default function IDInformationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { photoFront, photoBack } = useLocalSearchParams();

  // Mock extracted data from ID card
  // In real app, this would come from OCR/API processing
  const [idInfo] = useState<IDInfo>({
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

  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(80);

  useEffect(() => {
    if (!showCountdown) return;

    if (countdown === 0) {
      router.push({
        pathname: "/sign-contract",
        params: { photoFront, photoBack, idInfo: JSON.stringify(idInfo) },
      });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  const handleConfirm = () => {
    // Show countdown modal
    setShowCountdown(true);
  };

  const handleEdit = () => {
    // Allow user to retake photos
    router.back();
  };

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: string;
  }) => (
    <View style={styles.infoRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
        ]}
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

      {/* Top progress */}
      <View style={styles.topProgressWrap}>
        <View style={styles.topProgressBar}>
          <View style={[styles.segment, styles.segmentActive]} />
          <View style={[styles.segment, styles.segmentTodo]} />
          <View style={[styles.segment, styles.segmentTodo]} />
        </View>
      </View>

      {/* Step Title */}
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepLabel}>BƯỚC 1</ThemedText>
        <ThemedText style={styles.stepTitle}>
          Xác thực thông tin cá nhân
        </ThemedText>
        <ThemedText style={styles.stepDescription}>
          Quy khách vui lòng xác thực lại thông tin
        </ThemedText>
      </View>

      {/* Information Section */}
      <View style={styles.content}>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? "#1D3D47" : "#F5F5F5" },
          ]}
        >
          <ThemedText style={styles.sectionTitle}>THÔNG TIN CÁ NHÂN</ThemedText>

          <View style={styles.divider} />

          <InfoRow label="Họ và tên" value={idInfo.fullName} />
          <View style={styles.rowDivider} />

          <InfoRow label="Ngày sinh" value={idInfo.dateOfBirth} />
          <View style={styles.rowDivider} />

          <InfoRow label="Giới tính" value={idInfo.gender} />
          <View style={styles.rowDivider} />

          <InfoRow label="Số căn cước công dân" value={idInfo.idNumber} />
          <View style={styles.rowDivider} />

          <InfoRow label="Ngày cấp" value={idInfo.issueDate} />
          <View style={styles.rowDivider} />

          <InfoRow label="Nơi cấp" value={idInfo.placeOfIssue} />
          <View style={styles.rowDivider} />

          <InfoRow label="Địa chỉ thường trú" value={idInfo.address} />
          <View style={styles.rowDivider} />

          <InfoRow label="Số điện thoại" value={idInfo.phoneNumber} />
          <View style={styles.rowDivider} />

          <InfoRow label="Email" value={idInfo.email} />
        </View>

        {/* Verification Note */}
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
            Vui lòng kiểm tra lại thông tin. Nếu có sai sót, hãy chụp lại ID
            card
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { borderColor: isDark ? "#38434D" : "#D0D5DD" },
          ]}
          onPress={handleEdit}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={isDark ? "#FFFFFF" : "#000000"}
            style={{ marginRight: 8 }}
          />
          <ThemedText style={styles.secondaryButtonText}>Chụp lại</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: "#2196F3" }]}
          onPress={handleConfirm}
        >
          <ThemedText style={styles.primaryButtonText}>Xác thực</ThemedText>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="white"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
      </ScrollView>

      <Modal visible={showCountdown} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.countdownOverlay}>
        <View style={styles.countdownBox}>
          <MaterialCommunityIcons
            name="timer-sand"
            size={20}
            color="#FF6B6B"
            style={{ marginBottom: 6 }}
          />
          <ThemedText style={styles.countdownTime}>{countdown} giây</ThemedText>
          <ThemedText style={styles.countdownMessage}>
            Để tiếp tục đăng ký "Chứng thư số" xin quý khách vui lòng đợi hệ thống tiếp nhận và xử lý thông tin
          </ThemedText>
          <TouchableOpacity 
            style={styles.countdownButton} 
            onPress={() => {
              setShowCountdown(false);
              router.push({
                pathname: "/sign-contract",
                params: { photoFront, photoBack, idInfo: JSON.stringify(idInfo) },
              });
            }}
          >
            <ThemedText style={styles.countdownButtonText}>Tiếp tục</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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

  topProgressWrap: {
    paddingHorizontal: 16,
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
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.5,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    opacity: 0.6,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  noteCard: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  noteText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 24,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
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
    fontVariant: ["tabular-nums"],
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
    shadowColor: "#2196F3",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  countdownButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
});
