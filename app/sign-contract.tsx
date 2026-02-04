import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function SignContractScreen() {
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
          Ký hợp đồng
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "66%" }]} />
        </View>
      </View>

      {/* Step Title */}
      <View style={styles.stepContainer}>
        <ThemedText style={styles.stepLabel}>BƯỚC 2</ThemedText>
        <ThemedText style={styles.stepTitle}>
          Ký hợp đồng với chứng thư số
        </ThemedText>
        <ThemedText style={styles.stepDescription}>
          Xác nhận và ký hợp đồng bằng chứng thư số
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1D3D47" : "#F5F5F5" },
          ]}
        >
          <MaterialCommunityIcons
            name="file-document"
            size={48}
            color="#2196F3"
            style={{ marginBottom: 16 }}
          />
          <ThemedText style={styles.cardTitle}>
            Hợp đồng Dịch vụ Tư vấn
          </ThemedText>
          <ThemedText style={styles.cardDate}>Ngày: 03/02/2026</ThemedText>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <ThemedText style={styles.instructionTitle}>Hướng dẫn ký:</ThemedText>
          <View style={styles.instructionItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
              style={{ marginRight: 12 }}
            />
            <ThemedText style={styles.instructionText}>
              Xem lại toàn bộ nội dung hợp đồng
            </ThemedText>
          </View>
          <View style={styles.instructionItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
              style={{ marginRight: 12 }}
            />
            <ThemedText style={styles.instructionText}>
              Kiểm tra thông tin cá nhân
            </ThemedText>
          </View>
          <View style={styles.instructionItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
              style={{ marginRight: 12 }}
            />
            <ThemedText style={styles.instructionText}>
              Nhấp &quot;Ký&quot; để xác nhận
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.signButton, { backgroundColor: "#2196F3" }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.buttonText}>Xem hợp đồng</ThemedText>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="white"
            style={{ marginLeft: 8 }}
          />
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
  card: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 13,
    opacity: 0.6,
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 13,
    flex: 1,
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
});
