import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function IDCameraBackScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { photoFront } = useLocalSearchParams();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Prepare form data
      const formData = new FormData();

      // Append front image handling from params
      if (photoFront) {
        const frontUri = Array.isArray(photoFront) ? photoFront[0] : photoFront;
        const frontFileName = frontUri.split('/').pop() || 'front.jpg';
        const frontMatch = /\.(\w+)$/.exec(frontFileName);
        const frontType = frontMatch ? `image/${frontMatch[1]}` : `image/jpeg`;

        formData.append('frontImage', {
          uri: frontUri,
          name: frontFileName,
          type: frontType,
        } as any);
      }

      // Append back image handling from current capture
      const backUri = photo.uri;
      const backFileName = backUri.split('/').pop() || 'back.jpg';
      const backMatch = /\.(\w+)$/.exec(backFileName);
      const backType = backMatch ? `image/${backMatch[1]}` : `image/jpeg`;

      formData.append('backImage', {
        uri: backUri,
        name: backFileName,
        type: backType,
      } as any);

      // Hardcoded accountId as requested
      // Replace this GUID with the actual account ID you want to use
      const HARDCODED_ACCOUNT_ID = '3f2a9c4e-8d7b-4c91-a2f1-6e5b8a0d9c21';
      formData.append('accountId', HARDCODED_ACCOUNT_ID);

      setVerifying(true); // Show verifying overlay

      // Upload to API
      // Note: switched to http for port 5000 (standard for .NET Core non-SSL dev)
      // If you MUST use https, ensure the certificate is trusted or proper exclusions are set.
      const response = await axios.post('http://192.168.1.147:5000/api/imageid', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert("Thành công", response.data.message || "Upload CCCD thành công", [
          {
            text: "OK",
            onPress: () => {
              setVerifying(false);
              setIsCapturing(false);
              router.push({
                pathname: "/id-information",
                params: { photoFront, photoBack: photo.uri },
              });
            }
          }
        ]);
      } else {
        throw new Error('Upload failed');
      }

    } catch (error: any) {
      console.error("Upload error details:", error);
      setIsCapturing(false);
      setVerifying(false);

      let errorMessage = "Không thể gửi ảnh. Vui lòng kiểm tra kết nối mạng và thử lại.";
      if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng (Network Error).\n\n1. Kiểm tra IP Server/Port.\n2. Đảm bảo Server đang chạy (Binding 0.0.0.0).\n3. Tắt Firewall trên Server.\n4. Đảm bảo điện thoại chung WiFi.";
      } else if (error.response) {
        errorMessage = `Lỗi Server: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
      }

      Alert.alert("Lỗi Upload", errorMessage);
      setIsCapturing(false);
      setVerifying(false);
      Alert.alert("Lỗi", "Không thể gửi ảnh. Vui lòng kiểm tra kết nối mạng và thử lại.");
    }
  };

  const handleRetry = () => {
    router.back();
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
          <View style={styles.permissionIconContainer}>
            <MaterialCommunityIcons
              name="camera-off"
              size={80}
              color="#FF6B6B"
            />
          </View>
          <ThemedText style={styles.permissionTitle}>
            Cần quyền truy cập camera
          </ThemedText>
          <ThemedText style={styles.permissionSubtitle}>
            Để có thể chụp ảnh CCCD của bạn
          </ThemedText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <ThemedText style={styles.permissionButtonText}>
              Cấp quyền camera
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <ThemedText type="title" style={styles.headerTitle}>
            Chụp mặt sau CCCD
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>Bước 2/2</ThemedText>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* Camera Preview Area */}
      <CameraView ref={cameraRef} style={styles.cameraContainer} facing="back">
        {/* Darkened area outside frame */}
        <View style={styles.darkOverlay} />

        {/* Camera overlay frame */}
        <View style={styles.frameOverlay}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Instruction text */}
          <View style={styles.instructionOverlay}>
            <MaterialCommunityIcons
              name="id-card"
              size={80}
              color="rgba(255, 255, 255, 0.4)"
              style={{ transform: [{ rotateY: "180deg" }] }}
            />
            <ThemedText style={styles.overlayText}>
              Đặt mặt sau vào khung
            </ThemedText>
            <ThemedText style={styles.overlaySubtext}>
              Đảm bảo rõ nét và không bị che
            </ThemedText>
          </View>
        </View>
      </CameraView>

      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.guidanceBox}>
          <View style={styles.guidanceTitleContainer}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#21C4F3"
              style={{ marginRight: 8 }}
            />
            <ThemedText style={styles.guidanceTitle}>Hướng dẫn chụp</ThemedText>
          </View>
          <View style={styles.guidanceItem}>
            <View style={styles.guidanceCheckmark}>
              <MaterialCommunityIcons
                name="check-bold"
                size={12}
                color="white"
              />
            </View>
            <ThemedText style={styles.guidanceText}>
              Đặt thẳng mặt sau CCCD
            </ThemedText>
          </View>
          <View style={styles.guidanceItem}>
            <View style={styles.guidanceCheckmark}>
              <MaterialCommunityIcons
                name="check-bold"
                size={12}
                color="white"
              />
            </View>
            <ThemedText style={styles.guidanceText}>
              Rõ nét toàn bộ thông tin
            </ThemedText>
          </View>
          <View style={styles.guidanceItem}>
            <View style={styles.guidanceCheckmark}>
              <MaterialCommunityIcons
                name="check-bold"
                size={12}
                color="white"
              />
            </View>
            <ThemedText style={styles.guidanceText}>
              Không bị che khuất
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRetry}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#21C4F3"
            />
            <ThemedText style={styles.secondaryButtonText}>Quay lại</ThemedText>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.captureButtonWrapper,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <TouchableOpacity
              style={[styles.captureButton, { opacity: isCapturing ? 0.8 : 1 }]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              {!isCapturing ? (
                <MaterialCommunityIcons name="camera" size={36} color="white" />
              ) : (
                <MaterialCommunityIcons
                  name="loading"
                  size={36}
                  color="white"
                />
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={{ width: 80 }} />
        </View>
      </View>
      {verifying && (
        <View style={styles.verifyingOverlay} pointerEvents="none">
          <View style={styles.verifyingBox}>
            <ActivityIndicator size="large" color="#21C4F3" />
            <ThemedText style={styles.verifyingText}>Đang xác thực thông tin...</ThemedText>
          </View>
        </View>
      )}
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
    paddingHorizontal: 24,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  permissionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#21C4F3",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#21C4F3",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  verifyingBox: {
    width: 240,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  verifyingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(33, 196, 243, 0.2)",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  darkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  frameOverlay: {
    width: "90%",
    aspectRatio: 1.5,
    borderWidth: 2.5,
    borderColor: "#21C4F3",
    borderRadius: 16,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#21C4F3",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#21C4F3",
    borderWidth: 3,
  },
  topLeft: {
    top: -6,
    left: -6,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: -6,
    right: -6,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: -6,
    left: -6,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: -6,
    right: -6,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 16,
  },
  instructionOverlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  overlaySubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  controlsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 28,
  },
  guidanceBox: {
    backgroundColor: "rgba(33, 196, 243, 0.08)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#21C4F3",
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(33, 196, 243, 0.2)",
    borderRightColor: "rgba(33, 196, 243, 0.2)",
    borderBottomColor: "rgba(33, 196, 243, 0.2)",
  },
  guidanceTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  guidanceTitle: {
    color: "#21C4F3",
    fontSize: 14,
    fontWeight: "700",
  },
  guidanceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  guidanceCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#21C4F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  guidanceText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    opacity: 0.9,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  secondaryButton: {
    width: 80,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#21C4F3",
    backgroundColor: "rgba(33, 196, 243, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#21C4F3",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  captureButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#21C4F3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#21C4F3",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  captureButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});
