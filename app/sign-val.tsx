import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function SignValScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  return (
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
          onPress={() => router.push("/")}
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
    </ScrollView>
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
});
