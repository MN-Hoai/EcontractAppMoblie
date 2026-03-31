/**
 * Contract service endpoints & query keys
 */

export const CONTRACT_ENDPOINTS = {
  LIST: (accountId: string) => `/api/contracts?accountId=${accountId}`,
  DETAIL: (contractId: string, accountId: string) =>
    `/api/contracts/${contractId}?accountId=${accountId}`,
  FDF: (contractId: string, accountId: string) =>
    `/api/contracts/${contractId}/fdf?accountId=${accountId}`,
  FILE: (contractId: string) => `/api/file-contract?ContractId=${contractId}`,
  CHECK_CA: (accountId: string) => `/api/check-ca?accountId=${accountId}`,
  ORDER_CA: (accountId: string) => `/api/order-ca?accountId=${accountId}`,
  VIEW_ORDER: (accountId: string) => `/api/view-order?accountId=${accountId}`,
  ORDER_INFO: (accountId: string) =>
    `/api/order/customer?accountId=${accountId}`,
  APPROVE_HANDOVER: (accountId: string) =>
    `/api/approve-handover?accountId=${accountId}`,
} as const;

/**
 * Query keys for React Query
 */
export const CONTRACT_KEYS = {
  all: ["contract"] as const,
  list: (accountId: string) =>
    [...CONTRACT_KEYS.all, "list", accountId] as const,
  fdf: (contractId: string, accountId: string) =>
    [...CONTRACT_KEYS.all, "fdf", contractId, accountId] as const,
  withFdf: (contractId: string, accountId: string) =>
    [...CONTRACT_KEYS.all, "with-fdf", contractId, accountId] as const,
  checkCa: (accountId: string) =>
    [...CONTRACT_KEYS.all, "check-ca", accountId] as const,
  orderInfo: (accountId: string) =>
    [...CONTRACT_KEYS.all, "order-info", accountId] as const,
};
