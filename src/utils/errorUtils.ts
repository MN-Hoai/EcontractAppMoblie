import { AxiosError } from "axios";

/**
 * Phân loại lỗi và trả về thông báo lỗi thân thiện cho người dùng.
 * Các lỗi liên quan đến Token sẽ chỉ được log ra terminal mà không hiển thị cho người dùng.
 */
export const handleApiError = (error: any): string | null => {
  // Log chi tiết lỗi ra terminal phục vụ debug
  console.log("[API Error Debug]:", {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
    url: error.config?.url,
    method: error.config?.method,
    // Hiển thị một phần token để bảo mật nhưng vẫn đủ để check
    authHeader: error.config?.headers?.Authorization ? 
      `${error.config.headers.Authorization.substring(0, 15)}...` : "None",
  });

  // Kiểm tra nếu là lỗi Token (401 hoặc thông báo hết hạn cụ thể)
  const isTokenError = 
    error.response?.status === 401 || 
    (error.response?.data && 
     error.response.data.message === "Token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token qua Server A.");

  if (isTokenError) {
    console.log("Terminal: Lỗi Token đã được xử lý ngầm (Refresh/Logout).");
    return null; // Không trả về lỗi để hiển thị cho người dùng
  }

  // Nếu là lỗi mạng không kết nối được
  if (!error.response) {
    return "Không thể kết nối với máy chủ. Vui lòng kiểm tra lại mạng của bạn.";
  }

  // Phân loại mã trạng thái HTTP
  const status = error.response.status;
  
  if (status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.";
  }

  if (status === 404) {
    return "Không tìm thấy dữ liệu yêu cầu.";
  }

  if (status === 403) {
    return "Bạn không có quyền thực hiện hành động này.";
  }

  if (status === 400) {
    // Trả về thông báo lỗi từ server nếu có
    return error.response.data?.message || "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
  }

  // Mặc định trả về thông báo chung
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};
