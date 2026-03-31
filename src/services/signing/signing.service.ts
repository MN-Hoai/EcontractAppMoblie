import { handleApiError } from "../../utils/error-utils";
import apiClient from "../api-client";
import { ENV } from "../../config/env";
import { SIGNING_ENDPOINTS } from "./signing-constants";
import type { CloudCaHashPayload, CloudCaInsertSignPayload } from "./signing-types";

const BASE = ENV.API_CONTRACT_LOCAL_URL;

export const getCloudCaHash = async (payload: CloudCaHashPayload) => {
  try {
    const url = `${ENV.API_CONTRACT_URL}${SIGNING_ENDPOINTS.CLOUD_CA_HASH}`;
    const response = await apiClient.post(url, payload, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getSignature = async (
  filename: string,
  certificateId: string,
  filehash: string,
  contractId: string,
  accountId: string
) => {
  try {
    const url = `${BASE}${SIGNING_ENDPOINTS.GET_SIGNATURE({ filename, certificateId, filehash, contractId, accountId })}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true, timeout: 120000 });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const insertCloudCaSign = async (payload: CloudCaInsertSignPayload) => {
  try {
    const url = `${ENV.API_CONTRACT_URL}${SIGNING_ENDPOINTS.INSERT_SIGN}`;
    const response = await apiClient.post(url, payload, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const confirmSign = async (accountId: string) => {
  try {
    const url = `${BASE}${SIGNING_ENDPOINTS.CONFIRM_SIGN(accountId)}`;
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
    const url = `${BASE}${SIGNING_ENDPOINTS.RESEND_OTP(accountId)}`;
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
    const url = `${BASE}${SIGNING_ENDPOINTS.CONFIRM_OTP(accountId, otpCode)}`;
    const response = await apiClient.post(url, {}, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};
