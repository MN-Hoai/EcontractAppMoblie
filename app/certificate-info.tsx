import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function CertificateInfoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to choose certificate page
    router.push("/choose-certificate");
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
          Thông tin chứng thư số
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
            name="shield-check"
            size={80}
            color="#2196F3"
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Certificate Question */}
        <View style={styles.questionSection}>
          <View style={styles.questionHeader}>
            <MaterialCommunityIcons
              name="help-circle"
              size={20}
              color="#2196F3"
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.questionTitle}>
              Chứng thư số là gì?
            </ThemedText>
          </View>
          <ThemedText style={styles.answerText}>
            Chứng thư số là một loại chứng thư điện tử được cấp bởi một tổ chức
            chứng thực uy tín (CA).
          </ThemedText>
        </View>

        {/* Digital Signature Question */}
        <View style={styles.questionSection}>
          <View style={styles.questionHeader}>
            <MaterialCommunityIcons
              name="help-circle"
              size={20}
              color="#2196F3"
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.questionTitle}>
              Chủ kỹ số là gì?
            </ThemedText>
          </View>
          <ThemedText style={styles.answerText}>
            Chủ kỹ số là một loại chủ kỹ điện tử có thể được sử dụng để xác nhận
            giao kết các văn bản điện tử, có giá trị pháp lý tương tự như chủ kỹ
            viết tay theo Luật Giao dịch điện tử của Việt Nam
          </ThemedText>
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>
            Lợi ích của chứng thư số:
          </ThemedText>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
              style={{ marginRight: 12 }}
            />
            <ThemedText style={styles.benefitText}>
              Bảo mật thông tin cao
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
              style={{ marginRight: 12 }}
            />
            <ThemedText style={styles.benefitText}>
              Có giá trị pháp lý
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
              style={{ marginRight: 12 }}
            />
            <ThemedText style={styles.benefitText}>
              Xác thực danh tính chính xác
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: isDark ? "#2196F3" : "#2196F3" },
          ]}
          onPress={handleContinue}
        >
          <ThemedText style={styles.buttonText}>Tiếp tục</ThemedText>
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
    width: 160,
    height: 160,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginBottom: 32,
  },
  questionSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginLeft: 28,
  },
  infoSection: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  continueButton: {
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
