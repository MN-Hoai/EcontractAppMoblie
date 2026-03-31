import { handleApiError } from "../../utils/error-utils";
import apiClient from "../api-client";
import { ENV } from "../../config/env";
import { CERTIFICATE_ENDPOINTS } from "./certificate-constants";
import type { CertInfoResponse, CertificatesResponse } from "./certificate-types";

const BASE = ENV.API_CONTRACT_LOCAL_URL;

export const getCloudCaInfo = async (accountId: string) => {
  try {
    const url = `${BASE}${CERTIFICATE_ENDPOINTS.CLOUD_CA_INFO(accountId)}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const importCertificate = async (accountId: string): Promise<CertInfoResponse> => {
  try {
    const url = `${BASE}${CERTIFICATE_ENDPOINTS.IMPORT_CERT(accountId)}`;
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
    const url = `${BASE}${CERTIFICATE_ENDPOINTS.CERT_INFO(accountId, validFrom)}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};

export const getCertificates = async (accountId: string): Promise<CertificatesResponse> => {
  try {
    const url = `${BASE}${CERTIFICATE_ENDPOINTS.CERTIFICATES(accountId)}`;
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
    const url = `${BASE}${CERTIFICATE_ENDPOINTS.CERT_DETAIL(accountId, id)}`;
    const response = await apiClient.get(url, { _skipAlert: true });
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (message) throw new Error(message);
    throw error;
  }
};
