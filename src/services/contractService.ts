import * as FileSystem from "expo-file-system/legacy";
import { handleApiError } from "../utils/errorUtils";
import apiClient from "./apiClient";

export const API_BASE_URL = "http://192.168.1.42:5000";
export const API_BASE_URL_PRODUCT = "https://contract.officeai.vn";

/**
 * Helper function to convert relative path to full URL
 */
export const getFullUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export interface Contract {
  id?: string;
  Id?: string;
  ContractName: string;
  ContractPath: string;
  ContractDate: string;
  Status: number;
}

export interface ContractApiResponse {
  message: string;
  data: Contract[];
  totalCount: number;
}

export const getContracts = async (accountId: string): Promise<Contract[]> => {
  try {
    const url = `${API_BASE_URL}/api/contracts?accountId=${accountId}`;
    const response = await apiClient.get(url);

    const result = response.data;
    if (Array.isArray(result)) {
      return result;
    }
    if (result && Array.isArray(result.data)) {
      return result.data;
    }

    console.log("getContracts: định dạng response không xác định", result);
    return [];
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};


export interface FdfData {
  [key: string]: string | number | boolean;
}

// Parse FDF content and extract field values
export const parseFdfData = (fdfContent: string): FdfData => {
  const data: FdfData = {};

  const fieldRegex = /\/T\s*\(\s*([^)]+)\s*\)\s*\/V\s*\(\s*([^)]*)\s*\)/g;

  let match;
  while ((match = fieldRegex.exec(fdfContent)) !== null) {
    const fieldName = match[1].trim();
    const fieldValue = match[2].trim();
    data[fieldName] = fieldValue;
  }

  return data;
};

