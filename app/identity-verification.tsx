import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function IdentityVerificationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const handleStartVerification = () => {
    // Navigate to camera page for capturing ID front
    router.push("/id-camera-front");
  };

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
        <ThemedText type="title" style={{ fontSize: 20 }}>
          Xác thực danh tính
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <View
          style={[
            styles.illustration,
            { backgroundColor: isDark ? "#1D3D47" : "#E3F2FD" },
          ]}
        >
          <MaterialCommunityIcons
            name="card-account-details"
            size={80}
            color="#2196F3"
          />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Hướng dẫn chụp CCCD</ThemedText>

        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: "#2196F3" }]}>
            <ThemedText style={{ color: "white", fontWeight: "bold" }}>
              1
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.instructionTitle}>
              Chuẩn bị CCCD
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              Chuẩn bị căn cước công dân của bạn
            </ThemedText>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: "#2196F3" }]}>
            <ThemedText style={{ color: "white", fontWeight: "bold" }}>
              2
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.instructionTitle}>
              Chụp mặt trước
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              Chụp rõ ràng mặt trước của CCCD
            </ThemedText>
          </View>
        </View>

        <View style={styles.instructionItem}>
          <View style={[styles.stepNumber, { backgroundColor: "#2196F3" }]}>
            <ThemedText style={{ color: "white", fontWeight: "bold" }}>
              3
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.instructionTitle}>
              Chụp mặt sau
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              Chụp rõ ràng mặt sau của CCCD
            </ThemedText>
          </View>
        </View>

        {/* Tips Section */}
        <View
          style={[
            styles.tipsSection,
            { backgroundColor: isDark ? "#1D3D47" : "#F9F9F9" },
          ]}
        >
          <ThemedText style={styles.tipTitle}>Mẹo chụp tốt hơn:</ThemedText>

          <View style={styles.tipItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color="#4CAF50"
              style={{ marginRight: 10 }}
            />
            <ThemedText style={styles.tipText}>Đảm bảo ánh sáng đủ</ThemedText>
          </View>

          <View style={styles.tipItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color="#4CAF50"
              style={{ marginRight: 10 }}
            />
            <ThemedText style={styles.tipText}>
              Không chộp bóng hoặc phản chiếu
            </ThemedText>
          </View>

          <View style={styles.tipItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color="#4CAF50"
              style={{ marginRight: 10 }}
            />
            <ThemedText style={styles.tipText}>
              Giữ CCCD nằm ngang, không nghiêng
            </ThemedText>
          </View>

          <View style={styles.tipItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color="#4CAF50"
              style={{ marginRight: 10 }}
            />
            <ThemedText style={styles.tipText}>
              Toàn bộ CCCD phải rõ và đầy đủ
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Start Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: "#2196F3" }]}
          onPress={handleStartVerification}
        >
          <ThemedText style={styles.buttonText}>Bắt đầu xác thực</ThemedText>
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
    marginBottom: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 4,
    flexShrink: 0,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  tipsSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  startButton: {
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
