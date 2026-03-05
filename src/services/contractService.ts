import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";

const API_BASE_URL = "http://192.168.1.86:5000";

export interface Contract {
  ContractId: string;
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
    const response = await axios.get(url);

    // Xử lý cả 2 trường hợp: API trả về array trực tiếp hoặc { data: [...] }
    const result = response.data;
    if (Array.isArray(result)) {
      return result;
    }
    if (result && Array.isArray(result.data)) {
      return result.data;
    }

    console.warn("getContracts: định dạng response không xác định", result);
    return [];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
};


export interface FdfData {
  [key: string]: string | number | boolean;
}

// Parse FDF content and extract field values
export const parseFdfData = (fdfContent: string): FdfData => {
  const data: FdfData = {};

  // FDF format typically looks like:
  // /T (FieldName) /V (Field Value)
  // This regex extracts field names and values
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
    const response = await axios.get(url, {
      headers: {
        Accept: "application/x-fdf",
        "Content-Type": "application/x-fdf",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching FDF:", error);
    throw error;
  }
};

// Get FDF file directly by URL
export const fetchFdfByUrl = async (fdfUrl: string): Promise<string> => {
  try {
    const fullUrl = fdfUrl.startsWith("http")
      ? fdfUrl
      : `${API_BASE_URL}${fdfUrl}`;

    const response = await axios.get(fullUrl, {
      responseType: "text",
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching FDF by URL:", error);
    throw error;
  }
};

// Fetch contract details with FDF data
export const fetchContractWithFdf = async (
  contractId: string,
  accountId: string,
): Promise<{ contractDetails: any; fdfData: FdfData }> => {
  try {
    // Fetch contract details
    const contractUrl = `${API_BASE_URL}/api/contracts/${contractId}?accountId=${accountId}`;
    const contractResponse = await axios.get(contractUrl);

    // Fetch FDF data if available
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
    console.error("Error fetching contract with FDF:", error);
    throw error;
  }
};

/**
 * Gọi API GET /api/file-contract?ContractId=<id>
 * Tải file hợp đồng về thư mục cache, trả về local URI để hiển thị.
 */
export const getFileContract = async (contractId: string): Promise<string> => {
  const url = `${API_BASE_URL}/api/file-contract?ContractId=${contractId}`;

  // Tạo tên file tạm trong cache
  const cacheDir = (FileSystem as any).cacheDirectory as string;
  if (!cacheDir) throw new Error("Không thể xác định thư mục cache.");

  const localUri = `${cacheDir}contract_${contractId}.pdf`;

  // Kiểm tra nếu file đã cache thì dùng luôn
  const fileInfo = await (FileSystem as any).getInfoAsync(localUri);
  if (fileInfo.exists) {
    return localUri;
  }

  // Download file từ server
  const result = await (FileSystem as any).downloadAsync(url, localUri);
  if (result.status !== 200) {
    throw new Error(`Tải file hợp đồng thất bại (HTTP ${result.status})`);
  }

  return result.uri as string;
};

export interface CheckCaResponse {
  Success?: boolean;
  Message?: string;
  Data?: boolean;
  // Cả trường hợp camelCase
  success?: boolean;
  message?: string;
  data?: boolean;
}

export const checkCaStatus = async (accountId: string): Promise<CheckCaResponse> => {
  try {
    const url = `${API_BASE_URL}/api/check-ca?accountId=${accountId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error checking CA status:", error);
    throw error;
  }
};

export const submitKycInfo = async (accountId: string, model: any) => {
  try {
    const url = `${API_BASE_URL}/api/infoid?accountId=${accountId}`;
    const response = await axios.post(url, model);
    return response.data;
  } catch (error) {
    console.error("Error submitting KYC info:", error);
    throw error;
  }
};

export const submitKycImages = async (accountId: string, formData: FormData) => {
  try {
    const url = `${API_BASE_URL}/api/imageid?accountId=${accountId}`;
    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting KYC images:", error);
    throw error;
  }
};
