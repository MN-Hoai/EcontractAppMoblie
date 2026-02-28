import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getFileContract } from "@/services/contractService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  // localFileUri: URI file đã tải về cache từ API
  const [localFileUri, setLocalFileUri] = useState<string | null>(null);

  const contractId = params.contractId as string;
  const contractName = params.contractName as string;
  const fdfPath = params.fdfPath as string;

  // ── Tải file hợp đồng từ API khi màn hình mount ──────────────
  useEffect(() => {
    let cancelled = false;
    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const uri = await getFileContract(contractId);
        if (!cancelled) setLocalFileUri(uri);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Không thể tải hợp đồng.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFile();
    return () => { cancelled = true; };
  }, [contractId]);

  // URL hiển thị: file local trên iOS / Google Docs Viewer trên Android
  const displayUrl = localFileUri
    ? Platform.OS === "android"
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(localFileUri)}`
      : localFileUri
    : null;

  console.log("Local file URI:", localFileUri);
  console.log("Display URL:", displayUrl);

  const handleContinue = () => {
    router.push({
      pathname: "/sign-contract-preview",
      params: {
        contractId,
        contractName,
        // Truyền localFileUri (hoặc chuỗi rỗng) thay vì filePath gắn cứng
        filePath: localFileUri ?? "",
        fdfPath: fdfPath || "",
      },
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      if (!localFileUri) {
        Alert.alert("Thông báo", "File chưa được tải về.");
        return;
      }

      const fileName = contractName.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";
      const docDir = (FileSystem as any).documentDirectory as string | undefined;

      if (!docDir) {
        Alert.alert("Thông báo", "Không thể xác định thư mục lưu trữ.");
        return;
      }

      const destUri = `${docDir}${fileName}`;
      await (FileSystem as any).copyAsync({ from: localFileUri, to: destUri });

      Alert.alert("Tải xuống thành công", "Tệp đã được lưu vào bộ nhớ thiết bị.", [
        { text: "OK" },
      ]);
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert(
        "Lỗi tải xuống",
        err instanceof Error ? err.message : "Không thể lưu tệp",
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
        ) : displayUrl ? (
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
        ) : null}
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
