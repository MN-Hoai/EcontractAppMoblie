import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  fullContent: string;
}

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "1",
    name: "Hợp đồng Dịch vụ Tư vấn",
    date: "2025-02-03",
    status: "pending",
    type: "service",
    fullContent: `HỢP ĐỒNG DỊCH VỤ TƯ VẤN

Ngày lập: 03 tháng 02 năm 2025

CÁC BÊN THAM GIA HỢP ĐỒNG:
1. Bên cung cấp dịch vụ: Công ty TNHH Công Nghệ ITECCOM
   Địa chỉ: TP.Hồ Chí Minh, Việt Nam
   Người đại diện: ........................

2. Bên sử dụng dịch vụ: ........................
   Địa chỉ: ........................
   Người đại diện: ........................

PHẦN I: CÁC ĐIỀU KHOẢN CHUNG

ĐIỀU 1: MỤC ĐÍCH CỦA HỢP ĐỒNG
Hợp đồng này được lập với mục đích xác định quyền, nghĩa vụ và trách nhiệm của các bên trong việc cung cấp và sử dụng dịch vụ tư vấn về công nghệ thông tin.

ĐIỀU 2: PHẠM VI DỊCH VỤ
Bên cung cấp dịch vụ cam kết cung cấp các dịch vụ sau:
- Phân tích nhu cầu công nghệ thông tin của bên sử dụng
- Lập kế hoạch triển khai hệ thống
- Hỗ trợ thực hiện và cài đặt
- Đào tạo đội ngũ nhân sự
- Hỗ trợ kỹ thuật trong 30 ngày sau triển khai

ĐIỀU 3: THỜI HẠN THỰC HIỆN
- Thời gian bắt đầu: 03/02/2025
- Thời gian dự kiến hoàn thành: 03/05/2025
- Thời gian hỗ trợ sau: 30 ngày

PHẦN II: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN

ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN CUNG CẤP DỊCH VỤ
Quyền:
- Được thanh toán đầy đủ theo các mốc thời gian quy định
- Được yêu cầu bảo mật thông tin dự án

Nghĩa vụ:
- Cung cấp dịch vụ theo đúng chất lượng và tiến độ
- Tuân thủ các quy định về bảo mật thông tin
- Cung cấp báo cáo tiến độ định kỳ

ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN SỬ DỤNG DỊCH VỤ
Quyền:
- Được nhận dịch vụ đúng chất lượng
- Được yêu cầu hỗ trợ kỹ thuật

Nghĩa vụ:
- Thanh toán đầy đủ theo hợp đồng
- Cung cấp thông tin cần thiết
- Cử nhân sự hợp tác với bên cung cấp

PHẦN III: ĐIỀU KIỆN THANH TOÁN

ĐIỀU 6: GIÁ CẢ VÀ THANH TOÁN
Tổng giá trị hợp đồng: 50,000,000 VND (Năm mươi triệu đồng)
(Giá này là cuối cùng, chưa bao gồm thuế VAT nếu có)

Phương thức thanh toán:
- Lần 1: 30% (15,000,000 VND) - Khi ký hợp đồng
- Lần 2: 40% (20,000,000 VND) - Giữa kỳ (khi hoàn thành 50% dự án)
- Lần 3: 30% (15,000,000 VND) - Khi hoàn thành dự án

Tài khoản nhận thanh toán:
Ngân hàng: ........................
Chủ tài khoản: Công ty TNHH Công Nghệ ITECCOM
Số tài khoản: ........................

PHẦN IV: ĐIỀU KHOẢN BẢO MẬT

ĐIỀU 7: BẢNG MẬT THÔNG TIN
- Các bên cam kết giữ bí mật tất cả thông tin liên quan đến dự án
- Không được công bố hoặc chia sẻ thông tin cho bên thứ ba
- Thời hạn bảo mật kéo dài 3 năm sau khi hợp đồng kết thúc

PHẦN V: HỒ SƠ CÓ LIÊN QUAN

ĐIỀU 8: SỬ DỤNG CÁC HỒ SƠ
- Bên cung cấp dịch vụ sẽ cung cấp hồ sơ, tài liệu kỹ thuật khi hoàn thành
- Bên sử dụng dịch vụ được quyền sử dụng các hồ sơ này cho mục đích kinh doanh

PHẦN VI: BỒI THƯỜNG VÀ XỬ LÝ VI PHẠM

ĐIỀU 9: XỬ LÝ VI PHẠM HỢP ĐỒNG
Nếu một bên vi phạm các điều khoản của hợp đồng:
- Bên bị vi phạm có quyền yêu cầu bên vi phạm sửa chữa
- Nếu không sửa chữa trong 15 ngày, bên bị vi phạm có quyền hủy hợp đồng
- Bên vi phạm phải bồi thường thiệt hại cho bên bị ảnh hưởng

PHẦN VII: ĐIỀU KHOẢN CHUNG

ĐIỀU 10: HIỆU LỰC CỦA HỢP ĐỒNG
- Hợp đồng có hiệu lực từ ngày ký cho tới khi các bên hoàn thành toàn bộ nghĩa vụ
- Hợp đồng được ký bằng mực hay chữ ký điện tử đều có hiệu lực pháp lý

ĐIỀU 11: CHẤM DỨT HỢP ĐỒNG
- Hợp đồng kết thúc khi tất cả dịch vụ hoàn thành và thanh toán đầy đủ
- Một bên có thể chấm dứt sớm với thông báo trước 30 ngày và thanh toán các chi phí phát sinh

ĐIỀU 12: LUẬT ÁP DỤNG
Hợp đồng này được điều chỉnh bởi pháp luật của nước Cộng hòa Xã hội chủ nghĩa Việt Nam.`,
  },
  {
    id: "2",
    name: "Hợp đồng Bảo mật Thông tin",
    date: "2025-02-02",
    status: "pending",
    type: "confidentiality",
    fullContent: `HỢP ĐỒNG BẢO MẬT VÀ BẢNG BÍ MẬT THÔNG TIN

Ngày lập: 02 tháng 02 năm 2025

CÁC BÊN THAM GIA:
1. Bên tiết lộ thông tin: Công ty TNHH Công Nghệ ITECCOM
   Địa chỉ: TP.Hồ Chí Minh, Việt Nam

2. Bên tiếp nhận thông tin: ........................
   Địa chỉ: ........................

PHẦN I: ĐỊNH NGHĨA VÀ PHẠM VI

ĐIỀU 1: ĐỊNH NGHĨA THÔNG TIN BẢO MẬT
Thông tin bảo mật bao gồm:
- Bản thiết kế và tài liệu kỹ thuật
- Dữ liệu kinh doanh và danh sách khách hàng
- Quy trình và phương pháp hoạt động
- Thông tin tài chính
- Bất kỳ thông tin nào được cung cấp và đánh dấu là "Bảo mật" hoặc "Tối mật"

ĐIỀU 2: NGOẠI LỆ CỦA THÔNG TIN BẢO MẬT
Thông tin không được bảo mật bao gồm:
- Thông tin công khai hoặc đã công bố
- Thông tin được nhận từ bên thứ ba mà không có giới hạn về bảo mật
- Thông tin phát triển độc lập mà không sử dụng thông tin bảo mật
- Thông tin yêu cầu công khai theo luật pháp

PHẦN II: TRÁCH NHIỆM CỦA BÊN TIẾP NHẬN

ĐIỀU 3: GIỚI HẠN TIẾP CẬP THÔNG TIN
Bên tiếp nhận thông tin cam kết:
- Chỉ tiết lộ thông tin cho những nhân viên cần thiết
- Những nhân viên phải ký cam kết bảo mật
- Không sao chép hoặc ghi lại thông tin ngoài lý do kinh doanh hợp lệ

ĐIỀU 4: BẢO VỆ THÔNG TIN
- Sử dụng các biện pháp bảo vệ vật lý, kỹ thuật và hành chính
- Lưu giữ thông tin trong môi trường an toàn
- Kiểm tra định kỳ để đảm bảo bảo mật

ĐIỀU 5: PHƯƠNG TIỆN TRUYỀN THÔNG
Nếu truyền thông qua mạng điện tử, bên tiếp nhận phải:
- Sử dụng mã hóa mạnh (tối thiểu 256-bit)
- Xác thực người dùng
- Kiểm toán truy cập

PHẦN III: THỜI HẠN BẢO MẬT

ĐIỀU 6: THỜI GIAN BẢO MẬT
- Thông tin bảo mật phải được bảo mật trong vòng 3 năm sau khi hợp đồng kết thúc
- Hoặc cho tới khi thông tin không còn cần thiết cho mục đích kinh doanh

ĐIỀU 7: HỦY BỎ THÔNG TIN
Khi kết thúc hợp tác, bên tiếp nhận phải:
- Trả lại hoặc hủy bỏ toàn bộ thông tin bảo mật
- Cung cấp chứng chỉ xác nhận hủy bỏ
- Giữ lại bản sao nếu yêu cầu pháp luật (nhưng vẫn giữ bảo mật)

PHẦN IV: XÁCH VI PHẠM

ĐIỀU 8: THÔNG BÁO VI PHẠM
- Nếu phát hiện rò rỉ, bên tiếp nhận phải thông báo ngay trong 24 giờ
- Phải cung cấp chi tiết về vi phạm
- Phải mô tả hành động khắc phục

ĐIỀU 9: HÊ QUẢ CỦA VI PHẠM
- Bồi thường thiệt hại thực tế
- Mức bồi thường tối đa: 200,000,000 VND
- Bên bị vi phạm có quyền khởi kiện tại tòa án

PHẦN V: ĐIỀU KHOẢN CUỐI

ĐIỀU 10: LUẬT ÁP DỤNG
Hợp đồng này được điều chỉnh bởi pháp luật nước Cộng hòa Xã hội chủ nghĩa Việt Nam.`,
  },
  {
    id: "3",
    name: "Hợp đồng Hợp tác Kinh doanh",
    date: "2025-01-30",
    status: "signed",
    type: "partnership",
    fullContent: `HỢP ĐỒNG HỢP TÁC KINH DOANH

Ngày lập: 30 tháng 01 năm 2025

CÁC BÊN THAM GIA:
1. Công ty TNHH Công Nghệ ITECCOM
   Địa chỉ: TP.Hồ Chí Minh, Việt Nam
   Người đại diện: ........................

2. ........................
   Địa chỉ: ........................
   Người đại diện: ........................

PHẦN I: THỎA THUẬN HỢP TÁC

ĐIỀU 1: TUYÊN BỐ CHUNG
Các bên thống nhất hợp tác để phát triển và kinh doanh sản phẩm công nghệ, tạo ra giá trị chung cho cả hai bên.

ĐIỀU 2: MỤC ĐÍCH HỢP TÁC
- Phát triển sản phẩm phần mềm mới
- Mở rộng thị trường bán hàng
- Chia sẻ chi phí nghiên cứu và phát triển
- Nâng cao chất lượng dịch vụ cho khách hàng

PHẦN II: PHẠM VI HỢPTÁC

ĐIỀU 3: CÁC LĨNH VỰC HỢP TÁC
a) Phát triển sản phẩm:
   - Thiết kế kiến trúc phần mềm
   - Lập trình và kiểm thử
   - Tối ưu hóa hiệu năng

b) Thị trường và bán hàng:
   - Tiếp thị sản phẩm
   - Bán hàng trực tiếp
   - Hỗ trợ khách hàng

c) Hỗ trợ kỹ thuật:
   - Quản lý cơ sở dữ liệu
   - Bảo trì hệ thống
   - Cập nhật và nâng cấp

PHẦN III: QUYỀN VÀ NGHĨA VỤ

ĐIỀU 4: QUYỀN CỦA CÁC BÊN
- Được hưởng lợi từ sản phẩm chung
- Được tham gia quyết định chiến lược
- Được tiếp cận thông tin kinh doanh

ĐIỀU 5: NGHĨA VỤ CỦA CÁC BÊN
- Cung cấp tài nguyên nhân lực và tài chính
- Tuân thủ các tiêu chuẩn chất lượng
- Báo cáo định kỳ về tiến độ

PHẦN IV: CHIA SẺ LỢINHUẬN

ĐIỀU 6: CÁC MỨC DOANH THU VÀ CHIA SẺ
- Tổng doanh thu từ sản phẩm: [Được xác định sau]
- Công ty ITECCOM: 50%
- Công ty đối tác: 50%

ĐIỀU 7: CHI PHÍ HOẠT ĐỘNG
Các chi phí chung (máy chủ, bảo trì, v.v.) được chia đều 50%-50% giữa hai bên.

PHẦN V: QUẢN LÝ VÀ HOẠT ĐỘNG

ĐIỀU 8: BAN QUẢN LÝ HỢPTÁC
- Thành lập Ban Quản lý gồm 4 thành viên (2 từ mỗi bên)
- Ban họp tối thiểu 1 lần/tháng
- Quyết định theo đa số

ĐIỀU 9: TRÁCH NHIỆM QUẢN LÝ
Ban Quản lý chịu trách nhiệm:
- Giám sát tiến độ dự án
- Phê duyệt chi phí lớn
- Giải quyết tranh chấp

PHẦN VI: ĐIỀU KHOẢN CHUNG

ĐIỀU 10: THỜI HẠN HỢP TÁC
- Bắt đầu: 30/01/2025
- Kết thúc: 30/01/2027
- Có thể gia hạn bằng thỏa thuận văn bản

ĐIỀU 11: CHẤM DỨT SỚM
- Một bên có thể chấm dứt với thông báo trước 60 ngày
- Phải thanh toán chi phí phát sinh
- Tài sản chung được chia theo thỏa thuận

ĐIỀU 12: LUẬT ÁP DỤNG VÀ GIẢI QUYẾT TRANH CHẤP
- Hợp đồng được điều chỉnh bởi pháp luật Việt Nam
- Tranh chấp được giải quyết thông qua hòa giải hoặc trọng tài`,
  },
];


