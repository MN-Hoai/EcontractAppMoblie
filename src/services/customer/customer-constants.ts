/**
 * Customer service endpoints & query keys
 */

export const CUSTOMER_ENDPOINTS = {
  CHECK_EXIST: (accountId: string) =>
    `/api/check-customer-exist?accountId=${accountId}`,
  ADD_OR_UPDATE: (accountId: string) =>
    `/api/customer?accountId=${accountId}`,
  NORMALIZE_ADDRESS: (accountId: string) =>
    `/api/customer/address?accountId=${accountId}`,
  SUBMIT_KYC_INFO: (accountId: string) =>
    `/api/infoid?accountId=${accountId}`,
  SUBMIT_KYC_IMAGES: (accountId: string) =>
    `/api/imageid?accountId=${accountId}`,
  ID_NUMBER: (accountId: string) =>
    `/api/id-number?accountId=${accountId}`,
} as const;

/**
 * Query keys for React Query
 */
export const CUSTOMER_KEYS = {
  all: ["customer"] as const,
  checkExist: (accountId: string) =>
    [...CUSTOMER_KEYS.all, "check-exist", accountId] as const,
  idNumber: (accountId: string) =>
    [...CUSTOMER_KEYS.all, "id-number", accountId] as const,
};
