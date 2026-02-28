import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ─── Question Card Component ───────────────────────────────── */
function QuestionCard({
  title,
  answer,
  icon,
}: {
  title: string;
  answer: string;
  icon: string;
}) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon as any} size={20} color="#2092EC" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardAnswer}>{answer}</Text>
    </View>
  );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function CertificateInfoScreen() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(true);

  const handleContinue = () => {
    router.push("/choose-certificate");
  };

  return (
    <View style={styles.container}>
      {/* ── Popup Modal ── */}
      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => router.back()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#FF9800" />
            </View>
            <Text style={styles.modalTitle}>Bạn chưa có chứng thư số</Text>
            <Text style={styles.modalMessage}>
              Vui lòng đăng ký chứng thư số để có thể tiếp tục thao tác ký điện tử.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => router.back()}
              >
                <Text style={styles.modalBtnCancelText}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.modalBtnConfirmText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#1565C0", "#2092EC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chứng thư số</Text>
          <Text style={styles.headerSub}>Kiến thức cơ bản về chữ ký số</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero section ── */}
        <View style={styles.heroSection}>
          <View style={styles.heroCircles}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={60}
                  color="#FFF"
                />
              </View>
            </View>
            {/* Decors */}
            <View style={[styles.miniDot, { top: 0, right: 10, width: 12, height: 12 }]} />
            <View style={[styles.miniDot, { bottom: 15, left: -5, backgroundColor: "#4CAF50" }]} />
          </View>
          <Text style={styles.heroTitle}>Xác thực & Bảo mật</Text>
          <Text style={styles.heroDesc}>
            Chứng thư số là nền tảng cốt lõi giúp giao kết hợp đồng điện tử an toàn và có giá trị pháp lý.
          </Text>
        </View>

        {/* ── FAQ Section ── */}
        <QuestionCard
          icon="help-circle-outline"
          title="Chứng thư số là gì?"
          answer="Là một loại chứng thư điện tử được cấp bởi tổ chức chứng thực (CA) nhằm định danh một cá nhân/tổ chức trên môi trường số."
        />

        <QuestionCard
          icon="signature-freehand"
          title="Chữ ký số là gì?"
          answer="Là một cặp khóa mã hóa dùng để xác nhận giao kết văn bản điện tử, có giá trị pháp lý tương đương chữ ký tay và con dấu."
        />

        {/* ── Benefits Section ── */}
        <View style={styles.benefitsCard}>
          <Text style={styles.sectionTitle}>LỢI ÍCH CỦA CHỨNG THƯ SỐ</Text>

          {[
            { icon: "lock-check-outline", text: "Bảo mật thông tin tuyệt đối" },
            { icon: "gavel", text: "Đầy đủ giá trị pháp lý" },
            { icon: "account-check-outline", text: "Xác thực danh tính chính xác" },
            { icon: "clock-fast", text: "Tiết kiệm thời gian & chi phí" },
          ].map((item, idx) => (
            <View key={idx} style={styles.benefitRow}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={20}
                color="#4CAF50"
              />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#FFB300" />
          <Text style={styles.warningText}>
            Sử dụng chứng thư số của các nhà cung cấp uy tín (CA) để được bảo hộ pháp lý tốt nhất.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Action ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Tiếp tục đăng ký</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  scrollView: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 24,
    paddingHorizontal: 15,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },

  scrollContent: { padding: 20 },

  /* Hero */
  heroSection: { alignItems: "center", marginBottom: 28 },
  heroCircles: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  outerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(32, 146, 236, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#2092EC",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2092EC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  miniDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2092EC",
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#1E293B", marginBottom: 8 },
  heroDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 14,
  },

  /* Question Card */
  questionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EAF4FE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  cardAnswer: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginLeft: 48,
  },

  /* Benefits */
  benefitsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1565C0",
    letterSpacing: 1,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  benefitText: { fontSize: 14, color: "#1E293B", fontWeight: "600" },
warningBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#FFF8E1", borderRadius: 14, padding: 14,
    marginBottom: 14, borderLeftWidth: 3, borderLeftColor: "#FFB300",
  },  warningText: { flex: 1, fontSize: 13, color: "#7A5F00", lineHeight: 20 },

  safetyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF2FE",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  safetyText: { flex: 1, fontSize: 12, color: "#3E6B9A", lineHeight: 18 },

  /* Footer */
  footer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1565C0",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 12,
  },
  startBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "#929292", // Xám đục (opaque gray)
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#F1F5F9",
  },
  modalBtnCancelText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
  modalBtnConfirm: {
    backgroundColor: "#1565C0",
  },
  modalBtnConfirmText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
