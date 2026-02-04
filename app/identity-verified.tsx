import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function IdentityVerifiedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { photoFront, photoBack } = useLocalSearchParams();

  const handleContinue = () => {
    // Navigate to ID information verification page
    router.push({
      pathname: "/id-information",
      params: { photoFront, photoBack },
    });
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

      {/* Success Illustration */}
      <View style={styles.successContainer}>
        <View style={styles.successCircle}>
          <MaterialCommunityIcons
            name="check-circle"
            size={80}
            color="#4CAF50"
          />
        </View>
        <ThemedText style={styles.successTitle}>
          Xác thực thành công!
        </ThemedText>
        <ThemedText style={styles.successMessage}>
          Chúng tôi đã xác nhận thông tin của bạn
        </ThemedText>
      </View>

      {/* Information Section */}
      <View style={styles.content}>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? "#1D3D47" : "#F9F9F9" },
          ]}
        >
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <MaterialCommunityIcons
                name="card-account-details"
                size={20}
                color="#2196F3"
                style={{ marginRight: 8 }}
              />
              <ThemedText style={styles.labelText}>Mặt trước</ThemedText>
            </View>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <MaterialCommunityIcons
                name="card-account-details"
                size={20}
                color="#2196F3"
                style={{ marginRight: 8 }}
              />
              <ThemedText style={styles.labelText}>Mặt sau</ThemedText>
            </View>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#4CAF50"
            />
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <ThemedText style={styles.detailsTitle}>Tiếp theo:</ThemedText>
          <View style={styles.detailItem}>
            <View style={styles.detailNumber}>
              <ThemedText style={styles.detailNumberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.detailText}>
              Ký hợp đồng bằng chứng thư số
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailNumber}>
              <ThemedText style={styles.detailNumberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.detailText}>
              Xác nhận giao dịch
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailNumber}>
              <ThemedText style={styles.detailNumberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.detailText}>Hợp đồng hoàn tất</ThemedText>
          </View>
        </View>

        {/* Security Note */}
        <View
          style={[
            styles.securityNote,
            { backgroundColor: isDark ? "#1D3D47" : "#E3F2FD" },
          ]}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={20}
            color="#2196F3"
            style={{ marginRight: 8 }}
          />
          <ThemedText style={styles.securityText}>
            Thông tin của bạn được bảo mật theo chuẩn quốc tế
          </ThemedText>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: "#4CAF50" }]}
          onPress={handleContinue}
        >
          <ThemedText style={styles.buttonText}>
            Tiếp tục ký hợp đồng
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
  successContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
  content: {
    marginBottom: 32,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 8,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  securityNote: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  securityText: {
    fontSize: 13,
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
