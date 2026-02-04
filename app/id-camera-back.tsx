import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

export default function IDCameraBackScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { photoFront } = useLocalSearchParams();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Store the photos and proceed to verification
      setTimeout(() => {
        setIsCapturing(false);
        router.push({
          pathname: "/identity-verified",
          params: { photoFront, photoBack: photo.uri },
        });
      }, 500);
    } catch {
      setIsCapturing(false);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleRetry = () => {
    Alert.alert("Thử lại", "Vui lòng chụp lại mặt sau CCCD");
  };

  if (!permission?.granted) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
        ]}
      >
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={64} color="#FF6B6B" />
          <ThemedText style={styles.permissionText}>
            Cần quyền truy cập camera
          </ThemedText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <ThemedText style={styles.permissionButtonText}>
              Cấp quyền
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <ThemedText type="title" style={{ fontSize: 18, color: "white" }}>
          Chụp mặt sau CCCD
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      {/* Camera Preview Area */}
      <CameraView ref={cameraRef} style={styles.cameraContainer} facing="back">
        {/* Progress Indicator */}
        <View style={styles.progressOverlay}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
          <ThemedText style={styles.progressText}>Bước 2 / 2</ThemedText>
        </View>
        {/* Camera overlay frame */}
        {/* Camera overlay frame */}
        <View style={styles.frameOverlay}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Instruction text */}
        <View style={styles.instructionOverlay}>
          <MaterialCommunityIcons
            name="id-card"
            size={60}
            color="rgba(255, 255, 255, 0.5)"
            style={{ transform: [{ rotateY: "180deg" }] }}
          />
          <ThemedText style={styles.overlayText}>
            Đặt mặt sau CCCD vào khung
          </ThemedText>
        </View>
      </CameraView>

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.guidanceBox}>
          <ThemedText style={styles.guidanceTitle}>Lưu ý:</ThemedText>
          <View style={styles.guidanceItem}>
            <MaterialCommunityIcons
              name="check"
              size={16}
              color="#4CAF50"
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.guidanceText}>
              Đặt thẳng mặt sau CCCD
            </ThemedText>
          </View>
          <View style={styles.guidanceItem}>
            <MaterialCommunityIcons
              name="check"
              size={16}
              color="#4CAF50"
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.guidanceText}>
              Rõ nét toàn bộ thông tin
            </ThemedText>
          </View>
          <View style={styles.guidanceItem}>
            <MaterialCommunityIcons
              name="check"
              size={16}
              color="#4CAF50"
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.guidanceText}>
              Không bị che khuất
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: "white" }]}
            onPress={handleRetry}
          >
            <MaterialCommunityIcons name="refresh" size={24} color="white" />
            <ThemedText style={styles.secondaryButtonText}>Thử lại</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, { opacity: isCapturing ? 0.6 : 1 }]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <View style={styles.captureInner}>
              {!isCapturing ? (
                <MaterialCommunityIcons name="camera" size={32} color="white" />
              ) : (
                <MaterialCommunityIcons
                  name="loading"
                  size={32}
                  color="white"
                />
              )}
            </View>
            <ThemedText style={styles.captureButtonText}>
              {isCapturing ? "Đang chụp..." : "Chụp"}
            </ThemedText>
          </TouchableOpacity>

          <View style={{ width: 80 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  progressOverlay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2196F3",
  },
  progressText: {
    color: "white",
    fontSize: 12,
    textAlign: "right",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  frameOverlay: {
    width: "85%",
    height: "90%",
    borderWidth: 2,
    borderColor: "rgba(33, 196, 243, 0.5)",
    borderRadius: 12,
    position: "absolute",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#21C4F3",
    borderWidth: 2,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  instructionOverlay: {
    alignItems: "center",
    zIndex: 1,
  },
  overlayText: {
    color: "white",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  controlsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  guidanceBox: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  guidanceTitle: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  guidanceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  guidanceText: {
    color: "white",
    fontSize: 12,
    opacity: 0.9,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  secondaryButton: {
    width: 80,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  captureButton: {
    width: 100,
    alignItems: "center",
  },
  captureInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  captureButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
