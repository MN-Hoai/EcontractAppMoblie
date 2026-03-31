import * as FileSystem from "expo-file-system/legacy";
import { handleApiError } from "../../utils/error-utils";
import apiClient from "../api-client";
import { ENV } from "../../config/env";
import { CONTRACT_ENDPOINTS } from "./contract-constants";
import type {
  Contract,
  FdfData,
  CheckCaResponse,
  OrderCAResponse,
  OrderInfoResponse,
} from "./contract-types";

const BASE = ENV.API_CONTRACT_LOCAL_URL;

/**
 * Helper function to convert relative path to full URL
 */
export const getFullUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const getContracts = async (accountId: string): Promise<Contract[]> => {
  try {
    const url = `${BASE}${CONTRACT_ENDPOINTS.LIST(accountId)}`;
    const response = await apiClient.get(url);
    const result = response.data;
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.data)) return result.data;
    console.log("getContracts: định dạng response không xác định", result);
    return [];
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

// Parse FDF content and extract field values
export const parseFdfData = (fdfContent: string): FdfData => {
  const data: FdfData = {};
  const fieldRegex = /\/T\s*\(\s*([^)]+)\s*\)\s*\/V\s*\(\s*([^)]*)\s*\)/g;
  let match;
  while ((match = fieldRegex.exec(fdfContent)) !== null) {
    data[match[1].trim()] = match[2].trim();
  }
  return data;
};

export const fetchContractFdf = async (
  contractId: string,
  accountId: string
): Promise<string> => {
  try {
    const url = `${BASE}${CONTRACT_ENDPOINTS.FDF(contractId, accountId)}`;
    const response = await apiClient.get(url, {
      headers: { Accept: "application/x-fdf", "Content-Type": "application/x-fdf" },
    });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const fetchFdfByUrl = async (fdfUrl: string): Promise<string> => {
  try {
    const fullUrl = fdfUrl.startsWith("http") ? fdfUrl : `${BASE}${fdfUrl}`;
    const response = await apiClient.get(fullUrl, { responseType: "text" });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const fetchContractWithFdf = async (
  contractId: string,
  accountId: string
): Promise<{ contractDetails: any; fdfData: FdfData }> => {
  try {
    const url = `${BASE}${CONTRACT_ENDPOINTS.DETAIL(contractId, accountId)}`;
    const contractResponse = await apiClient.get(url);
    let fdfData: FdfData = {};
    if (contractResponse.data.fdfPath) {
      const fdfContent = await fetchFdfByUrl(contractResponse.data.fdfPath);
      fdfData = parseFdfData(fdfContent);
    }
    return { contractDetails: contractResponse.data, fdfData };
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getFileContract = async (contractId: string): Promise<string> => {
  const url = `${BASE}${CONTRACT_ENDPOINTS.FILE(contractId)}`;
  const cacheDir = (FileSystem as any).cacheDirectory as string;
  if (!cacheDir) throw new Error("Không thể xác định thư mục cache.");
  const localUri = `${cacheDir}contract_${contractId}.pdf`;
  const fileInfo = await (FileSystem as any).getInfoAsync(localUri);
  if (fileInfo.exists) return localUri;
  try {
    const response = await apiClient.get(url, { responseType: "blob" });
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

export const checkCaStatus = async (accountId: string): Promise<CheckCaResponse> => {
  try {
    const url = `${BASE}${CONTRACT_ENDPOINTS.CHECK_CA(accountId)}`;
    const response = await apiClient.get(url);
    console.log("checkCaStatus: ", response.data);
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const orderCA = async (accountId: string): Promise<OrderCAResponse> => {
  try {
    const url = `${BASE}${CONTRACT_ENDPOINTS.ORDER_CA(accountId)}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    const result = response.data;
    // --- Kiểm tra lỗi nghiệp vụ từ Viettel nằm trong XML Data ---
    if (result.Data && typeof result.Data === "string" && result.Data.includes("<success>false</success>")) {
      const match = result.Data.match(/<description>(.*?)<\/description>/);
      if (match && match[1]) {
        let description = match[1];
        const lastColonIndex = description.lastIndexOf(":");
        if (lastColonIndex !== -1) description = description.substring(lastColonIndex + 1).trim();
        console.warn("[orderCA Debug] - Phát hiện lỗi Viettel trong XML:", description);
        result.Success = false;
        result.success = false;
        result.Message = description;
        result.message = description;
      }
    }
    if (result.Success || result.success) {
      viewOrder(accountId).catch((err) => console.log("Lỗi gọi ngầm viewOrder:", err));
    }
    return result;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getOrderInfo = async (accountId: string): Promise<OrderInfoResponse> => {
  try {
    const url = `${BASE}${CONTRACT_ENDPOINTS.ORDER_INFO(accountId)}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 405) {
      const url = `${BASE}${CONTRACT_ENDPOINTS.ORDER_INFO(accountId)}`;
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
    const url = `${BASE}${CONTRACT_ENDPOINTS.APPROVE_HANDOVER(accountId)}`;
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
    const url = `${BASE}${CONTRACT_ENDPOINTS.VIEW_ORDER(accountId)}`;
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
