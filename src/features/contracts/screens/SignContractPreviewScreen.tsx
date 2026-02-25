import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  FdfData,
  fetchFdfByUrl,
  parseFdfData,
} from "@/services/contractService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// API Base URL - should match the backend server
const API_BASE_URL = "http://192.168.1.82:5000";

export default function SignContractPreviewScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const params = useLocalSearchParams();

  const [fdfData, setFdfData] = useState<FdfData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractId = params.contractId as string;
  const contractName = params.contractName as string;
  const fdfPath = params.fdfPath as string;
  const filePath = params.filePath as string;

  // Helper function to convert relative path to full URL
  const getFullUrl = (path: string): string => {
    if (!path) return "";
    // If path already starts with http:// or https://, return as is
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    // Otherwise, prepend the API base URL
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Fetch FDF data if path is provided
  useEffect(() => {
    const loadFdfData = async () => {
      if (!fdfPath) {
        setFdfData({});
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert relative path to full URL
        const fullFdfUrl = getFullUrl(fdfPath);
        console.log("Fetching FDF from:", fullFdfUrl);
        const fdfContent = await fetchFdfByUrl(fullFdfUrl);
        const parsedData = parseFdfData(fdfContent);

        console.log("Parsed FDF data:", parsedData);
        setFdfData(parsedData);
      } catch (err) {
        console.error("Error loading FDF:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load contract data",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFdfData();
  }, [fdfPath]);

  const handleContinueSign = () => {
    // Navigate to the actual signing page with OTP/signature
    router.push({
      pathname: "/sign",
      params: {
        contractId,
        contractName,
        filePath: getFullUrl(filePath),
        fdfData: JSON.stringify(fdfData),
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Chi tiết ký</ThemedText>
          <View style={{ width: 26 }} />
        </View>

        {/* Contract Name */}
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1D3D47" : "#F0F8FF" },
          ]}
        >
          <ThemedText style={styles.cardTitle}>{contractName}</ThemedText>
          <View
            style={{
              height: 1,
              backgroundColor: isDark ? "#38434D" : "#E0E0E0",
              marginVertical: 12,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="file-pdf-box"
              size={24}
              color={isDark ? "#FF6B6B" : "#DC3545"}
            />
            <ThemedText style={styles.fileInfo}>{filePath}</ThemedText>
          </View>
        </View>

        {/* FDF Data Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {fdfPath ? "Dữ liệu biểu mẫu" : "Không có dữ liệu biểu mẫu"}
          </ThemedText>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={isDark ? "#2092EC" : "#2092EC"}
              />
              <ThemedText style={{ marginTop: 12 }}>
                Đang tải dữ liệu...
              </ThemedText>
            </View>
          ) : error ? (
            <View
              style={[
                styles.errorCard,
                { backgroundColor: isDark ? "#4D2323" : "#FFE5E5" },
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color={isDark ? "#FF6B6B" : "#DC3545"}
              />
              <ThemedText style={{ color: "#FF6B6B", flex: 1, marginLeft: 12 }}>
                {error}
              </ThemedText>
            </View>
          ) : Object.keys(fdfData).length > 0 ? (
            <View>
              {Object.entries(fdfData).map(([key, value], index) => (
                <View
                  key={`${key}-${index}`}
                  style={[
                    styles.fieldRow,
                    {
                      backgroundColor: isDark ? "#1D3D47" : "#F5F5F5",
                      borderColor: isDark ? "#38434D" : "#E0E0E0",
                    },
                  ]}
                >
                  <ThemedText style={styles.fieldLabel}>{key}</ThemedText>
                  <ThemedText
                    style={[styles.fieldValue, { marginTop: 4 }]}
                    numberOfLines={2}
                  >
                    {String(value)}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : fdfPath ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: isDark ? "#1D3D47" : "#F5F5F5" },
              ]}
            >
              <ThemedText style={{ textAlign: "center", opacity: 0.6 }}>
                Không tìm thấy dữ liệu biểu mẫu
              </ThemedText>
            </View>
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: isDark ? "#1D3D47" : "#F5F5F5" },
              ]}
            >
              <ThemedText style={{ textAlign: "center", opacity: 0.6 }}>
                Hợp đồng không có dữ liệu biểu mẫu
              </ThemedText>
            </View>
          )}
        </View>

        {/* Notice */}
        <View
          style={[
            styles.noticeCard,
            { backgroundColor: isDark ? "#4D3D23" : "#FFF5E5" },
          ]}
        >
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={isDark ? "#FFA500" : "#FF9800"}
          />
          <ThemedText style={styles.noticeText}>
            Vui lòng kiểm tra lại thông tin trên. Quý khách sẽ cần xác nhận bằng
            OTP để hoàn tất quá trình ký.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Sign Button */}
      <View
        style={[
          styles.footer,
          { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
        ]}
      >
        <TouchableOpacity
          style={[styles.viewPdfButton, { borderColor: "#2092EC" }]}
          onPress={() =>
            router.push({
              pathname: "/sign-contract-view",
              params: {
                contractId,
                contractName,
                filePath: getFullUrl(filePath),
                fdfPath: getFullUrl(fdfPath),
              },
            })
          }
        >
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={20}
            color="#2092EC"
            style={{ marginRight: 8 }}
          />
          <ThemedText style={{ color: "#2092EC", fontWeight: "600" }}>
            Xem PDF
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signButton, { backgroundColor: "#2092EC" }]}
          onPress={handleContinueSign}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <ThemedText style={styles.signButtonText}>Tiếp tục ký</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    opacity: 0.7,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorCard: {
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  fieldRow: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyCard: {
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeCard: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 12,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    flexDirection: "row",
    gap: 12,
  },
  viewPdfButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  signButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  signButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
