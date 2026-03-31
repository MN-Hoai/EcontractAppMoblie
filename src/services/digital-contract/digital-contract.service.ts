import { handleApiError } from "../../utils/error-utils";
import apiClient from "../api-client";
import { DIGITAL_CONTRACT_ENDPOINTS } from "./digital-contract-constants";
import type { ContractListResponse } from "./digital-contract-types";

/**
 * Get digital contracts list
 */
export const getDigitalContracts = async (
  tab: string,
  page: number = 1,
  limit: number = 10,
  hasCount: boolean = true,
  keyword: string = ""
): Promise<ContractListResponse> => {
  try {
    const response = await apiClient.get<ContractListResponse>(DIGITAL_CONTRACT_ENDPOINTS.LIST, {
      params: { tab, page, limit, hasCount, keyword },
    });
    return response.data;
  } catch (error: any) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};
