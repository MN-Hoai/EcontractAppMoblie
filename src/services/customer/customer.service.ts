import { handleApiError } from "../../utils/error-utils";
import apiClient from "../api-client";
import { ENV } from "../../config/env";
import { CUSTOMER_ENDPOINTS } from "./customer-constants";
import type { CustomerRequest, NormalizeAddressResponse } from "./customer-types";

const BASE = ENV.API_CONTRACT_LOCAL_URL;

export const checkCustomerExist = async (accountId: string) => {
  try {
    const url = `${BASE}${CUSTOMER_ENDPOINTS.CHECK_EXIST(accountId)}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const addOrUpdateCustomer = async (accountId: string, model: CustomerRequest) => {
  try {
    const url = `${BASE}${CUSTOMER_ENDPOINTS.ADD_OR_UPDATE(accountId)}`;
    const response = await apiClient.post(url, model, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const normalizeAddress = async (accountId: string): Promise<NormalizeAddressResponse> => {
  try {
    const url = `${BASE}${CUSTOMER_ENDPOINTS.NORMALIZE_ADDRESS(accountId)}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 405) {
      const url = `${BASE}${CUSTOMER_ENDPOINTS.NORMALIZE_ADDRESS(accountId)}`;
      const retry = await apiClient.get(url);
      return retry.data;
    }
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const submitKycInfo = async (accountId: string, model: any) => {
  try {
    const url = `${BASE}${CUSTOMER_ENDPOINTS.SUBMIT_KYC_INFO(accountId)}`;
    const response = await apiClient.post(url, model, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const submitKycImages = async (accountId: string, formData: FormData) => {
  try {
    const url = `${BASE}${CUSTOMER_ENDPOINTS.SUBMIT_KYC_IMAGES(accountId)}`;
    const response = await apiClient.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getIdNumber = async (accountId: string) => {
  try {
    const url = `${BASE}${CUSTOMER_ENDPOINTS.ID_NUMBER(accountId)}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};