// Fetch FDF data for a specific contract
export const fetchContractFdf = async (
  contractId: string,
  accountId: string,
): Promise<string> => {
  try {
    const url = `${API_BASE_URL}/api/contracts/${contractId}/fdf?accountId=${accountId}`;
    const response = await apiClient.get(url, {
      headers: {
        Accept: "application/x-fdf",
        "Content-Type": "application/x-fdf",
      },
    });

    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

// Get FDF file directly by URL
export const fetchFdfByUrl = async (fdfUrl: string): Promise<string> => {
  try {
    const fullUrl = fdfUrl.startsWith("http")
      ? fdfUrl
      : `${API_BASE_URL}${fdfUrl}`;

    const response = await apiClient.get(fullUrl, {
      responseType: "text",
    });

    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

// Fetch contract details with FDF data
export const fetchContractWithFdf = async (
  contractId: string,
  accountId: string,
): Promise<{ contractDetails: any; fdfData: FdfData }> => {
  try {
    const contractUrl = `${API_BASE_URL}/api/contracts/${contractId}?accountId=${accountId}`;
    const contractResponse = await apiClient.get(contractUrl);

    let fdfData: FdfData = {};
    if (contractResponse.data.fdfPath) {
      const fdfContent = await fetchFdfByUrl(contractResponse.data.fdfPath);
      fdfData = parseFdfData(fdfContent);
    }

    return {
      contractDetails: contractResponse.data,
      fdfData,
    };
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

/**
 * Gọi API GET /api/file-contract?ContractId=<id>
 * Tải file hợp đồng về thư mục cache, trả về local URI để hiển thị.
 */
export const getFileContract = async (contractId: string): Promise<string> => {
  const url = `${API_BASE_URL}/api/file-contract?ContractId=${contractId}`;

  const cacheDir = (FileSystem as any).cacheDirectory as string;
  if (!cacheDir) throw new Error("Không thể xác định thư mục cache.");

  const localUri = `${cacheDir}contract_${contractId}.pdf`;

  const fileInfo = await (FileSystem as any).getInfoAsync(localUri);
  if (fileInfo.exists) {
    return localUri;
  }

  try {
    const response = await apiClient.get(url, {
      responseType: "blob",
    });

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(",")[1];
        resolve(base64data);
      };
      reader.onerror = reject;
    });

    reader.readAsDataURL(response.data);
    const base64 = await base64Promise;

    await (FileSystem as any).writeAsStringAsync(localUri, base64, {
      encoding: (FileSystem as any).EncodingType.Base64,
    });

    return localUri;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface CheckCaResponse {
  Success?: boolean;
  Message?: string;
  Data?: boolean;
  success?: boolean;
  message?: string;
  data?: boolean;
}

export const checkCaStatus = async (accountId: string): Promise<CheckCaResponse> => {
  try {
    const url = `${API_BASE_URL}/api/check-ca?accountId=${accountId}`;
    const response = await apiClient.get(url);
    console.log("checkCaStatus: ", response.data);
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const submitKycInfo = async (accountId: string, model: any) => {
  try {
    const url = `${API_BASE_URL}/api/infoid?accountId=${accountId}`;
    const response = await apiClient.post(url, model, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface NormalizeAddressResponse {
  Success?: boolean;
  Message?: string;
  Data?: any;
  success?: boolean;
  message?: string;
  data?: any;
}

export const normalizeAddress = async (accountId: string): Promise<NormalizeAddressResponse> => {
  try {
    const url = `${API_BASE_URL}/api/customer/address?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 405) {
      const url = `${API_BASE_URL}/api/customer/address?accountId=${accountId}`;
      const retry = await apiClient.get(url);
      return retry.data;
    }
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface OrderCAResponse {
  Success?: boolean;
  Message?: string;
  Data?: any;
  success?: boolean;
  message?: string;
  data?: any;
}

export const orderCA = async (accountId: string): Promise<OrderCAResponse> => {
  try {
    const url = `${API_BASE_URL}/api/order-ca?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    const result = response.data;

    // --- Kiểm tra lỗi nghiệp vụ từ Viettel nằm trong XML Data (mặc dù top-level Success: true) ---
    if (result.Data && typeof result.Data === 'string' && result.Data.includes('<success>false</success>')) {
      const match = result.Data.match(/<description>(.*?)<\/description>/);
      if (match && match[1]) {
        let description = match[1];
        // Tách chuỗi sau dấu ":" cuối cùng để lấy thông báo lỗi thân thiện (bỏ qua các mã code CDVA...)
        const lastColonIndex = description.lastIndexOf(':');
        if (lastColonIndex !== -1) {
          description = description.substring(lastColonIndex + 1).trim();
        }

        console.warn("[orderCA Debug] - Phát hiện lỗi Viettel trong XML:", description);

        // Ghi đè trạng thái và message để các màn hình phía trên (như IDInformationScreen) hiển thị đúng lỗi
        result.Success = false;
        result.success = false;
        result.Message = description;
        result.message = description;
      }
    }

    if (result.Success || result.success) {
      viewOrder(accountId).catch((err) =>
        console.log("Lỗi gọi ngầm viewOrder:", err)
      );
    }
    return result;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface OrderInfoData {
  FullName?: string;
  DateOfBirth?: string;
  Gender?: string;
  PermanentAddress?: string;
  OrderID?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  permanentAddress?: string;
  orderId?: string;
}

export interface OrderInfoResponse {
  Success?: boolean;
  Message?: string;
  Data?: OrderInfoData;
  success?: boolean;
  message?: string;
  data?: OrderInfoData;
}

export const getOrderInfo = async (accountId: string): Promise<OrderInfoResponse> => {
  try {
    const url = `${API_BASE_URL}/api/order/customer?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 405) {
      const url = `${API_BASE_URL}/api/order/customer?accountId=${accountId}`;
      const retry = await apiClient.get(url);
      return retry.data;
    }
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const approveHandOver = async (accountId: string) => {
  try {
    const url = `${API_BASE_URL}/api/approve-handover?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const viewOrder = async (accountId: string) => {
  try {
    console.log(`[viewOrder Debug] - Đang gọi API with accountId: ${accountId}`);
    const url = `${API_BASE_URL}/api/view-order?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    console.log("[viewOrder Debug] - Kết quả từ API view-order:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("[viewOrder Debug] - Lỗi khi gọi API view-order:", error);
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface CertificateCloudCaInfo {
  id?: number;
  requestId?: string;
  fromDate?: string;
  toDate?: string;
  issuer?: string;
  serialNumber?: string;
  subject?: string;
  createdDate?: string;
  FromDate?: string;
  ToDate?: string;
  Issuer?: string;
  SerialNumber?: string;
  Subject?: string;
}

export const getCloudCaInfo = async (accountId: string) => {
  try {
    const url = `${API_BASE_URL}/api/cloud-ca-info?accountId=${accountId}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface CertInfo {
  id?: number;
  requestId?: string;
  credentialId?: string;
  subscriberId?: string;
  phoneNumber?: string;
  certStatus?: string;
  issuerDN?: string;
  subjectDN?: string;
  serialNumber?: string;
  validFrom?: string;
  validTo?: string;
  CredentialId?: string;
  SubscriberId?: string;
  PhoneNumber?: string;
  CertStatus?: string;
  IssuerDN?: string;
  SubjectDN?: string;
  SerialNumber?: string;
  ValidFrom?: string;
  ValidTo?: string;
  Id?: number;
}

export interface CertInfoResponse {
  success?: boolean;
  message?: string;
  data?: CertInfo[];
  Success?: boolean;
  Message?: string;
  Data?: CertInfo[];
}

export const importCertificate = async (accountId: string): Promise<CertInfoResponse> => {
  try {
    const url = `${API_BASE_URL}/api/import-cert?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getCertInfo = async (accountId: string, validFrom?: string): Promise<CertInfoResponse> => {
  try {
    let url = `${API_BASE_URL}/api/cert-info?accountId=${accountId}`;
    if (validFrom) {
      url += `&validFrom=${encodeURIComponent(validFrom)}`;
    }
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface CertificateItem {
  CredentialId?: string;
  CertificateData?: string[];
  credentialId?: string;
  certificateData?: string[];
}

export interface CertificatesResponse {
  Success?: boolean;
  Message?: string;
  Data?: CertificateItem[];
  success?: boolean;
  message?: string;
  data?: CertificateItem[];
}

export const getCertificates = async (accountId: string): Promise<CertificatesResponse> => {
  try {
    const url = `${API_BASE_URL}/api/certificates?accountId=${accountId}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getCertificateDetail = async (accountId: string, id: number): Promise<CertInfoResponse> => {
  try {
    const url = `${API_BASE_URL}/api/cert-info-detail?accountId=${accountId}&id=${id}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const confirmSign = async (accountId: string) => {
  try {
    const url = `${API_BASE_URL}/api/confirm-sign?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const resendOtp = async (accountId: string) => {
  try {
    const url = `${API_BASE_URL}/api/resend-otp?accountId=${accountId}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const confirmOtp = async (accountId: string, otpCode: string) => {
  try {
    const url = `${API_BASE_URL}/api/confirm-otp?accountId=${accountId}&otpCode=${otpCode}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const submitKycImages = async (accountId: string, formData: FormData) => {
  try {
    const url = `${API_BASE_URL}/api/imageid?accountId=${accountId}`;
    const response = await apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface CustomerRequestDTO {
  FullName: string;
  Phone?: string;
  Email?: string;
  IsCA: boolean;
}

export const checkCustomerExist = async (accountId: string) => {
  try {
    const url = `${API_BASE_URL}/api/check-customer-exist?accountId=${accountId}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const addOrUpdateCustomer = async (accountId: string, model: CustomerRequestDTO) => {
  try {
    const url = `${API_BASE_URL}/api/customer?accountId=${accountId}`;
    const response = await apiClient.post(url, model, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getIdNumber = async (accountId: string) => {
  try {
    const url = `${API_BASE_URL}/api/id-number?accountId=${accountId}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface CloudCaInsertSignPayload {
  contractId: string;
  fieldName: string;
  signatureBase64: string;
}

export const insertCloudCaSign = async (payload: CloudCaInsertSignPayload) => {
  try {
    const url = "https://contract.officeai.vn/contract/api/cloudca-insert-sign";
    const response = await apiClient.post(url, payload, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getSignature = async (filename: string, certificateId: string, filehash: string, contractId: string, accountId: string) => {
  try {
    const url = `${API_BASE_URL}/api/get-signature?filename=${encodeURIComponent(filename)}&certificateId=${encodeURIComponent(certificateId)}&filehash=${encodeURIComponent(filehash)}&contractId=${encodeURIComponent(contractId)}&accountId=${encodeURIComponent(accountId)}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true, timeout: 120000 });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export interface CloudCaHashPayload {
  contractId: string;
  signImageBase64: string;
  certChainBase64: string[];
}

export const getCloudCaHash = async (payload: CloudCaHashPayload) => {
  try {
    const url = "https://contract.officeai.vn/contract/api/cloudca-get-hash";
    const response = await apiClient.post(url, payload, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};
