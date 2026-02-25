import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function SignContractViewScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const contractId = params.contractId as string;
  const contractName = params.contractName as string;
  const filePath = params.filePath as string;
  const fdfPath = params.fdfPath as string;

  // FilePath is now a full URL passed from sign-contract-preview
  // e.g., "http://192.168.1.82:5000/media/upload/2026/01/27/cd849d7a.pdf"

  const API_BASE_URL = "http://192.168.1.82:5000";

  // Helper to extract relative path from full URL
  const getRelativePath = (path: string) => {
    if (path.startsWith("http")) {
      try {
        const url = new URL(path);
        // The pathname includes the leading slash, e.g. /media/upload/...
        return url.pathname;
      } catch (e) {
        console.warn("Invalid URL format:", path);
        return path;
      }
    }
    return path;
  };

  const relativePath = getRelativePath(filePath);

  // Construct the new URL using the server's ViewPdfByPath API
  // This will call: http://192.168.1.82:5000/api/view-contract?filePath=/media/upload/...
  const pdfUrl = `${API_BASE_URL}/api/view-contract?filePath=${encodeURIComponent(relativePath)}`;

  // For download, we still use the API endpoint as it returns the file stream
  const downloadUrl = pdfUrl;

  // On Android, WebView cannot display PDF directly, so we use Google Docs Viewer
  const displayUrl = Platform.OS === 'android'
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
    : pdfUrl;

  console.log("Loading PDF from API:", pdfUrl);
  console.log("Display URL:", displayUrl);

  const handleContinue = () => {
    router.push({
      pathname: "/sign-contract-preview",
      params: {
        contractId,
        contractName,
        filePath,
        fdfPath: fdfPath || "",
      },
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const fileName = contractName.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";

      const docDir = (FileSystem as any).documentDirectory ||
        (FileSystem as any).Paths?.document?.uri ||
        (FileSystem as any).documentDirectory;

      if (!docDir) {
        Alert.alert("Thông báo", "Không thể xác định thư mục lưu trữ.");
        setDownloading(false);
        return;
      }

      const fileUri = `${docDir}${fileName}`;

      if (typeof (FileSystem as any).downloadAsync !== 'function') {
        Alert.alert("Thông báo", "Tính năng tải xuống không khả dụng trên thiết bị này.");
        setDownloading(false);
        return;
      }

      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);

      if (downloadResult.status === 200) {
        Alert.alert(
          "Tải xuống thành công",
          `Tệp đã được lưu tại thiết bị`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Lỗi", "Tải xuống thất bại.");
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert(
        "Lỗi tải xuống",
        err instanceof Error ? err.message : "Không thể tải xuống tệp",
        [{ text: "OK" }]
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
      ]}
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
        <ThemedText style={styles.headerTitle}>{contractName}</ThemedText>
        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloading || loading || !!error}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#2092EC" />
          ) : (
            <MaterialCommunityIcons
              name="download"
              size={26}
              color={downloading || loading || !!error ? "#999" : "#2092EC"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2092EC" />
            <ThemedText style={{ marginTop: 12 }}>
              Đang tải hợp đồng...
            </ThemedText>
          </View>
        )}

        {error ? (
          <View
            style={[
              styles.emptyContainer,
              { backgroundColor: isDark ? "#1D3D47" : "#F5F5F5" },
            ]}
          >
            <ThemedText style={{ textAlign: "center", opacity: 0.6 }}>
              Không tìm thấy file hợp đồng
            </ThemedText>
          </View>
        ) : (
          <WebView
            source={{ uri: displayUrl }}
            onLoad={() => setLoading(false)}
            onLoadEnd={() => setLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              setError("Không thể tải tệp PDF.");
              setLoading(false);
            }}
            style={[styles.pdf, { opacity: loading ? 0 : 1 }]}
          />
        )}
      </View>

      {/* Footer Actions */}
      <View
        style={[
          styles.footer,
          { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <ThemedText
            style={{
              color: isDark ? "#FFFFFF" : "#2092EC",
              fontWeight: "600",
            }}
          >
            Quay lại
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.continueButton]}
          onPress={handleContinue}
          disabled={loading || !!error}
        >
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <ThemedText style={styles.continueButtonText}>Tiếp tục</ThemedText>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginLeft: 12,
  },
  pdfContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pdf: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
    color: "#FF6B6B",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2092EC",
  },
  continueButton: {
    backgroundColor: "#2092EC",
  },
  continueButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
