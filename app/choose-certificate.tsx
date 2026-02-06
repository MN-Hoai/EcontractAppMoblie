import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface CertificateProvider {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  selected: boolean;
}

export default function ChooseCertificateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [providers, setProviders] = useState<CertificateProvider[]>([
    {
      id: "1",
      name: "viettel",
      displayName: "Viettel - MySign",
      logo: "🔴",
      selected: false,
    },
  ]);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleProviderSelect = (providerId: string) => {
    setProviders(
      providers.map((p) =>
        p.id === providerId ? { ...p, selected: !p.selected } : p,
      ),
    );
  };

  const handleContinue = () => {
    const selectedProvider = providers.find((p) => p.selected);
    if (selectedProvider && termsAccepted) {
      // Navigate to identity verification
      router.push("/identity-verification");
    } else {
      alert("Vui lòng chọn nhà cung cấp chứng thư và chấp nhận điều khoản");
    }
  };

  const ViettelLogo = () => (
    <View
      style={[
        styles.logoContainer,
        { backgroundColor: isDark ? "#2D2D2D" : "#F5F5F5" },
      ]}
    >
      <View style={styles.viettelLogo}>
        <ThemedText
          style={{ color: "white", fontWeight: "bold", fontSize: 12 }}
        >
          Viettel
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View
    style={[
      styles.container,
      { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
    ]}
  >


    <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 160 }}
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
          Chọn chứng thư số
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Provider Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Nhà cung cấp</ThemedText>

        {providers.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerCard,
              {
                backgroundColor: isDark ? "#1D3D47" : "#F9F9F9",
                borderColor: provider.selected
                  ? "#2196F3"
                  : isDark
                    ? "#38434D"
                    : "#E0E0E0",
              },
            ]}
            onPress={() => handleProviderSelect(provider.id)}
          >
            <View style={styles.providerContent}>
              <ViettelLogo />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.providerName}>
                  {provider.displayName}
                </ThemedText>
              </View>
            </View>
            {provider.selected && (
              <View style={styles.checkmark}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#2196F3"
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Information Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Thông tin định kèm</ThemedText>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? "#1D3D47" : "#F9F9F9" },
          ]}
        >
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: termsAccepted ? "#2196F3" : "transparent",
                  borderColor: termsAccepted ? "#2196F3" : "#CCCCCC",
                },
              ]}
            >
              {termsAccepted && (
                <MaterialCommunityIcons name="check" size={16} color="white" />
              )}
            </View>
            <ThemedText style={styles.infoText}>
              Tôi xác nhân rằng tôi đã đọc hiểu và đồng ý nội dung khoảng, điều
              kiện cấp chứng thư số của Viettel
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewDocLink}>
            <ThemedText style={styles.viewDocText}>Xem văn bản</ThemedText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#2196F3"
            />
          </TouchableOpacity>
        </View>
      </View>

      
    </ScrollView>
    {/* Terms Notice */}
      <View style={styles.termsNoticeContainer}>
        <ThemedText style={styles.termsNoticeText}>
          Bằng cách chọn vào &quot;Tiếp tục&quot; tôi đồng ý để itc gửi
          các thông tin cá nhân của tôi cho nhà cung cấp để phục vụ việc đăng ký
          chứng thư số
        </ThemedText>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor:
                providers.some((p) => p.selected) && termsAccepted
                  ? "#2196F3"
                  : "#CCCCCC",
            },
          ]}
          onPress={handleContinue}
          disabled={!providers.some((p) => p.selected) || !termsAccepted}
        >
          <ThemedText style={styles.buttonText}>Tiếp tục</ThemedText>
        </TouchableOpacity>
      </View>
       </View>
  );
}

const styles = StyleSheet.create({
  fixedFooter: {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 20,
},

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    opacity: 0.7,
  },
  providerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  providerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  viettelLogo: {
    backgroundColor: "#FF3D3D",
    width: "100%",
    height: "100%",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  checkmark: {
    marginLeft: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  viewDocLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  viewDocText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  termsNoticeContainer: {
    backgroundColor: "rgba(33, 150, 243, 0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  termsNoticeText: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.7,
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  continueButton: {
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
