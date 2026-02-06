import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
// import { usePhoneStore } from "@/store/phoneStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

export default function HomeScreen() {
  // const phoneNumber = usePhoneStore((state) => state.phoneNumber);
  // const setPhoneNumber = usePhoneStore((state) => state.setPhoneNumber);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  return (
    <ScrollView
      style={[
        styles.scrollContainer,
        { backgroundColor: isDark ? "#0D1B23" : "#F8FAFB" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Navigation Bar */}
      <View
        style={[
          styles.topNav,
          { backgroundColor: isDark ? "#062329" : "#FFFFFF" },
        ]}
      >
        <TouchableOpacity onPress={() => router.push("/")}>
          <MaterialCommunityIcons
            name="menu"
            size={22}
            color={isDark ? "#FFF" : "#111"}
          />
        </TouchableOpacity>
        <ThemedText
          style={[styles.topNavTitle, { color: isDark ? "#FFF" : "#111" }]}
        >
          ECONTRACTS
        </ThemedText>
        <TouchableOpacity onPress={() => router.push("../login")}>
          <MaterialCommunityIcons
            name="account-circle"
            size={24}
            color={isDark ? "#FFF" : "#111"}
          />
        </TouchableOpacity>
      </View>
      {/* Header */}
      <View style={styles.headerBackground}>
  <View style={styles.headerCard}>

    <ImageBackground
      source={require("@/assets/images/ThemeLogin.png")}
      style={{ flex: 1 }}
      imageStyle={{ borderRadius: 28 }}
    >
      <LinearGradient
        colors={[
          "rgba(10,124,134,0.65)",
          "rgba(10,124,134,0.25)"
        ]}
        style={styles.headerOverlay}
      >

        <View style={{ marginTop: 30 }}>
          <ThemedText style={styles.greetText}>
            {getGreeting()} 🌤️
          </ThemedText>

          <ThemedText style={styles.greetName}>
            LE THI THU UYEN
          </ThemedText>
        </View>

      </LinearGradient>
    </ImageBackground>

  </View>
</View>



      {/* Main Content */}
      <View style={styles.contentContainer}>
       
<ThemedText type="subtitle" style={styles.sectionTitle}>
            Nổi bật
          </ThemedText>
        {/* Contracts Section */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.contractCard,
            {
              backgroundColor: isDark ? "#1D3D47" : "#FFF5E5",
              borderLeftColor: "#FF9800",
            },
          ]}
          onPress={() => router.push("/contracts")}
          activeOpacity={0.8}
        >
          <View style={styles.contractHeader}>
            
            <View
              style={[
                styles.contractIconBg,
                { backgroundColor: "rgba(255, 152, 0, 0.1)" },
              ]}
            >
              <MaterialCommunityIcons
                name="file-document-multiple"
                size={32}
                color="#FF9800"
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle" style={styles.contractTitle}>
                Hợp Đồng Cần Ký
              </ThemedText>
              <ThemedText style={styles.contractSubtitle}>
                2 hợp đồng chờ xử lý
              </ThemedText>
            </View>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>2</ThemedText>
            </View>
          </View>

          <View style={styles.contractFooter}>
            <ThemedText style={styles.contractAction}>
              Nhấn để xem và ký hợp đồng
            </ThemedText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={isDark ? "#007AFF" : "#FF9800"}
            />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Thao Tác Nhanh
          </ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? "#243447" : "#F0E5FF" },
              ]}
              onPress={() => alert("Tính năng sẽ cập nhật sớm")}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={28}
                color={isDark ? "#7C4DFF" : "#7C4DFF"}
              />
              <ThemedText style={styles.actionText}>Thông Báo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? "#243447" : "#FFE5F0" },
              ]}
              onPress={() => alert("Tính năng sẽ cập nhật sớm")}
            >
              <MaterialCommunityIcons
                name="history"
                size={28}
                color={isDark ? "#FF4081" : "#FF4081"}
              />
              <ThemedText style={styles.actionText}>Lịch Sử</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? "#243447" : "#E5F5E3" },
              ]}
              onPress={() => alert("Tính năng sẽ cập nhật sớm")}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={28}
                color={isDark ? "#4CAF50" : "#4CAF50"}
              />
              <ThemedText style={styles.actionText}>Cài Đặt</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? "#243447" : "#F0E5FF" },
          ]}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={isDark ? "#7C4DFF" : "#7C4DFF"}
          />
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.infoCardTitle, { marginLeft: 12 }]}>
              Mẹo Hữu Ích
            </ThemedText>
            <ThemedText style={styles.infoCardText}>
              Quản lý hợp đồng và ký kỹ thuật số một cách dễ dàng với hệ thống
              E-Contact
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  headerBackground: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 16,

    paddingBottom: 40,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topNav: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0,
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerCard: {
  height: 220,
  borderRadius: 28,
  overflow: "hidden",
},

headerOverlay: {
  flex: 1,
  padding: 20,
  paddingTop: 50,
},

greetText: {
  color: "rgba(255,255,255,0.9)",
  fontSize: 14,
},

greetName: {
  color: "white",
  fontSize: 20,
  fontWeight: "800",
},

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: "System",
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  contractCard: {
    borderLeftWidth: 4,
  },
  loginCard: {
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  contractHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contractIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  contractSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  badge: {
    backgroundColor: "#FF9800",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  contractFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  contractAction: {
    fontSize: 13,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    width: "48%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  infoCardText: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
});
