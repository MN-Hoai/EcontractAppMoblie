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

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);
  const [lang, setLang] = useState<"vi" | "en">("vi");

  const handleLogin = () => {
    if (!idNumber.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    router.push("/(tabs)");
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Quên Mật Khẩu",
      "Chức năng này sẽ được thêm trong phiên bản tiếp theo",
    );
  };

  const handleSignUp = () => {
  router.push("/register");
};


  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/ThemeLogin.png")}
        style={styles.backgroundImageFull}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.headerBackground}>
              {/* Logo Container */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/images/Logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Language Selector */}
              <TouchableOpacity
                style={styles.languageSelector}
                onPress={() => setLang((s) => (s === "vi" ? "en" : "vi"))}
              >
                <MaterialCommunityIcons name="translate" size={20} color="#FFF" />
                <ThemedText style={styles.languageText}>
                  {lang === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Login Form Container */}
            <View style={styles.formContainer}>
              <View
                style={[
                  styles.loginBox,
                  {
                    backgroundColor: isDark ? "#1D3D47" : "#E0F7FF",
                    shadowColor: isDark ? "#000" : "#00000015",
                    marginTop: "20%",
                  },
                ]}
              >
                {/* ID Number Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#2D4D57" : "#FFFFFF",
                        color: isDark ? "#FFF" : "#000",
                      },
                    ]}
                    placeholder="Nhập Email"
                    placeholderTextColor={isDark ? "#999" : "#999"}
                    value={idNumber}
                    onChangeText={setIdNumber}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      ref={passwordInputRef}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        {
                          backgroundColor: isDark ? "#2D4D57" : "#FFFFFF",
                          color: isDark ? "#FFF" : "#000",
                        },
                      ]}
                      placeholder="Mật khẩu"
                      placeholderTextColor={isDark ? "#999" : "#999"}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color={isDark ? "#00AAFF" : "#007AFF"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={handleForgotPassword}
                >
                  <ThemedText style={styles.forgotPasswordText}>
                    Quên mật khẩu?
                  </ThemedText>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.loginButtonText}>
                    Đăng nhập
                  </ThemedText>
                </TouchableOpacity>

                {/* Sign Up Text */}
                <View style={styles.signUpContainer}>
                  <ThemedText
                    style={[
                      styles.signUpText,
                      { color: isDark ? "#BBB" : "#666" },
                    ]}
                  >
                    Bạn chưa có tài khoản?{" "}
                  </ThemedText>
                  <TouchableOpacity onPress={handleSignUp}>
                    <ThemedText style={styles.signUpLink}>
                      Đăng ký ngay
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
  backgroundImageFull: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backgroundImage: {
    width: "100%",
    height: "120%",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerBackground: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  logo: {
    width: 100,
    height: 60,
  },
  logoPlaceholder: {
    width: 100,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(163, 163, 163, 0.393)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  languageSelector: {
    position: "absolute",
    right: 20,
    top: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    paddingLeft: 10,
    paddingRight: 10,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  languageText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  loginBox: {
    borderRadius: 24,
    padding: 24,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 0,
  },
  passwordInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#00A8E8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
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
