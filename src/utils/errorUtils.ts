import { AxiosError } from "axios";

/**
 * Phân loại lỗi và trả về thông báo lỗi thân thiện cho người dùng.
 * Các lỗi liên quan đến Token sẽ chỉ được log ra terminal mà không hiển thị cho người dùng.
 */
export const handleApiError = (error: any): string | null => {
  // Log chi tiết lỗi ra terminal phục vụ debug
  const status = error.response?.status;
  const data = error.response?.data;
  const config = error.config;

  console.log("[API Error Debug]:", {
    status,
    data,
    message: error.message,
    url: config?.url,
    method: config?.method,
    authHeader: config?.headers?.Authorization ? 
      `${config.headers.Authorization.substring(0, 15)}...` : "None",
  });

  // Kiểm tra nếu là lỗi Token
  const isTokenError = 
    status === 401 || 
    (data?.message === "Token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token qua Server A.");

  if (isTokenError) {
    console.log("Terminal: Lỗi Token đã được xử lý ngầm.");
    return null;
  }

  // Nếu server có trả về message cụ thể trong body, lấy nó ngay lập tức
  const serverMsg = data?.message || data?.Message || (typeof data === 'string' ? data : null);
  if (serverMsg) {
    return serverMsg;
  }

  // Nếu là lỗi mạng không kết nối được
  if (!error.response) {
    return "Không thể kết nối với máy chủ. Vui lòng kiểm tra mạng.";
  }

  // Phân loại mã trạng thái HTTP nếu không có body message
  if (status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }

  if (status === 404) {
    return "Không tìm thấy dữ liệu yêu cầu.";
  }

  if (status === 403) {
    return "Bạn không có quyền thực hiện hành động này.";
  }

  // Mặc định trả về thông báo chung
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};
