import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Contract {
  id: string;
  name: string;
  date: string;
  status: "pending" | "signed";
  type: string;
  details: string;
}

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "1",
    name: "Hợp đồng Dịch vụ Tư vấn",
    date: "2025-02-03",
    status: "pending",
    type: "service",
    details: `HỢP ĐỒNG DỊCH VỤ TƯ VẤN

Bên cung cấp dịch vụ: Công ty TNHH Công Nghệ ITECCOM
Bên sử dụng dịch vụ: [Khách hàng]
Ngày lập hợp đồng: 03/02/2025

PHẠM VI DỊCH VỤ:
• Phân tích nhu cầu công nghệ thông tin
• Lập kế hoạch triển khai hệ thống
• Hỗ trợ thực hiện và cài đặt
• Đào tạo đội ngũ nhân sự
• Hỗ trợ kỹ thuật 30 ngày sau triển khai

THỜI HẠN THỰC HIỆN:
• Ngày bắt đầu: 03/02/2025
• Ngày dự kiến hoàn thành: 03/05/2025
• Thời gian hỗ trợ sau: 30 ngày

GIÁ TRỊ HỢP ĐỒNG:
• Tổng chi phí: 50,000,000 VND
• Lần 1: 30% (15,000,000 VND) - Khi ký hợp đồng
• Lần 2: 40% (20,000,000 VND) - Giữa kỳ
• Lần 3: 30% (15,000,000 VND) - Hoàn thành

PHƯƠNG THỨC THANH TOÁN:
• Chuyển khoản ngân hàng
• Tài khoản: [Sẽ cấp sau]`,
  },
  {
    id: "2",
    name: "Hợp đồng Bảo mật Thông tin",
    date: "2025-02-02",
    status: "pending",
    type: "confidentiality",
    details: `HỢP ĐỒNG BẢO MẬT VÀ BẢNG BÍ MẬT THÔNG TIN

Bên tiết lộ thông tin: Công ty TNHH Công Nghệ ITECCOM
Bên tiếp nhận thông tin: [Đối tác]
Ngày lập hợp đồng: 02/02/2025

ĐỊNH NGHĨA THÔNG TIN BẢO MẬT:
• Tài liệu kỹ thuật và thiết kế
• Dữ liệu kinh doanh và danh sách khách hàng
• Quy trình và phương pháp hoạt động
• Thông tin tài chính
• Mọi thông tin đánh dấu là "Bảo mật"

TRÁCH NHIỆM CỦA BÊN TIẾP NHẬN:
• Chỉ tiết lộ cho nhân viên cần thiết
• Nhân viên phải ký cam kết bảo mật
• Không sao chép ngoài lý do kinh doanh
• Sử dụng biện pháp bảo vệ vật lý và kỹ thuật
• Lưu giữ trong môi trường an toàn

THỜI HẠN BẢO MẬT:
• 3 năm sau khi hợp đồng kết thúc
• Hoặc cho tới khi không cần thiết

NGOẠI LỆ:
• Thông tin công khai
• Thông tin yêu cầu công bố theo luật
• Thông tin phát triển độc lập`,
  },
  {
    id: "3",
    name: "Hợp đồng Hợp tác Kinh doanh",
    date: "2025-01-30",
    status: "signed",
    type: "partnership",
    details: `HỢP ĐỒNG HỢP TÁC KINH DOANH

Bên thứ nhất: Công ty TNHH Công Nghệ ITECCOM
Bên thứ hai: [Công ty đối tác]
Ngày lập hợp đồng: 30/01/2025

MỤC ĐÍCH HỢP TÁC:
• Phát triển các sản phẩm công nghệ chung
• Mở rộng thị trường bán hàng
• Chia sẻ chi phí nghiên cứu và phát triển
• Nâng cao chất lượng dịch vụ

PHẠM VI HỢP TÁC:
• Phát triển phần mềm
• Tiếp thị và bán hàng
• Hỗ trợ kỹ thuật và bảo trì

CHIA SẺ LỢI NHUẬN:
• Công ty ITECCOM: 50%
• Công ty đối tác: 50%
• Các chi phí chung chia 50%-50%

QUẢN LÝ DỰ ÁN:
• Ban Quản lý: 4 thành viên (2 từ mỗi bên)
• Họp định kỳ tối thiểu 1 lần/tháng
• Quyết định theo đa số

THỜI HẠN HỢP ĐỒNG:
• Bắt đầu: 30/01/2025
• Kết thúc: 30/01/2027
• Có thể gia hạn bằng thỏa thuận

CHẤM DỨT SỚM:
• Thông báo trước 60 ngày
• Thanh toán chi phí phát sinh
• Chia tài sản chung theo thỏa thuận`,
  },
];

export default function ContractDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { contractId } = useLocalSearchParams();
  const [agreed, setAgreed] = useState(false);

  const contract = MOCK_CONTRACTS.find((c) => c.id === contractId) ?? {
    id: "-",
    name: "Hợp đồng không tìm thấy",
    date: "",
    status: "pending",
    type: "",
    details: "Không có nội dung hợp đồng",
  };

  const handleStartSigning = () => {
    if (!agreed) return;
    router.push({ pathname: "/certificate-info", params: { contractId } });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={isDark ? "#FFF" : "#000"}
          />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.title}>{contract.name}</ThemedText>
      </View>

      <ThemedText style={styles.meta}>Ngày: {contract.date}</ThemedText>

      <View style={[styles.contractBox, { backgroundColor: isDark ? "#10232A" : "#FAFBFD" }]}>
        <ThemedText style={styles.contractContent}>
          {contract.details}
        </ThemedText>
      </View>

      <View style={styles.checkboxRow}>
        <TouchableOpacity
          onPress={() => setAgreed((s) => !s)}
          style={styles.checkboxWrapper}
        >
          <View style={[styles.checkbox, agreed ? styles.checkboxChecked : undefined, { borderColor: isDark ? "#FFF" : "#000" }]}>
            {agreed && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
          </View>
        </TouchableOpacity>
        <View style={styles.checkboxLabelWrapper}>
  <ThemedText style={styles.checkboxLabelStart}>
    Tôi đã đọc và đồng ý với các{" "}
  </ThemedText>

  <TouchableOpacity
    onPress={() =>
      router.push({
        pathname: "/contract-content",
        params: { contractId },
      })
    }
    activeOpacity={0.7}
  >
    <ThemedText
      style={[
        styles.checkboxLabelLink,
        { color: isDark ? "#00AAFF" : "#007AFF" },
      ]}
    >
      điều khoản
    </ThemedText>
  </TouchableOpacity>

  <ThemedText style={styles.checkboxLabelEnd}>
    {" "}của hợp đồng
  </ThemedText>
</View>

      </View>

      <TouchableOpacity
        style={[styles.signButton, { backgroundColor: agreed ? "#2092EC" : "#A8D8F0" }]}
        onPress={handleStartSigning}
        disabled={!agreed}
      >
        <ThemedText style={styles.signButtonText}>Bắt đầu ký số</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: "700", flex: 1 },
  meta: { marginBottom: 12, color: "#6B7280" },
  contractBox: { borderRadius: 12, padding: 16, marginBottom: 16 },
  contractContent: { fontSize: 15, lineHeight: 22 },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20 },
  checkboxWrapper: { marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#2092EC", borderColor: "#2092EC" },
  checkboxLabelWrapper: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  checkboxLabelStart: { fontSize: 15 },
  checkboxLabelLink: { fontSize: 15, fontWeight: "600", textDecorationLine: "underline" },
  checkboxLabelEnd: { fontSize: 15 },
  signButton: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  signButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
