import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Alert,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleRegister = () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    Alert.alert("Thành công", "Đăng ký thành công!");
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/ThemeLogin.png")}
        style={styles.backgroundImageFull}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.headerBackground}>
              <Image
                source={require("@/assets/images/Logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Register Form */}
            <View style={styles.formContainer}>
              <View
                style={[
                  styles.loginBox,
                  {
                    backgroundColor: isDark ? "#1D3D47" : "#E0F7FF",
                  },
                ]}
              >
                {/* Title */}
                <ThemedText style={styles.title}>
                  ĐĂNG KÝ TÀI KHOẢN
                </ThemedText>

                {/* Email */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#2D4D57" : "#FFF",
                        color: isDark ? "#FFF" : "#000",
                      },
                    ]}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                  />
                </View>

                {/* Phone */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={phoneRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#2D4D57" : "#FFF",
                        color: isDark ? "#FFF" : "#000",
                      },
                    ]}
                    placeholder="Số điện thoại"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      ref={passwordRef}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        {
                          backgroundColor: isDark ? "#2D4D57" : "#FFF",
                          color: isDark ? "#FFF" : "#000",
                        },
                      ]}
                      placeholder="Mật khẩu"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#007AFF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={confirmPasswordRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#2D4D57" : "#FFF",
                        color: isDark ? "#FFF" : "#000",
                      },
                    ]}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>

                {/* Register Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleRegister}
                >
                  <ThemedText style={styles.loginButtonText}>
                    Đăng ký
                  </ThemedText>
                </TouchableOpacity>

                {/* Back to Login */}
                <View style={styles.signUpContainer}>
                  <ThemedText style={styles.signUpText}>
                    Đã có tài khoản?{" "}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText style={styles.signUpLink}>
                      Đăng nhập
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      <View style={[styles.footerContainer, { bottom: 10 + insets.bottom }]} pointerEvents="none">
              <ThemedText style={styles.econTractsText}>ECONTRACTS</ThemedText>
            </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImageFull: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  headerBackground: { padding: 40 },
  logo: { width: 100, height: 60 },
  formContainer: { paddingHorizontal: 20 },
  loginBox: { borderRadius: 24, padding: 24 },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#007AFF",
  },
  inputWrapper: { marginBottom: 16 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordInputContainer: { position: "relative" },
  passwordInput: { paddingRight: 45 },
  eyeIcon: { position: "absolute", right: 12, top: 12 },
  loginButton: {
    backgroundColor: "#00A8E8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  signUpContainer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  signUpText: { fontSize: 14 },
  signUpLink: { color: "#FF6B6B", fontWeight: "600" },
footerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 0,
    zIndex: 999,
    elevation: 999,
  },
  econTractsText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: 2,
  },

});