export default function ContractContentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { contractId } = useLocalSearchParams();
const contract = MOCK_CONTRACTS.find(c => c.id === contractId);
if (!contract) {
  return (
    <View style={{ padding: 20 }}>
      <ThemedText>Không tìm thấy hợp đồng</ThemedText>
    </View>
  );
}

  const COMMON_TERMS = `ĐIỀU KHOẢN CHUNG CỦA HỢP ĐỒNG

PHẦN I: CÁC ĐỊNH NGHĨA

ĐIỀU 1: ĐỊNH NGHĨA CÁC BÊNII
- "Công ty": Công ty TNHH Công Nghệ ITECCOM
- "Khách hàng": Bên ký hợp đồng với Công ty
- "Dịch vụ": Các dịch vụ được nêu rõ trong hợp đồng cụ thể

ĐIỀU 2: GIẢI THÍCH HỢP ĐỒNG
Hợp đồng này bao gồm các điều khoản chung này và các điều khoản cụ thể của từng loại hợp đồng.
Nếu có mâu thuẫn, điều khoản cụ thể sẽ ưu tiên.

PHẦN II: QUYỀN VÀ NGHĨA VỤ CHUNG

ĐIỀU 3: CAM KẾT CỦA CÔNG TY
- Cung cấp dịch vụ theo chất lượng cao nhất
- Tôn trọng quyền riêng tư của khách hàng
- Cung cấp báo cáo tiến độ định kỳ
- Hỗ trợ kỹ thuật trong thời gian quy định

ĐIỀU 4: CAM KẾT CỦA KHÁCH HÀNG
- Thanh toán đầy đủ và đúng hạn
- Cung cấp thông tin cần thiết cho dịch vụ
- Cử nhân sự để phối hợp
- Chấp thuận các điều khoản hợp đồng

PHẦN III: BẢO MẬT VÀ BẢO VỆ DỮ LIỆU

ĐIỀU 5: BẢNG BÍ MẬT THÔNG TIN
- Công ty sẽ giữ bí mật tất cả thông tin nhạy cảm của khách hàng
- Không tiết lộ cho bên thứ ba mà không có sự đồng ý
- Thời hạn bảo mật: 3 năm sau khi hợp đồng kết thúc

ĐIỀU 6: BẢO VỆ DỮ LIỆU CÁ NHÂN
- Công ty tuân thủ các luật bảo vệ dữ liệu
- Sử dụng mã hóa để bảo vệ thông tin
- Kiểm tra an ninh định kỳ

PHẦN IV: THANH TOÁN

ĐIỀU 7: ĐIỀU KHOẢN THANH TOÁN
- Khách hàng phải thanh toán theo lịch được nêu rõ
- Phương thức thanh toán: chuyển khoản ngân hàng
- Nếu trễ hạn quá 7 ngày, sẽ áp dụng lãi suất 0.1%/ngày
- Công ty có quyền tạm dừng dịch vụ nếu quá hạn 30 ngày

ĐIỀU 8: HÓA ĐƠN VÀ THANH TOÁN
- Công ty sẽ cấp hóa đơn theo lịch thanh toán
- Hóa đơn hợp lệ từ ngày cấp
- Khách hàng có 30 ngày để thanh toán từ ngày nhận hóa đơn

PHẦN V: ĐIỀU KHOẢN CHUNG

ĐIỀU 9: HIỆU LỰC CỦA HỢP ĐỒNG
- Hợp đồng có hiệu lực từ ngày ký bởi cả hai bên
- Có thể ký bằng chữ ký tay hoặc chữ ký điện tử
- Hợp đồng vẫn có hiệu lực cho tới khi được chấm dứt hợp pháp

ĐIỀU 10: CHẤM DỨT HỢP ĐỒNG
- Hợp đồng tự động kết thúc khi đạt được mục đích
- Một bên có thể chấm dứt sớm với thông báo trước 30 ngày
- Bên chấm dứt phải thanh toán các chi phí phát sinh đến ngày chấm dứt

ĐIỀU 11: TRÁCH NHIỆM LÀM HẠI
- Nếu Công ty gây thiệt hại cho Khách hàng do lỗi của mình:
  * Bồi thường số tiền bằng giá trị hợp đồng (tối đa)
  * Không bồi thường cho thiệt hại gián tiếp

- Nếu Khách hàng gây thiệt hại cho Công ty:
  * Bồi thường toàn bộ thiệt hại thực tế
  * Bao gồm cả chi phí pháp lý

ĐIỀU 12: MIỄN TRỪ TRÁCH NHIỆM
Công ty không chịu trách nhiệm trong trường hợp:
- Sự cố do lực lượng thiên nhiên (động đất, bão, v.v.)
- Chiến tranh, khủng bố, hoặc biến động chính trị
- Ngừng cung cấp dịch vụ Internet của nhà cung cấp
- Khách hàng vi phạm các điều khoản hợp đồng

ĐIỀU 13: LỜI TUYÊN BỐ VÀ CAM ĐOA
- Cả hai bên tuyên bố rằng có quyền ký hợp đồng này
- Cả hai bên tuyên bố rằng tất cả thông tin được cung cấp là chính xác
- Cả hai bên đồng ý tuân thủ tất cả các điều khoản

PHẦN VI: GIẢI QUYẾT TRANH CHẤP

ĐIỀU 14: HÒA GIẢI
- Nếu có tranh chấp, các bên sẽ cố gắng giải quyết thông qua hòa giải
- Hạn thời gian hòa giải: 30 ngày

ĐIỀU 15: TRỌNG TÀI
- Nếu hòa giải thất bại, tranh chấp sẽ được giải quyết bằng trọng tài
- Trọng tài sẽ được tiến hành theo Luật Trọng tài Quốc tế
- Địa điểm: Thành phố Hồ Chí Minh, Việt Nam

ĐIỀU 16: LUẬT ÁP DỤNG
Hợp đồng này được điều chỉnh bởi pháp luật Cộng hòa Xã hội chủ nghĩa Việt Nam.

PHẦN VII: ĐIỀU KHOẢN CUỐI

ĐIỀU 17: THAY ĐỔI HỢP ĐỒNG
- Bất kỳ thay đổi nào phải được thỏa thuận bằng văn bản
- Các điều khoản bổ sung phải được ký bởi cả hai bên
- Các điều khoản bổ sung có giá trị tương đương hợp đồng chính

ĐIỀU 18: HẾT HỢP ĐỒNG
- Hợp đồng này đại diện toàn bộ thỏa thuận giữa các bên
- Thay thế tất cả các thỏa thuận trước đó
- Nếu bất kỳ điều khoản nào bị coi là không hợp lệ, các điều khoản khác vẫn có hiệu lực`;

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={isDark ? "#FFF" : "#000"}
          />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.title}>
          Điều Khoản Chung
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.contentText}>
  {contract.fullContent}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <ThemedText style={styles.closeButtonText}>Đóng</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
  },
  closeButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#00A8E8",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

